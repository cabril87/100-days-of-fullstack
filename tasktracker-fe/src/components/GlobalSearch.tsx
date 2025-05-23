'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search as SearchIcon, 
  X, 
  Clock, 
  CheckCircle, 
  Circle, 
  Calendar as CalendarIcon, 
  Filter, 
  ArrowRight, 
  Tag,
  ClipboardList,
  Folder as FolderIcon,
  Bookmark,
  FileText
} from 'lucide-react';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Task, TaskCategory } from '@/lib/types/task';

type SearchResult = {
  id: number;
  title: string;
  type: 'task' | 'template';
  priority?: string;
  status?: string;
  categoryName?: string;
  categoryColor?: string;
  dueDate?: Date | null;
  createdAt?: Date;
  url: string;
};

export default function GlobalSearch() {
  const { tasks } = useTasks();
  const { categories, templates } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Advanced search filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    categoryId: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
    includeCompleted: true,
    onlyFavorites: false
  });
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open search dialog on Ctrl+K or Command+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  useEffect(() => {
    // Auto-focus input when dialog opens
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset search when dialog closes
      setQuery('');
      setResults([]);
      setShowAdvancedSearch(false);
      setFilters({
        status: '',
        priority: '',
        categoryId: '',
        fromDate: null,
        toDate: null,
        includeCompleted: true,
        onlyFavorites: false
      });
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (!query.trim() && !hasActiveFilters()) {
      setResults([]);
      return;
    }
    
    const searchResults = performSearch();
    setResults(searchResults);
  }, [query, filters, activeTab, tasks, templates]);
  
  const hasActiveFilters = () => {
    return (
      filters.status !== '' || 
      filters.priority !== '' || 
      filters.categoryId !== '' || 
      filters.fromDate !== null || 
      filters.toDate !== null || 
      !filters.includeCompleted ||
      filters.onlyFavorites
    );
  };
  
  const performSearch = () => {
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();
    
    // Filter by type based on active tab
    const shouldIncludeTasks = activeTab === 'all' || activeTab === 'tasks';
    const shouldIncludeTemplates = activeTab === 'all' || activeTab === 'templates';
    
    // Search tasks
    if (shouldIncludeTasks) {
      const filteredTasks = tasks.filter(task => {
        // Basic text search
        const matchesQuery = !lowerQuery || 
          task.title.toLowerCase().includes(lowerQuery) || 
          (task.description && task.description.toLowerCase().includes(lowerQuery));
        
        if (!matchesQuery) return false;
        
        // Advanced filters
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.categoryId && task.categoryId !== parseInt(filters.categoryId)) return false;
        if (!filters.includeCompleted && task.status === 'done') return false;
        if (filters.onlyFavorites && !(task as any).isFavorite) return false;
        
        // Date range filters
        if (filters.fromDate && task.dueDate && new Date(task.dueDate as string) < filters.fromDate) return false;
        if (filters.toDate && task.dueDate && new Date(task.dueDate as string) > filters.toDate) return false;
        
        return true;
      });
      
      filteredTasks.forEach(task => {
        const category = categories.find((c: TaskCategory) => c.id === task.categoryId);
        
        searchResults.push({
          id: task.id,
          title: task.title,
          type: 'task',
          priority: task.priority,
          status: task.status,
          categoryName: category?.name,
          categoryColor: category?.color,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          url: `/tasks/${task.id}`
        });
      });
    }
    
    // Search templates
    if (shouldIncludeTemplates) {
      const filteredTemplates = templates.filter(template => {
        // Basic text search
        const matchesQuery = !lowerQuery ||
          template.title.toLowerCase().includes(lowerQuery) || 
          (template.description && template.description.toLowerCase().includes(lowerQuery));
        
        if (!matchesQuery) return false;
        
        // Advanced filters
        if (filters.status && template.status !== filters.status) return false;
        if (filters.priority && template.priority !== filters.priority) return false;
        if (filters.categoryId && template.categoryId !== parseInt(filters.categoryId)) return false;
        if (filters.onlyFavorites && !template.isDefault) return false;
        
        return true;
      });
      
      filteredTemplates.forEach(template => {
        const category = categories.find((c: TaskCategory) => c.id === template.categoryId);
        
        searchResults.push({
          id: template.id,
          title: template.title,
          type: 'template',
          priority: template.priority,
          status: template.status,
          categoryName: category?.name,
          categoryColor: category?.color,
          createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
          url: `/templates/${template.id}`
        });
      });
    }
    
    // Sort by newest first
    return searchResults.sort((a, b) => {
      return b.createdAt!.getTime() - a.createdAt!.getTime();
    });
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo': return <Circle className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      categoryId: '',
      fromDate: null,
      toDate: null,
      includeCompleted: true,
      onlyFavorites: false
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-gray-500 hover:text-gray-700 md:min-w-[200px] md:justify-between bg-white/80 backdrop-blur-sm border-gray-300 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 text-gray-400" />
            <span className="hidden sm:inline text-gray-500">Search tasks & templates...</span>
          </div>
          <kbd className="hidden md:flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] p-0 overflow-hidden bg-white/95 backdrop-blur-lg border-gray-200 shadow-xl">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search for tasks and templates across your workspace
          </DialogDescription>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full">
              <SearchIcon className="h-5 w-5 text-blue-500" />
            </div>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks and templates..."
              className="border-0 shadow-none focus-visible:ring-0 px-0 text-lg font-medium"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={cn(
                "ml-auto gap-1 text-xs border border-gray-200 rounded-full px-3 hover:border-blue-300",
                showAdvancedSearch && "bg-blue-50 text-blue-600 border-blue-300"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              {hasActiveFilters() && (
                <Badge variant="secondary" className="px-1 h-5">
                  {Object.values(filters).filter(v => 
                    v !== '' && v !== null && v !== true
                  ).length + 
                  (!filters.includeCompleted ? 1 : 0) + 
                  (filters.onlyFavorites ? 1 : 0)}
                </Badge>
              )}
              Filters
            </Button>
          </div>
          
          {showAdvancedSearch && (
            <div className="mt-4 pt-4 border-t bg-gray-50/80 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-gray-200">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Priority</label>
                  <Select 
                    value={filters.priority} 
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-gray-200">
                      <SelectValue placeholder="Any priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <Select 
                    value={filters.categoryId} 
                    onValueChange={(value) => handleFilterChange('categoryId', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any category</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">From date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-xs",
                          !filters.fromDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {filters.fromDate ? format(filters.fromDate, "PPP") : "Choose date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.fromDate || undefined}
                        onSelect={(date) => handleFilterChange('fromDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-xs",
                          !filters.toDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {filters.toDate ? format(filters.toDate, "PPP") : "Choose date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.toDate || undefined}
                        onSelect={(date) => handleFilterChange('toDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCompleted" 
                    checked={filters.includeCompleted}
                    onCheckedChange={(checked) => 
                      handleFilterChange('includeCompleted', Boolean(checked))
                    }
                  />
                  <label htmlFor="includeCompleted" className="text-xs text-gray-700">
                    Include completed tasks
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="onlyFavorites" 
                    checked={filters.onlyFavorites}
                    onCheckedChange={(checked) => 
                      handleFilterChange('onlyFavorites', Boolean(checked))
                    }
                  />
                  <label htmlFor="onlyFavorites" className="text-xs text-gray-700">
                    Only show favorites
                  </label>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="ml-auto text-xs"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4 px-6">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100">
              <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Tasks</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map(result => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={() => setIsOpen(false)}
                  className="block py-4 px-4 hover:bg-blue-50/50 rounded-lg -mx-4 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {result.type === 'task' ? (
                        <div className="bg-blue-100 p-2 rounded-full">
                          <ClipboardList className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="bg-purple-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-base text-gray-900 truncate">
                          {result.title}
                        </h4>
                        
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "ml-auto py-1 shadow-sm",
                            result.type === 'task' ? "border-blue-200 text-blue-700 bg-blue-50" : "border-purple-200 text-purple-700 bg-purple-50"
                          )}
                        >
                          {result.type === 'task' ? 'Task' : 'Template'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        {result.status && (
                          <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {getStatusIcon(result.status)}
                            <span className="capitalize">{result.status.replace('-', ' ')}</span>
                          </div>
                        )}
                        
                        {result.priority && (
                          <div className="flex items-center gap-1 text-xs">
                            <Tag className={cn("h-3 w-3", getPriorityColor(result.priority))} />
                            <span className="capitalize">{result.priority}</span>
                          </div>
                        )}
                        
                        {result.categoryName && (
                          <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: result.categoryColor }}
                            />
                            <span>{result.categoryName}</span>
                          </div>
                        )}
                        
                        {result.dueDate && (
                          <div className="flex items-center gap-1 text-xs">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            <span>{format(result.dueDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        
                        {result.type === 'template' && result.priority === 'default' && (
                          <div className="flex items-center gap-1 text-xs">
                            <Bookmark className="h-3 w-3 text-amber-500" />
                            <span>Default</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-1.5 rounded-full">
                      <ArrowRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {query.trim() || hasActiveFilters() ? (
                <>
                  <div className="bg-gray-100 rounded-full p-5 mb-4">
                    <SearchIcon className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No results found</p>
                  <p className="text-gray-500 text-sm max-w-md">
                    Try adjusting your search terms or filters to find what you're looking for
                  </p>
                  {hasActiveFilters() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Clear all filters
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="bg-blue-100 rounded-full p-5 mb-4">
                      <SearchIcon className="h-10 w-10 text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-purple-100 rounded-full p-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">Search tasks & templates</p>
                  <p className="text-gray-500 text-sm max-w-md">
                    Type to search by title or description, or use filters for advanced options
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      Try "meeting notes"
                    </Badge>
                    <Badge className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                      Try "deadline"
                    </Badge>
                    <Badge className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                      Try "high priority"
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-6 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-xs">⌘K</kbd>
                    Keyboard shortcut
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 