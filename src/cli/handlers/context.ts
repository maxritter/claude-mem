/**
 * Context Handler - SessionStart
 *
 * Extracted from context-hook.ts - calls worker to generate context.
 * Returns context as hookSpecificOutput for Claude Code to inject.
 */

import type { EventHandler, NormalizedHookInput, HookResult } from '../types.js';
import { ensureWorkerRunning, getWorkerBaseUrl } from '../../shared/worker-utils.js';
import { fetchWithRetry } from '../../shared/fetch-utils.js';
import { getProjectContext } from '../../utils/project-name.js';

export const contextHandler: EventHandler = {
  async execute(input: NormalizedHookInput): Promise<HookResult> {
    // Check for fresh session (no memory context)
    // Usage: CLAUDE_MEM_NO_CONTEXT=1 claude
    if (process.env.CLAUDE_MEM_NO_CONTEXT === '1' || process.env.CLAUDE_MEM_NO_CONTEXT === 'true') {
      return {
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: ''  // Empty context for fresh session
        }
      };
    }

    // Ensure worker is running before any other logic
    await ensureWorkerRunning();

    const cwd = input.cwd ?? process.cwd();
    const context = getProjectContext(cwd);
    const baseUrl = getWorkerBaseUrl();

    // Pass all projects (parent + worktree if applicable) for unified timeline
    const projectsParam = context.allProjects.join(',');
    const url = `${baseUrl}/api/context/inject?projects=${encodeURIComponent(projectsParam)}`;

    // Note: Removed AbortSignal.timeout due to Windows Bun cleanup issue (libuv assertion)
    // Worker service has its own timeouts, so client-side timeout is redundant
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Context generation failed: ${response.status}`);
    }

    const result = await response.text();
    const additionalContext = result.trim();

    return {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext
      }
    };
  }
};
