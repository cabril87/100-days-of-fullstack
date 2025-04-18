"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Task, TaskStatus, CreateTaskDto, useTasks } from "@/context/TaskContext";
import { toast } from "sonner";
import { useCategories } from "@/context/CategoryContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define the form validation schema
const taskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100),
  description: z.string().optional(),
  status: z.enum(["ToDo", "InProgress", "Completed"]),
  priority: z.coerce.number().min(1).max(5),
  dueDate: z.date().optional().nullable(),
  categoryId: z.coerce.number().optional().nullable(),
});

// Define form values type
type TaskFormValues = z.infer<typeof taskSchema>;

// Props for TaskForm component
type TaskFormProps = {
  task?: Task; // If provided, we're editing; otherwise, creating
};

export default function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const { createTask, updateTask } = useTasks();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with task data or defaults
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "ToDo",
      priority: task?.priority || 3,
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      categoryId: task?.categoryId || null,
    },
  });

  // Handle form submission
  const onSubmit = async (values: TaskFormValues) => {
    setIsLoading(true);

    try {
      if (task) {
        // Update existing task
        const updatedTask = await updateTask(task.id, {
          title: values.title,
          description: values.description || "",
          status: values.status as TaskStatus,
          priority: values.priority,
          dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd'T'HH:mm:ss") : null,
          categoryId: values.categoryId,
        });
        
        if (updatedTask) {
          toast.success("Task updated successfully");
          router.push(`/tasks/${task.id}`);
        }
      } else {
        // Create new task
        const newTask = await createTask({
          title: values.title,
          description: values.description || "",
          status: values.status as TaskStatus,
          priority: values.priority,
          dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd'T'HH:mm:ss") : null,
          categoryId: values.categoryId,
        });
        
        if (newTask) {
          toast.success("Task created successfully");
          router.push(`/tasks/${newTask.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Task description"
                  className="min-h-32"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ToDo">To Do</SelectItem>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Very Low</SelectItem>
                    <SelectItem value="2">Low</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="4">High</SelectItem>
                    <SelectItem value="5">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Optional: Set a due date for this task
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))}
                  value={field.value?.toString() || "0"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          {category.color && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Organize your task by assigning it to a category
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? task
                ? "Updating..."
                : "Creating..."
              : task
              ? "Update Task"
              : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 