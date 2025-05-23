'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { useToast } from '@/lib/hooks/useToast';
import { Spinner } from '@/components/ui/spinner';
import { 
  Check, 
  Trash2, 
  Tag, 
  MoreHorizontal, 
  AlertCircle, 
  PackageCheck, 
  Layers,
  Tag as TagIcon,
  Calendar,
  Star,
  X,
  MoveHorizontal
} from 'lucide-react';
import { Task } from '@/types';

type BulkOperation = 'delete' | 'status' | 'priority' | 'category' | 'favorite' | 'unfavorite';

export default function BulkOperationsMenu({ 
  selectedTasks,
  clearSelection,
  onOperationComplete
}: { 
  selectedTasks: Task[], 
  clearSelection: () => void,
  onOperationComplete?: () => void
}) {
  const { updateTask, deleteTask, categories } = useTasks();
  const { showToast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationValue, setOperationValue] = useState<string>('');
  
  const handleOpenOperation = (operation: BulkOperation) => {
    setCurrentOperation(operation);
    setOperationValue('');
    setIsDialogOpen(true);
  };
  
  const handleCloseOperation = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setCurrentOperation(null);
    }, 200);
  };
  
  const getOperationTitle = () => {
    switch (currentOperation) {
      case 'delete': return 'Delete Tasks';
      case 'status': return 'Change Status';
      case 'priority': return 'Change Priority';
      case 'category': return 'Change Category';
      case 'favorite': return 'Mark as Favorite';
      case 'unfavorite': return 'Remove from Favorites';
      default: return '';
    }
  };
  
  const getOperationDescription = () => {
    const count = selectedTasks.length;
    switch (currentOperation) {
      case 'delete': 
        return `Are you sure you want to delete ${count} selected task${count > 1 ? 's' : ''}? This action cannot be undone.`;
      case 'status': 
        return `Change the status of ${count} selected task${count > 1 ? 's' : ''} to:`;
      case 'priority': 
        return `Change the priority of ${count} selected task${count > 1 ? 's' : ''} to:`;
      case 'category': 
        return `Assign ${count} selected task${count > 1 ? 's' : ''} to category:`;
      case 'favorite':
        return `Mark ${count} selected task${count > 1 ? 's' : ''} as favorite?`;
      case 'unfavorite':
        return `Remove ${count} selected task${count > 1 ? 's' : ''} from favorites?`;
      default: 
        return '';
    }
  };
  
  const renderOperationContent = () => {
    switch (currentOperation) {
      case 'status':
        return (
          <Select value={operationValue} onValueChange={setOperationValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'priority':
        return (
          <Select value={operationValue} onValueChange={setOperationValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'category':
        return (
          <Select value={operationValue} onValueChange={setOperationValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Remove Category)</SelectItem>
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
        );
      default:
        return null;
    }
  };
  
  const executeOperation = async () => {
    if (!currentOperation) return;
    
    setIsProcessing(true);
    let successCount = 0;
    
    try {
      // Handle each operation type
      for (const task of selectedTasks) {
        let success = false;
        
        switch (currentOperation) {
          case 'delete':
            success = await deleteTask(task.id);
            break;
          case 'status':
            if (operationValue) {
              success = await updateTask(task.id, { status: operationValue });
            }
            break;
          case 'priority':
            if (operationValue) {
              success = await updateTask(task.id, { priority: operationValue });
            }
            break;
          case 'category':
            if (operationValue === 'none') {
              success = await updateTask(task.id, { categoryId: null });
            } else if (operationValue) {
              success = await updateTask(task.id, { categoryId: parseInt(operationValue) });
            }
            break;
          case 'favorite':
            success = await updateTask(task.id, { isFavorite: true });
            break;
          case 'unfavorite':
            success = await updateTask(task.id, { isFavorite: false });
            break;
        }
        
        if (success) successCount++;
      }
      
      // Show success message
      const operationText = {
        'delete': 'deleted',
        'status': 'updated status for',
        'priority': 'updated priority for',
        'category': 'updated category for',
        'favorite': 'marked as favorite',
        'unfavorite': 'removed from favorites'
      }[currentOperation];
      
      showToast(
        `Successfully ${operationText} ${successCount} of ${selectedTasks.length} tasks`,
        successCount === selectedTasks.length ? 'success' : 'warning'
      );
      
      // Close dialog and clear selection
      handleCloseOperation();
      if (successCount > 0) {
        clearSelection();
        if (onOperationComplete) onOperationComplete();
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      showToast('An error occurred while performing the operation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const hasRequiredValue = () => {
    if (currentOperation === 'delete' || currentOperation === 'favorite' || currentOperation === 'unfavorite') {
      return true;
    }
    return !!operationValue;
  };
  
  if (selectedTasks.length === 0) {
    return null;
  }
  
  return (
    <>
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
        <Checkbox 
          checked={selectedTasks.length > 0} 
          onCheckedChange={() => clearSelection()}
          className="border-blue-400"
        />
        <span className="text-sm font-medium text-blue-700">
          {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
        </span>
        
        <div className="flex gap-1.5 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleOpenOperation('status')}
          >
            <MoveHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleOpenOperation('priority')}
          >
            <TagIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Priority</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleOpenOperation('category')}
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Category</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenOperation('favorite')}>
                <Star className="h-4 w-4 mr-2 text-amber-500" />
                Mark as favorite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenOperation('unfavorite')}>
                <X className="h-4 w-4 mr-2 text-gray-500" />
                Remove from favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleOpenOperation('delete')}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 border border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={clearSelection}
          >
            Cancel
          </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentOperation === 'delete' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {currentOperation === 'status' && <PackageCheck className="h-5 w-5 text-blue-500" />}
              {currentOperation === 'priority' && <Layers className="h-5 w-5 text-amber-500" />}
              {currentOperation === 'category' && <Tag className="h-5 w-5 text-purple-500" />}
              {currentOperation === 'favorite' && <Star className="h-5 w-5 text-amber-500" />}
              {currentOperation === 'unfavorite' && <Star className="h-5 w-5 text-gray-400" />}
              {getOperationTitle()}
            </DialogTitle>
            <DialogDescription>
              {getOperationDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            {renderOperationContent()}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseOperation}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={executeOperation}
              disabled={isProcessing || !hasRequiredValue()}
              variant={currentOperation === 'delete' ? 'destructive' : 'default'}
              className={currentOperation !== 'delete' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {currentOperation === 'delete' ? (
                    <Trash2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 