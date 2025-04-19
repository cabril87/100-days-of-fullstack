"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { useTasks, CreateTaskDto, TaskStatus } from '@/context/TaskContext';
import { toast } from 'sonner';

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

  // Sync with existing tasks when component mounts or when tasks change significantly
  useEffect(() => {
    // Only update todos on first load or when tasks length changes
    if (!initialLoadDone.current || tasks.length !== todos.length) {
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
    }
  }, [tasks, todos.length]);

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
    const newTodos = [...todos];
    newTodos[todoIndex] = { ...todo, completed: !todo.completed };
    setTodos(newTodos);
    
    // Try to update the task in the API
    const taskId = parseInt(id);
    if (!isNaN(taskId)) {
      try {
        await updateTask(taskId, { 
          status: newTodos[todoIndex].completed ? TaskStatus.Completed : TaskStatus.ToDo 
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        // We don't revert the UI to avoid confusing the user
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
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => {
                      // Use a timeout to break the potential render update cycle
                      setTimeout(() => handleToggleTodo(todo.id), 0);
                    }}
                  />
                  <label 
                    htmlFor={`todo-${todo.id}`}
                    className={todo.completed ? "line-through text-muted-foreground cursor-pointer" : "cursor-pointer"}
                  >
                    {todo.text}
                  </label>
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