import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ReplacedSessionContext,
} from "@mariozechner/pi-coding-agent";
import { readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const skillsPath = resolve(packageRoot, "skills");

type Issue = {
  relativePath: string;
};

type ImplementContext = ExtensionCommandContext | ReplacedSessionContext;

async function discoverIssues(cwd: string, args: string): Promise<Issue[]> {
  const target = resolve(cwd, args.trim() || "docs/issues");
  const targetStat = await stat(target);
  const paths = targetStat.isDirectory()
    ? (await readdir(target))
        .filter((entry) => entry.endsWith(".md"))
        .sort((a, b) => a.localeCompare(b))
        .map((entry) => join(target, entry))
    : [target];

  return paths.map((path) => ({
    relativePath: relative(cwd, path) || basename(path),
  }));
}

function implementationPrompt(issue: Issue, index: number, total: number): string {
  return `Implement issue ${index + 1} of ${total}: ${issue.relativePath}

Use a clean-session implementation flow:
- First read ${issue.relativePath}, then inspect the relevant code before editing.
- Implement only this issue's scope.
- Prefer TDD/red-green-refactor when practical: one behavior, one test, minimal implementation, then refactor.
- Keep changes focused and avoid unrelated refactors.
- Run the relevant checks/tests before finishing.
- In your final response, include the issue path, what changed, and what checks ran.`;
}

async function implementIssue(ctx: ImplementContext, issues: Issue[], index: number): Promise<void> {
  const issue = issues[index];
  const parentSession = ctx.sessionManager.getSessionFile();

  const result = await ctx.newSession({
    parentSession,
    withSession: async (nextCtx) => {
      nextCtx.ui.notify(
        `tbyi: implementing ${index + 1}/${issues.length}: ${issue.relativePath}`,
        "info",
      );

      await nextCtx.sendUserMessage(implementationPrompt(issue, index, issues.length));
      await nextCtx.waitForIdle();

      if (index + 1 < issues.length) {
        await implementIssue(nextCtx, issues, index + 1);
      } else {
        nextCtx.ui.notify("tbyi: finished implementing all queued issues", "info");
      }
    },
  });

  if (result.cancelled) {
    ctx.ui.notify("tbyi: implementation queue cancelled", "warning");
  }
}

export default function (pi: ExtensionAPI) {
  pi.on("resources_discover", () => ({
    skillPaths: [skillsPath],
  }));

  pi.registerCommand("tbyi-info", {
    description: "Show information about the Think Before You Implement skill pack.",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "pi-tbyi loaded: /skill:grill-me, /skill:to-prd, /skill:to-issues, /skill:tdd, /tbyi-implement",
        "info",
      );
    },
  });

  pi.registerCommand("tbyi-implement", {
    description:
      "Implement local docs/issues/*.md issues one by one, each in a clean session. Optional arg: issue file or directory.",
    handler: async (args, ctx) => {
      await ctx.waitForIdle();

      let issues: Issue[];
      try {
        issues = await discoverIssues(ctx.cwd, args);
      } catch (error) {
        ctx.ui.notify(
          `tbyi: could not read issues (${error instanceof Error ? error.message : String(error)})`,
          "error",
        );
        return;
      }

      if (issues.length === 0) {
        ctx.ui.notify("tbyi: no Markdown issue files found", "warning");
        return;
      }

      ctx.ui.notify(`tbyi: queued ${issues.length} issue(s) for implementation`, "info");
      await implementIssue(ctx, issues, 0);
    },
  });
}
