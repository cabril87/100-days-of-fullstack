"use client";

import Link from "next/link";
import CategoryForm from "@/components/forms/CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
          <p className="text-muted-foreground">
            Add a new category to organize your tasks
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
} 