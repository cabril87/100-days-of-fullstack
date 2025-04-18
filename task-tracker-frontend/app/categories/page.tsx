"use client";

import { useState } from "react";
import Link from "next/link";
import { useCategories, Category } from "@/context/CategoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PlusCircle, Pencil, Trash2, Folder } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, isLoading, deleteCategory } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage and organize your task categories
          </p>
        </div>
        <Link href="/categories/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Categories list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>
            Categories help you organize your tasks by type or project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              {searchQuery ? (
                <p className="text-muted-foreground">No categories found matching your search</p>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <Folder className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No categories created yet</p>
                  <Link href="/categories/new">
                    <Button variant="outline" className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create your first category
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.color && (
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/categories/${category.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this category? This action cannot be undone.
                                  <br /><br />
                                  <strong>Note:</strong> Tasks in this category will not be deleted, but they will no longer be categorized.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  disabled={deletingId === category.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingId === category.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 