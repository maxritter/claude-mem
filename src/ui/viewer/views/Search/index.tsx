import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { SearchFilters } from './SearchFilters';
import { SearchResultCard } from './SearchResultCard';
import { EmptyState, Spinner } from '../../components/ui';

interface SearchResult {
  id: number;
  type: 'observation' | 'summary' | 'prompt';
  title: string;
  content: string;
  project: string;
  timestamp: string;
  score: number;
}

export function SearchView() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<{
    type?: string;
    project?: string;
    dateRange?: string;
  }>({});

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ query, limit: '20' });
      if (filters.type) params.set('type', filters.type);
      if (filters.project) params.set('project', filters.project);

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-base-content/60">Find memories using semantic search</p>
      </div>

      <SearchInput onSearch={handleSearch} isSearching={isSearching} />
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {isSearching ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : !hasSearched ? (
        <EmptyState
          icon="lucide:search"
          title="Search your memories"
          description="Enter a query to search through your observations, summaries, and prompts"
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="lucide:search-x"
          title="No results found"
          description="Try a different query or adjust your filters"
        />
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-base-content/60">{results.length} results</div>
          {results.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
