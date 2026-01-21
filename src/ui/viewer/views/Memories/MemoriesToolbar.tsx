import React from 'react';
import { Button, Icon, Select } from '../../components/ui';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'observation' | 'summary' | 'prompt';

interface MemoriesToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
  totalCount: number;
}

const filterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'observation', label: 'Observations' },
  { value: 'summary', label: 'Summaries' },
  { value: 'prompt', label: 'Prompts' },
];

export function MemoriesToolbar({
  viewMode,
  onViewModeChange,
  filterType,
  onFilterTypeChange,
  totalCount,
}: MemoriesToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-base-content/60">{totalCount} items</span>
      </div>
      <div className="flex items-center gap-2">
        <Select
          options={filterOptions}
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value as FilterType)}
          selectSize="sm"
          className="w-40"
        />
        <div className="btn-group">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Icon icon="lucide:grid-3x3" size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <Icon icon="lucide:list" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
