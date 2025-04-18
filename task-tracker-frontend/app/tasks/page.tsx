"use client";

import { useState } from "react";
import Link from "next/link";
import { useTasks, Task, TaskStatus } from "@/context/TaskContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getPriorityColor, getStatusColor, getPriorityLabel } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default function TasksPage() {
  const { tasks, isLoading } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Apply filters and sort
  const filteredTasks = tasks
    .filter((task) => {
      // Text search
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === "all" || 
        task.priority.toString() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Sort logic
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "priority":
          aValue = a.priority;
          bValue = b.priority;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      const factor = sortDir === "asc" ? 1 : -1;
      if (aValue < bValue) return -1 * factor;
      if (aValue > bValue) return 1 * factor;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks
          </p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ToDo">To Do</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="1">Very Low</SelectItem>
              <SelectItem value="2">Low</SelectItem>
              <SelectItem value="3">Medium</SelectItem>
              <SelectItem value="4">High</SelectItem>
              <SelectItem value="5">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort order button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
        >
          {sortDir === "asc" ? "Ascending" : "Descending"}
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <p className="text-muted-foreground">No tasks found</p>
            <Link href="/tasks/new">
              <Button variant="outline" className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create your first task
              </Button>
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

// Task card component
function TaskCard({ task }: { task: Task }) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
          </div>
          <CardDescription className="mt-1">
            {task.categoryName && (
              <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs mr-2">
                {task.categoryName}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs">
                Due: {formatDate(task.dueDate)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description || "No description"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 