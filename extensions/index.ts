import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ReplacedSessionContext,
} from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const skillsPath = resolve(packageRoot, "skills");
const MANUAL_PATH_CHOICE = "Enter another path…";
const REPAIR_ATTEMPTS = 3;

type ImplementContext = ExtensionCommandContext | ReplacedSessionContext;
type StatusValue = "incomplete" | "blocked" | "complete";

type ParsedArgs = {
  all: boolean;
  prdArg?: string;
};

type StatusHeader = {
  status: StatusValue;
  blocked_reason?: string | null;
};

type StatusValidation =
  | { valid: true; header: StatusHeader }
  | { valid: false; error: string };

type PrdTarget = {
  absolutePath: string;
  relativePath: string;
  statusAbsolutePath: string;
  statusRelativePath: string;
};

function tokenizeArgs(args: string): string[] {
  const tokens: string[] = [];
  const matcher = /"([^"]+)"|'([^']+)'|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(args)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }

  return tokens;
}

function parseArgs(args: string): ParsedArgs {
  const tokens = tokenizeArgs(args);
  const all = tokens.includes("--all");
  const prdTokens = tokens.filter((token) => token !== "--all");

  return {
    all,
    prdArg: prdTokens.length > 0 ? prdTokens.join(" ") : undefined,
  };
}

function statusPathForPrd(prdPath: string): string {
  return prdPath.replace(/\.md$/i, ".status.md");
}

function toPrdTarget(cwd: string, prdArg: string): PrdTarget {
  const absolutePath = resolve(cwd, prdArg.trim());
  const statusAbsolutePath = statusPathForPrd(absolutePath);

  return {
    absolutePath,
    relativePath: relative(cwd, absolutePath) || basename(absolutePath),
    statusAbsolutePath,
    statusRelativePath: relative(cwd, statusAbsolutePath) || basename(statusAbsolutePath),
  };
}

async function choosePrd(cwd: string, ctx: ExtensionCommandContext): Promise<string | undefined> {
  if (!ctx.hasUI) {
    ctx.ui.notify("tbyi: PRD path is required when UI is unavailable", "error");
    return undefined;
  }

  let prdEntries: string[] = [];
  try {
    const entries = await readdir(resolve(cwd, "docs/prds"));
    const entrySet = new Set(entries);
    prdEntries = entries
      .filter((entry) => entry.endsWith(".md"))
      .filter((entry) => {
        if (!entry.endsWith(".status.md")) return true;
        return !entrySet.has(entry.replace(/\.status\.md$/i, ".md"));
      })
      .sort((a, b) => a.localeCompare(b))
      .map((entry) => join("docs/prds", entry));
  } catch {
    // Fall through to manual path entry.
  }

  const choices = [...prdEntries, MANUAL_PATH_CHOICE];
  const choice = await ctx.ui.select("Select PRD to implement:", choices);
  if (!choice) return undefined;

  if (choice !== MANUAL_PATH_CHOICE) return choice;

  const manualPath = await ctx.ui.input("PRD path:", "docs/prds/example.md");
  return manualPath?.trim() || undefined;
}

async function ensureMarkdownFile(path: string): Promise<void> {
  const pathStat = await stat(path);
  if (pathStat.isDirectory()) {
    throw new Error("expected a Markdown file, got a directory");
  }
  if (!path.endsWith(".md")) {
    throw new Error("expected a Markdown file ending in .md");
  }
}

async function ensureStatusFile(target: PrdTarget): Promise<void> {
  try {
    await stat(target.statusAbsolutePath);
    return;
  } catch {
    const content = `{
  "status": "incomplete",
  "blocked_reason": null
}

PRD: ${target.relativePath}

## Implemented

Nothing yet.

## Missing

Not assessed yet.

## Notes

Status file created by /tbyi-implement.
`;
    await writeFile(target.statusAbsolutePath, content, "utf8");
  }
}

