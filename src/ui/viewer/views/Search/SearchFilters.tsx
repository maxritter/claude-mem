import React from 'react';
import { Badge, Icon } from '../../components/ui';

interface SearchFiltersProps {
  filters: {
    type?: string;
    project?: string;
    dateRange?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
}

const typeOptions = ['observation', 'summary', 'prompt'];
const dateOptions = ['today', 'week', 'month', 'year'];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-base-content/60 self-center mr-2">Filters:</span>

      {typeOptions.map((type) => (
        <Badge
          key={type}
          variant={filters.type === type ? 'primary' : 'ghost'}
          className="cursor-pointer"
          onClick={() => onFilterChange('type', filters.type === type ? undefined : type)}
        >
          {type}
        </Badge>
      ))}

      <div className="border-l border-base-300 mx-2" />

      {dateOptions.map((date) => (
        <Badge
          key={date}
          variant={filters.dateRange === date ? 'primary' : 'ghost'}
          className="cursor-pointer"
          onClick={() => onFilterChange('dateRange', filters.dateRange === date ? undefined : date)}
        >
          {date}
        </Badge>
      ))}

      {Object.keys(filters).length > 0 && (
        <>
          <div className="border-l border-base-300 mx-2" />
          <Badge
            variant="error"
            outline
            className="cursor-pointer"
            onClick={() => {
              onFilterChange('type', undefined);
              onFilterChange('dateRange', undefined);
              onFilterChange('project', undefined);
            }}
          >
            <Icon icon="lucide:x" size={12} className="mr-1" />
            Clear
          </Badge>
        </>
      )}
    </div>
  );
}
