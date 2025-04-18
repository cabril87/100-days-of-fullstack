"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCategories, Category } from "@/context/CategoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import CategoryForm from "@/components/forms/CategoryForm";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { getCategoryById, isLoading } = useCategories();
  const [category, setCategory] = useState<Category | undefined>();

  const categoryId = Number(params.id);

  useEffect(() => {
    // Fetch category on component mount
    const currentCategory = getCategoryById(categoryId);
    setCategory(currentCategory);
    
    // Redirect to categories page if category not found
    if (!currentCategory && !isLoading) {
      router.push("/categories");
    }
  }, [categoryId, getCategoryById, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Category Not Found</h2>
        <p className="text-muted-foreground">This category may have been deleted or doesn't exist.</p>
        <Link href="/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update your category details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
} 