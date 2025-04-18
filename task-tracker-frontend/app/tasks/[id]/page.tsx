"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTasks, Task, TaskStatus } from "@/context/TaskContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { formatDate, getPriorityColor, getStatusColor, getPriorityLabel } from "@/lib/utils";
import TaskForm from "@/components/forms/TaskForm";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getTaskById, deleteTask, updateTask, isLoading } = useTasks();
  const [task, setTask] = useState<Task | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const taskId = Number(params.id);

  useEffect(() => {
    // Fetch task on component mount
    const currentTask = getTaskById(taskId);
    setTask(currentTask);
  }, [taskId, getTaskById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading task details...</p>
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

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteTask(taskId);
      if (success) {
        toast.success("Task deleted successfully");
        router.push("/tasks");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      if (updatedTask) {
        setTask(updatedTask);
        toast.success(`Task status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tasks">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/tasks/edit/${taskId}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteTask} 
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Description</CardTitle>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {task.status !== TaskStatus.Completed && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Status</CardTitle>
                    <CardDescription>
                      Change the current task status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleStatusUpdate(TaskStatus.ToDo)}
                        variant={task.status === TaskStatus.ToDo ? "default" : "outline"}
                        className="flex-1"
                      >
                        To Do
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(TaskStatus.InProgress)}
                        variant={task.status === TaskStatus.InProgress ? "default" : "outline"}
                        className="flex-1"
                      >
                        In Progress
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(TaskStatus.Completed)}
                        variant="outline"
                        className="flex-1 bg-green-50 hover:bg-green-100"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" /> Due Date
                    </h3>
                    <p className={`mt-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                      {task.dueDate ? (
                        <>
                          {formatDate(task.dueDate)}
                          {isOverdue && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 rounded-md px-2 py-0.5">
                              Overdue
                            </span>
                          )}
                        </>
                      ) : (
                        "No due date"
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center text-sm">
                      <Tag className="mr-2 h-4 w-4" /> Category
                    </h3>
                    <p className="mt-1">{task.categoryName || "Uncategorized"}</p>
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" /> Last Updated
                    </h3>
                    <p className="mt-1">{task.updatedAt ? formatDate(task.updatedAt) : "Not updated"}</p>
                  </div>

                  {task.status === TaskStatus.Completed && task.completedAt && (
                    <div>
                      <h3 className="font-medium flex items-center text-sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                      </h3>
                      <p className="mt-1">{formatDate(task.completedAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
              <CardDescription>
                Update the details of this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskForm task={task} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 