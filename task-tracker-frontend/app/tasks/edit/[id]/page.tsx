"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTasks, Task } from "@/context/TaskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import TaskForm from "@/components/forms/TaskForm";

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const { getTaskById, isLoading } = useTasks();
  const [task, setTask] = useState<Task | undefined>();

  const taskId = Number(params.id);

  useEffect(() => {
    // Fetch task on component mount
    const currentTask = getTaskById(taskId);
    setTask(currentTask);
    
    // Redirect to tasks page if task not found
    if (!currentTask && !isLoading) {
      router.push("/tasks");
    }
  }, [taskId, getTaskById, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Task Not Found</h2>
        <p className="text-muted-foreground">This task may have been deleted or doesn't exist.</p>
        <Link href="/tasks">
          <Button variant="outline">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/tasks/${taskId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-muted-foreground">
            Update your task details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={task} />
        </CardContent>
      </Card>
    </div>
  );
} 