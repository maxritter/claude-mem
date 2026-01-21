import React from 'react';
import { Icon, Button, Tooltip } from '../../components/ui';

interface TopbarActionsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleLogs?: () => void;
}

export function TopbarActions({ theme, onToggleTheme, onToggleLogs }: TopbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onToggleLogs && (
        <Tooltip text="Toggle console logs" position="bottom">
          <Button variant="ghost" size="sm" onClick={onToggleLogs}>
            <Icon icon="lucide:terminal" size={18} />
          </Button>
        </Tooltip>
      )}
      <Tooltip text={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} position="bottom">
        <Button variant="ghost" size="sm" onClick={onToggleTheme}>
          <Icon icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'} size={18} />
        </Button>
      </Tooltip>
      <Tooltip text="Repository" position="bottom">
        <a
          href="https://git.customable.host/customable/claude-mem"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          <Icon icon="lucide:git-branch" size={18} />
        </a>
      </Tooltip>
    </div>
  );
}
