import React, { useState, useEffect, useCallback } from 'react';
import { MemoriesToolbar } from './MemoriesToolbar';
import { MemoryCard } from './MemoryCard';
import { MemoryDetailModal } from './MemoryDetailModal';
import { EmptyState, Spinner } from '../../components/ui';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'observation' | 'summary' | 'prompt';

interface Memory {
  id: number;
  type: string;
  title: string;
  content: string;
  project: string;
  timestamp: string;
  concepts?: string[];
}

export function MemoriesView() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Get project from URL query params
  const getProjectFromUrl = (): string | null => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;
    const params = new URLSearchParams(hash.slice(queryIndex + 1));
    return params.get('project');
  };

  const [projectFilter, setProjectFilter] = useState<string | null>(getProjectFromUrl);

  // Update project filter when URL changes
  useEffect(() => {
    const handleHashChange = () => {
      setProjectFilter(getProjectFromUrl());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.set('type', filterType);
      }
      if (projectFilter) {
        params.set('project', projectFilter);
      }
      params.set('limit', '50');

      const response = await fetch(`/api/observations?${params}`);
      const data = await response.json();

      // Map API response to Memory format
      const items = data.items || data.observations || [];
      setMemories(items.map((item: any) => ({
        id: item.id,
        type: item.type || 'observation',
        title: item.title || 'Untitled',
        content: item.narrative || item.content || '',
        project: item.project || 'unknown',
        timestamp: formatTimestamp(item.created_at),
        concepts: item.concepts ? (typeof item.concepts === 'string' ? JSON.parse(item.concepts) : item.concepts) : [],
      })));
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, projectFilter]);

  function formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await fetch(`/api/observation/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleView = (id: number) => {
    const memory = memories.find((m) => m.id === id);
    if (memory) {
      setSelectedMemory(memory);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {projectFilter ? `Memories: ${projectFilter}` : 'Memories'}
        </h1>
        <p className="text-base-content/60">
          {projectFilter
            ? `Showing memories for project "${projectFilter}"`
            : 'Browse and manage your stored memories'}
        </p>
      </div>

      <MemoriesToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        totalCount={memories.length}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon="lucide:brain"
          title="No memories found"
          description="Memories will appear here as you use Claude Code"
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              viewMode={viewMode}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      <MemoryDetailModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
    </div>
  );
}
