/**
 * User Message Hook - SessionStart
 * Displays context information to the user via stderr
 *
 * This hook runs in parallel with context-hook to show users what context
 * has been loaded into their session. Uses stderr as the communication channel
 * since it's currently the only way to display messages in Claude Code UI.
 */
import { basename } from "path";
import { ensureWorkerRunning, getWorkerPort } from "../shared/worker-utils.js";
import { HOOK_EXIT_CODES } from "../shared/hook-constants.js";
import { logger } from "../utils/logger.js";

// Ensure worker is running
await ensureWorkerRunning();

const port = getWorkerPort();
const project = basename(process.cwd());

// Fetch formatted context directly from worker API
// Note: Removed AbortSignal.timeout to avoid Windows Bun cleanup issue (libuv assertion)
const response = await fetch(
  `http://127.0.0.1:${port}/api/context/inject?project=${encodeURIComponent(project)}&colors=true`,
  { method: 'GET' }
);

if (!response.ok) {
  throw new Error(`Failed to fetch context: ${response.status}`);
}

const output = await response.text();

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext:
      "\n\n📝 Claude-Mem Context Loaded\n\n" +
      output
  }
}));

process.exit(HOOK_EXIT_CODES.SUCCESS);