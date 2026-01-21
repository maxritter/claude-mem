import React from 'react';
import { Card, CardBody, Badge, Icon } from '../../components/ui';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  content: string;
  project: string;
  timestamp: string;
  score: number;
}

interface SearchResultCardProps {
  result: SearchResult;
}

const typeConfig: Record<string, { icon: string; variant: string }> = {
  observation: { icon: 'lucide:brain', variant: 'info' },
  summary: { icon: 'lucide:file-text', variant: 'warning' },
  prompt: { icon: 'lucide:message-square', variant: 'secondary' },
  bugfix: { icon: 'lucide:bug', variant: 'error' },
  feature: { icon: 'lucide:sparkles', variant: 'success' },
  refactor: { icon: 'lucide:refresh-cw', variant: 'accent' },
  discovery: { icon: 'lucide:search', variant: 'info' },
  decision: { icon: 'lucide:git-branch', variant: 'warning' },
  change: { icon: 'lucide:pencil', variant: 'secondary' },
};

const defaultConfig = { icon: 'lucide:circle', variant: 'secondary' };

export function SearchResultCard({ result }: SearchResultCardProps) {
  const config = typeConfig[result.type] || defaultConfig;
  const scorePercent = Math.round(result.score * 100);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-base-200">
            <Icon icon={config.icon} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={config.variant as any} size="xs">{result.type}</Badge>
              <span className="text-xs text-base-content/50">#{result.id}</span>
              <span className="ml-auto text-xs font-mono text-success">{scorePercent}% match</span>
            </div>
            <h3 className="font-medium">{result.title}</h3>
            <p className="text-sm text-base-content/60 mt-1 line-clamp-2">{result.content}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-base-content/50">
              <span className="flex items-center gap-1">
                <Icon icon="lucide:folder" size={12} />
                {result.project}
              </span>
              <span>{result.timestamp}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
