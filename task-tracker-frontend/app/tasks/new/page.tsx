"use client";

import TaskForm from "@/components/forms/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground">
          Add a new task to your to-do list
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
} 