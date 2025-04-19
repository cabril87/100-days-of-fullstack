"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Check } from 'lucide-react';
import { useTasks, CreateTaskDto, TaskStatus } from '@/context/TaskContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoProps {
  title?: string;
  className?: string;
}

export function Todo({ title = "Quick Tasks", className = "" }: TodoProps) {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const { createTask, updateTask, tasks } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const initialLoadDone = useRef(false);
  const previousTasksLength = useRef(0);

  // Sync with existing tasks when component mounts or when tasks length changes
  useEffect(() => {
    // Only update todos on first load or when tasks length changes significantly
    if (!initialLoadDone.current || previousTasksLength.current !== tasks.length) {
      // Convert recent tasks to todo items format (limit to 5 most recent)
      const recentTasks = tasks
        .slice(0, 5)
        .map(task => ({
          id: task.id.toString(),
          text: task.title,
          completed: task.status === TaskStatus.Completed
        }));
      
      setTodos(recentTasks);
      initialLoadDone.current = true;
      previousTasksLength.current = tasks.length;
    }
  }, [tasks]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setIsAdding(true);
    
    try {
      // Create a simplified task via the API
      const taskDto: CreateTaskDto = {
        title: newTodo,
        description: "Added from Quick Tasks widget",
        status: TaskStatus.ToDo,
        priority: 3, // Default to medium priority
      };
      
      const createdTask = await createTask(taskDto);
      
      if (createdTask) {
        // Add to local state for immediate display
        setTodos([
          { 
            id: createdTask.id.toString(), 
            text: newTodo, 
            completed: false 
          },
          ...todos.slice(0, 4) // Keep only the 5 most recent tasks (including the new one)
        ]);
        setNewTodo("");
        toast.success("Task added successfully");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to add task");
      
      // Add to local state anyway to preserve UX
      const tempId = Date.now().toString();
      setTodos([
        { id: tempId, text: newTodo, completed: false },
        ...todos.slice(0, 4)
      ]);
      setNewTodo("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTodo = async (id: string) => {
    // Find the todo and toggle its state
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return;
    
    const todo = todos[todoIndex];
    const newCompletedState = !todo.completed;
    
    // Update local state first for immediate feedback
    const newTodos = [...todos];
    newTodos[todoIndex] = { ...todo, completed: newCompletedState };
    setTodos(newTodos);
    
    // Try to update the task in the API
    const taskId = parseInt(id);
    if (!isNaN(taskId)) {
      try {
        // We'll update the task status without affecting the local UI again
        // This ensures we don't get update loops
        await updateTask(taskId, { 
          status: newCompletedState ? TaskStatus.Completed : TaskStatus.ToDo 
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        // If API fails, revert the UI change
        const revertedTodos = [...todos];
        revertedTodos[todoIndex] = { ...todo, completed: !newCompletedState };
        setTodos(revertedTodos);
        toast.error("Failed to update task status");
      }
    }
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
          <Input
            placeholder="Add a quick task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isAdding}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quick tasks yet. Add one above.
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 rounded-md border bg-background"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="relative flex items-center justify-center"
                    onClick={() => {
                      setTimeout(() => handleToggleTodo(todo.id), 10);
                    }}
                  >
                    <div 
                      className={cn(
                        "h-4 w-4 rounded-sm border border-primary cursor-pointer",
                        todo.completed ? "bg-primary" : "bg-background"
                      )}
                    />
                    {todo.completed && (
                      <Check className="h-3 w-3 absolute text-white" />
                    )}
                  </div>
                  <span 
                    className={cn(
                      "cursor-pointer", 
                      todo.completed ? "line-through text-muted-foreground" : ""
                    )}
                    onClick={() => {
                      setTimeout(() => handleToggleTodo(todo.id), 10);
                    }}
                  >
                    {todo.text}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 