function parseJsonHeader(content: string): unknown {
  const trimmedStart = content.match(/^\s*/)?.[0].length ?? 0;
  if (content[trimmedStart] !== "{") {
    throw new Error("status file must start with a JSON object header");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = trimmedStart; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(content.slice(trimmedStart, index + 1));
      }
    }
  }

  throw new Error("could not find the end of the JSON header");
}

function validateStatusContent(content: string): StatusValidation {
  let parsed: unknown;
  try {
    parsed = parseJsonHeader(content);
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : String(error) };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { valid: false, error: "JSON header must be an object" };
  }

  const header = parsed as Record<string, unknown>;
  if (typeof header.status !== "string") {
    return { valid: false, error: "JSON header must include string property `status`" };
  }

  const status = header.status.toLowerCase();
  if (status !== "incomplete" && status !== "blocked" && status !== "complete") {
    return {
      valid: false,
      error: "`status` must be one of: incomplete, blocked, complete",
    };
  }

  const blockedReason = header.blocked_reason;
  if (
    blockedReason !== undefined &&
    blockedReason !== null &&
    typeof blockedReason !== "string"
  ) {
    return { valid: false, error: "`blocked_reason` must be a string, null, or absent" };
  }

  if (status === "blocked" && (typeof blockedReason !== "string" || blockedReason.trim() === "")) {
    return {
      valid: false,
      error: "`blocked_reason` must be a non-empty string when status is blocked",
    };
  }

  return {
    valid: true,
    header: {
      status,
      blocked_reason: typeof blockedReason === "string" ? blockedReason : null,
    },
  };
}

async function validateStatusFile(statusPath: string): Promise<StatusValidation> {
  const content = await readFile(statusPath, "utf8");
  return validateStatusContent(content);
}

function validationError(validation: StatusValidation): string {
  return "error" in validation ? validation.error : "unknown validation error";
}

function schemaInstructions(): string {
  return `The status file must start with a valid JSON object, followed by a blank line and then Markdown.

JSON header schema:
- Required: \`status\`, string. Allowed values: \`incomplete\`, \`blocked\`, \`complete\`.
- Optional: \`blocked_reason\`, string or null.
- Extra properties are allowed but ignored.
- If \`status\` is \`blocked\`, \`blocked_reason\` must be a non-empty string.
- If \`status\` is \`incomplete\` or \`complete\`, \`blocked_reason\` may be absent or null.`;
}

function implementationPrompt(target: PrdTarget): string {
  return `Implement the highest-priority vertical slice from this PRD: ${target.relativePath}

Use this status file for progress tracking: ${target.statusRelativePath}

Flow:
- First read the PRD and the status file, then inspect the relevant code before editing.
- You are free to decide the highest-priority vertical slice from the PRD.
- Implement only one narrow, end-to-end vertical slice in this session.
- If the slice requires human input, ask the user interactively during this session.
- Suggest using the TDD skill when appropriate for the slice, but do not force TDD when it is not useful.
- Keep changes focused and avoid unrelated refactors.
- Treat the PRD as the source of truth; do not edit it unless explicitly necessary.
- Run relevant checks/tests before finishing.
- Before your final response, update ${target.statusRelativePath}:
  - document what was implemented, what is still missing, and useful notes in the Markdown region
  - update the JSON header at the top according to the schema below
  - set \`status\` to \`complete\` only when all PRD acceptance criteria are implemented, relevant checks pass, and nothing remains missing
  - set \`status\` to \`blocked\` only when progress requires user/external input, and include \`blocked_reason\`
  - set \`status\` to \`incomplete\` when work remains, checks fail, or checks cannot be run

${schemaInstructions()}

In your final response, include the PRD path, status file path, what changed, and what checks ran.`;
}

