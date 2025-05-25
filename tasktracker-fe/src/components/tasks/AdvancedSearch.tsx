'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Save,
  Bookmark,
  Filter,
  X,
  Plus,
  Trash2,
  Star
} from 'lucide-react';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task } from '@/lib/types/task';
import { SearchFilter, SavedSearch } from '@/lib/types/search';

interface AdvancedSearchProps {
  onSearchResults?: (results: Task[]) => void;
  initialFilters?: SearchFilter[];
}

export default function AdvancedSearch({
  onSearchResults,
  initialFilters = []
}: AdvancedSearchProps) {
  const { tasks } = useTasks();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>(initialFilters);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  
  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchDescription, setSaveSearchDescription] = useState('');
  
  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Available filter fields
  const filterFields = [
    { value: 'title', label: 'Title', type: 'text' },
    { value: 'description', label: 'Description', type: 'text' },
    { value: 'status', label: 'Status', type: 'select', options: ['todo', 'in-progress', 'completed', 'cancelled'] },
    { value: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
    { value: 'category', label: 'Category', type: 'select', options: ['work', 'personal', 'family', 'shopping'] },
    { value: 'dueDate', label: 'Due Date', type: 'date' },
    { value: 'createdAt', label: 'Created Date', type: 'date' },
    { value: 'assignedTo', label: 'Assigned To', type: 'text' },
    { value: 'tags', label: 'Tags', type: 'text' },
    { value: 'estimatedTime', label: 'Estimated Time', type: 'number' }
  ];
  
  // Filter operators
  const getOperatorsForType = (type: string) => {
    switch (type) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'starts_with', label: 'Starts with' },
          { value: 'ends_with', label: 'Ends with' },
          { value: 'not_contains', label: 'Does not contain' }
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not equals' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'On' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'between', label: 'Between' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'between', label: 'Between' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  };

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
    
    const history = localStorage.getItem('taskSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Perform search
  useEffect(() => {
    performSearch();
  }, [searchQuery, filters, sortBy, sortOrder, tasks]);

  const performSearch = () => {
    
    let results = [...tasks];
    
    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
      
      // Add to search history
      if (!searchHistory.includes(searchQuery) && searchQuery.length > 2) {
        const newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem('taskSearchHistory', JSON.stringify(newHistory));
      }
    }
    
    // Apply filters
    results = results.filter(task => {
      return filters.every(filter => {
        const fieldValue = getFieldValue(task, filter.field);
        return evaluateFilter(fieldValue, filter.operator, filter.value);
      });
    });
    
    // Apply sorting
    results.sort((a, b) => {
      const aValue = getFieldValue(a, sortBy);
      const bValue = getFieldValue(b, sortBy);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setSearchResults(results);
    onSearchResults?.(results);
  };

  const getFieldValue = (task: Task, field: string): any => {
    switch (field) {
      case 'title': return task.title;
      case 'description': return task.description || '';
      case 'status': return task.status;
      case 'priority': return task.priority;
      case 'category': return task.categoryId;
      case 'dueDate': return task.dueDate;
      case 'createdAt': return task.createdAt;
      case 'assignedTo': return task.assignedTo || '';
      case 'tags': return task.tags?.join(' ') || '';
      case 'estimatedTime': return 0; // Property doesn't exist in Task interface
      default: return '';
    }
  };

  const evaluateFilter = (fieldValue: any, operator: string, filterValue: any): boolean => {
    if (fieldValue === undefined || fieldValue === null) return false;
    
    const field = String(fieldValue).toLowerCase();
    const value = String(filterValue).toLowerCase();
    
    switch (operator) {
      case 'contains': return field.includes(value);
      case 'equals': return field === value;
      case 'starts_with': return field.startsWith(value);
      case 'ends_with': return field.endsWith(value);
      case 'not_contains': return !field.includes(value);
      case 'not_equals': return field !== value;
      case 'before': return new Date(fieldValue) < new Date(filterValue);
      case 'after': return new Date(fieldValue) > new Date(filterValue);
      case 'greater_than': return Number(fieldValue) > Number(filterValue);
      case 'less_than': return Number(fieldValue) < Number(filterValue);
      default: return true;
    }
  };

  const addFilter = () => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      field: 'title',
      operator: 'contains',
      value: '',
      label: 'Title contains'
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setSearchQuery('');
  };

  const saveSearch = () => {
    if (!saveSearchName.trim()) return;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      description: saveSearchDescription,
      filters,
      sortBy,
      sortOrder,
      createdAt: new Date().toISOString(),
      useCount: 0,
      isFavorite: false
    };
    
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('taskSearches', JSON.stringify(updatedSearches));
    
    setSaveSearchName('');
    setSaveSearchDescription('');
    setShowSaveDialog(false);
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    setSortBy(search.sortBy);
    setSortOrder(search.sortOrder);
    
    // Update use count
    const updatedSearches = savedSearches.map(s => 
      s.id === search.id 
        ? { ...s, useCount: s.useCount + 1, lastUsed: new Date().toISOString() }
        : s
    );
    setSavedSearches(updatedSearches);
    localStorage.setItem('taskSearches', JSON.stringify(updatedSearches));
  };

  const deleteSavedSearch = (id: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updatedSearches);
    localStorage.setItem('taskSearches', JSON.stringify(updatedSearches));
  };

  const toggleSearchFavorite = (id: string) => {
    const updatedSearches = savedSearches.map(s => 
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSavedSearches(updatedSearches);
    localStorage.setItem('taskSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <CardDescription>
            Search and filter tasks with powerful criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search history */}
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Recent:</span>
              {searchHistory.slice(0, 5).map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(query)}
                  className="h-6 text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters ({filters.length})
            </span>
            <div className="flex gap-2">
              <Button onClick={addFilter} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
              {filters.length > 0 && (
                <Button onClick={clearAllFilters} size="sm" variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filters.map((filter) => {
            const field = filterFields.find(f => f.value === filter.field);
            const operators = getOperatorsForType(field?.type || 'text');
            
            return (
              <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <Select
                  value={filter.field}
                  onValueChange={(value) => updateFilter(filter.id, { field: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterFields.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {field?.type === 'select' ? (
                  <Select
                    value={String(filter.value)}
                    onValueChange={(value) => updateFilter(filter.id, { value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field?.type === 'date' ? (
                  <Input
                    type="date"
                    value={String(filter.value)}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="flex-1"
                  />
                ) : (
                  <Input
                    type={field?.type === 'number' ? 'number' : 'text'}
                    value={String(filter.value)}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Enter value"
                    className="flex-1"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {filters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No filters applied. Click "Add Filter" to start filtering tasks.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sorting and Actions */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {searchResults.length} results
            </span>
            <Button
              onClick={() => setShowSaveDialog(true)}
              size="sm"
              variant="outline"
              disabled={filters.length === 0 && !searchQuery}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches
                .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                .map(search => (
                <div
                  key={search.id}
                  className="border rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{search.name}</h4>
                        {search.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {search.description && (
                        <p className="text-sm text-gray-500">{search.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{search.filters.length} filters</span>
                        <span>{search.useCount} uses</span>
                        {search.lastUsed && (
                          <span>Last used: {new Date(search.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSearchFavorite(search.id)}
                        className="h-8 w-8 p-0"
                      >
                        {search.isFavorite ? (
                          <Bookmark className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedSearch(search.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => loadSavedSearch(search)}
                    size="sm"
                    className="w-full mt-3"
                  >
                    Load Search
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save this search configuration for future use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Search Name</label>
              <Input
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="Enter search name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={saveSearchDescription}
                onChange={(e) => setSaveSearchDescription(e.target.value)}
                placeholder="Enter search description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveSearch} className="flex-1">
                Save Search
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 