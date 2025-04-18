"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Category, CreateCategoryDto, useCategories } from "@/context/CategoryContext";

// Define the form validation schema
const categorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(50, { message: "Name must be less than 50 characters" }),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9A-F]{6})$/i, { message: "Color must be a valid hex color code" }).optional(),
});

// Define form values type
type CategoryFormValues = z.infer<typeof categorySchema>;

// Props for CategoryForm component
type CategoryFormProps = {
  category?: Category; // If provided, we're editing; otherwise, creating
};

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const { createCategory, updateCategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with category data or defaults
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "#6E56CF", // Default color
    },
  });

  // Handle form submission
  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);

    try {
      if (category) {
        // Update existing category
        const updatedCategory = await updateCategory(category.id, {
          name: values.name,
          description: values.description || null,
          color: values.color || null,
        });
        
        if (updatedCategory) {
          router.push("/categories");
        }
      } else {
        // Create new category
        const newCategory = await createCategory({
          name: values.name,
          description: values.description || null,
          color: values.color || null,
        });
        
        if (newCategory) {
          router.push("/categories");
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
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
                  placeholder="Category description (optional)"
                  className="min-h-32"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="#RRGGBB" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                {field.value && (
                  <div 
                    className="w-10 h-10 rounded-full border" 
                    style={{ backgroundColor: field.value }}
                  />
                )}
              </div>
              <FormDescription>
                Enter a hex color code (e.g. #6E56CF)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? category
                ? "Updating..."
                : "Creating..."
              : category
              ? "Update Category"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 