function repairPrompt(target: PrdTarget, error: string): string {
  return `Repair only the JSON header in ${target.statusRelativePath}.

Validation error: ${error}

${schemaInstructions()}

Do not change code. Preserve the Markdown body unless a tiny adjustment is needed to keep the file readable. The file must start with the JSON object itself, not a fenced code block.`;
}

async function repairStatusInSession(
  ctx: ReplacedSessionContext,
  target: PrdTarget,
): Promise<StatusValidation> {
  let validation = await validateStatusFile(target.statusAbsolutePath);

  for (let attempt = 1; !validation.valid && attempt <= REPAIR_ATTEMPTS; attempt += 1) {
    ctx.ui.notify(
      `tbyi: repairing invalid status header (${attempt}/${REPAIR_ATTEMPTS})`,
      "warning",
    );
    await ctx.sendUserMessage(repairPrompt(target, validationError(validation)));
    await ctx.waitForIdle();
    validation = await validateStatusFile(target.statusAbsolutePath);
  }

  return validation;
}

async function runImplementationLoop(
  ctx: ImplementContext,
  target: PrdTarget,
  parentSession: string | undefined,
  all: boolean,
  staleIterations = 0,
): Promise<void> {
  const beforeHash = await targetHash(target);

  const result = await ctx.newSession({
    parentSession,
    withSession: async (nextCtx) => {
      nextCtx.ui.notify(`tbyi: implementing PRD slice: ${target.relativePath}`, "info");
      await nextCtx.sendUserMessage(implementationPrompt(target));
      await nextCtx.waitForIdle();

      const validation = await repairStatusInSession(nextCtx, target);
      if (!validation.valid) {
        nextCtx.ui.notify(
          `tbyi: invalid status file after repair: ${validationError(validation)}`,
          "error",
        );
        return;
      }

      const afterHash = await targetHash(target);
      const nextStaleIterations = afterHash === beforeHash ? staleIterations + 1 : 0;
      if (afterHash === beforeHash) {
        nextCtx.ui.notify(
          `tbyi: PRD/status unchanged for ${nextStaleIterations} iteration(s)`,
          "warning",
        );
      }

      if (nextStaleIterations >= 2) {
        nextCtx.ui.notify("tbyi: stopping after 2 unchanged PRD/status iterations", "warning");
        return;
      }

      if (!all) return;

      if (validation.header.status === "incomplete") {
        await runImplementationLoop(nextCtx, target, parentSession, all, nextStaleIterations);
        return;
      }

      nextCtx.ui.notify(`tbyi: stopped with status ${validation.header.status}`, "info");
    },
  });

  if (result.cancelled) {
    ctx.ui.notify("tbyi: implementation session cancelled", "error");
  }
}

async function fileHash(path: string): Promise<string> {
  try {
    const content = await readFile(path);
    return createHash("sha256").update(content).digest("hex");
  } catch {
    return "missing";
  }
}

async function targetHash(target: PrdTarget): Promise<string> {
  const [prdHash, statusHash] = await Promise.all([
    fileHash(target.absolutePath),
    fileHash(target.statusAbsolutePath),
  ]);
  return `${prdHash}:${statusHash}`;
}

async function confirmContinueForStatus(
  ctx: ImplementContext,
  validation: StatusValidation,
): Promise<boolean> {
  if (!validation.valid) return true;
  if (validation.header.status === "incomplete") return true;

  if (!ctx.hasUI) {
    ctx.ui.notify(
      `tbyi: status is ${validation.header.status}; UI is required to continue anyway`,
      "error",
    );
    return false;
  }

  if (validation.header.status === "complete") {
    return ctx.ui.confirm("PRD already complete", "Continue implementation anyway?");
  }

  return ctx.ui.confirm(
    "PRD is blocked",
    `${validation.header.blocked_reason ?? "No blocked reason provided."}\n\nContinue implementation anyway?`,
  );
}

