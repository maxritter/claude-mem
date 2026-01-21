import React from 'react';
import { Icon } from '../../components/ui';

export function SidebarLogo() {
  return (
    <a href="#/" className="flex items-center gap-2">
      <Icon icon="lucide:brain" size={28} className="text-primary" />
      <span className="font-bold text-lg">claude-mem</span>
    </a>
  );
}
