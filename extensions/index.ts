import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const skillsPath = resolve(packageRoot, "skills");

export default function (pi: ExtensionAPI) {
  pi.on("resources_discover", () => ({
    skillPaths: [skillsPath],
  }));

  pi.registerCommand("tbyi-info", {
    description: "Show information about the Think Before You Implement skill pack.",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "pi-tbyi loaded: /skill:grill-me, /skill:to-prd, /skill:to-issues, /skill:tdd",
        "info",
      );
    },
  });
}