async function askQuestion(
  ctx: ImplementContext,
  question: string,
  context: string | undefined,
  options: string[],
): Promise<string> {
  if (!ctx.hasUI) throw new Error("question-tool requires an interactive UI.");

  const choices = [...options, "Other"];
  const title = context?.trim() ? `${question}\n\n${context.trim()}` : question;
  const choice = await ctx.ui.select(title, choices);
  const answer = choice === "Other" ? await ctx.ui.input("Custom answer:", "") : choice;
  return answer?.trim() || "No answer provided";
}

export default function (pi: ExtensionAPI) {
  pi.on("resources_discover", () => ({
    skillPaths: [skillsPath],
  }));

  pi.registerTool({
    name: "question-tool",
    label: "Question Tool",
    description:
      "Ask the user a structured question and wait for their answer. Use when user input is genuinely needed.",
    promptSnippet: "Ask the user a structured question with concrete options plus Other.",
    promptGuidelines: [
      "Use question-tool when user input is genuinely needed and cannot be inferred safely.",
      "Do not use question-tool for implementation details that can be inferred from the pre-existing code or from context.",
      "When using question-tool, provide 2-4 concrete options and do not include Other; the tool adds Other automatically.",
    ],
    parameters: Type.Object({
      question: Type.String({ description: "The question to ask the user." }),
      context: Type.Optional(
        Type.String({ description: "Brief context explaining why this answer is needed." }),
      ),
      options: Type.Array(Type.String(), {
        minItems: 2,
        maxItems: 4,
        description: "Two to four concrete answer options. Do not include Other; the tool adds it automatically.",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const answer = await askQuestion(ctx, params.question, params.context, params.options);
      return {
        content: [{ type: "text", text: `User answered: ${answer}` }],
        details: { question: params.question, context: params.context, options: params.options, answer },
      };
    },
  });

  pi.registerCommand("tbyi-info", {
    description: "Show information about the Think Before You Implement skill pack.",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "pi-tbyi loaded: /skill:grill-me, /skill:to-prd, /skill:tdd, /tbyi-implement, question-tool",
        "info",
      );
    },
  });

  pi.registerCommand("tbyi-implement", {
    description:
      "Implement the highest-priority vertical slice from a PRD Markdown file. Use --all to continue until complete, blocked, or stalled.",
    handler: async (args, ctx) => {
      await ctx.waitForIdle();

      const parsedArgs = parseArgs(args);
      const prdArg = parsedArgs.prdArg ?? (await choosePrd(ctx.cwd, ctx));
      if (!prdArg) return;

      const target = toPrdTarget(ctx.cwd, prdArg);
      try {
        await ensureMarkdownFile(target.absolutePath);
        await ensureStatusFile(target);
      } catch (error) {
        ctx.ui.notify(
          `tbyi: could not prepare PRD/status files (${error instanceof Error ? error.message : String(error)})`,
          "error",
        );
        return;
      }

      const parentSession = ctx.sessionManager.getSessionFile();
      const validation = await validateStatusFile(target.statusAbsolutePath);
      if (!validation.valid) {
        const result = await ctx.newSession({
          parentSession,
          withSession: async (nextCtx) => {
            nextCtx.ui.notify(`tbyi: repairing status file: ${target.statusRelativePath}`, "warning");
            const repairedValidation = await repairStatusInSession(nextCtx, target);

            if (!repairedValidation.valid) {
              nextCtx.ui.notify(
                `tbyi: invalid status file after repair: ${validationError(repairedValidation)}`,
                "error",
              );
              return;
            }

            if (!(await confirmContinueForStatus(nextCtx, repairedValidation))) return;

            await runImplementationLoop(nextCtx, target, parentSession, parsedArgs.all);
          },
        });

        if (result.cancelled) {
          ctx.ui.notify("tbyi: repair session cancelled", "error");
        }
        return;
      }

      if (!(await confirmContinueForStatus(ctx, validation))) return;

      await runImplementationLoop(ctx, target, parentSession, parsedArgs.all);
    },
  });
}
