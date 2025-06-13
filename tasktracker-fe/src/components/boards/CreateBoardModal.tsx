'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateBoardDTO, DEFAULT_BOARD_COLUMNS, BOARD_TEMPLATES, CreateBoardModalProps } from '../../lib/types/board';
import { BoardService } from '../../lib/services/boardService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import {
  Target,
  Star,
  Plus,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  open,
  onClose,
  onBoardCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const form = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = async (data: CreateBoardFormData) => {
    try {
      setLoading(true);

      const createBoardDto: CreateBoardDTO = {
        Name: data.name,
        Description: data.description,
        Columns: selectedTemplate !== null 
          ? BOARD_TEMPLATES[selectedTemplate].columns 
          : DEFAULT_BOARD_COLUMNS,
      };

      // Backend expects the payload to be wrapped in a boardDTO property
      const payload = { boardDTO: createBoardDto };

      await BoardService.createBoard(payload as any);
      
      toast.success('🎯 Board created successfully!');
      onBoardCreated();
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateIndex: number) => {
    setSelectedTemplate(templateIndex);
    const template = BOARD_TEMPLATES[templateIndex];
    form.setValue('name', template.name);
    form.setValue('description', template.description);
  };

  const handleCustomBoard = () => {
    setSelectedTemplate(null);
    form.setValue('name', '');
    form.setValue('description', '');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span>Create New Quest Board</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose a Template</h3>
            <div className="grid gap-3">
              {/* Custom Board Option */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedTemplate === null && "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                )}
                onClick={handleCustomBoard}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Custom Board</h4>
                        <p className="text-sm text-muted-foreground">
                          Start with default columns and customize as needed
                        </p>
                      </div>
                    </div>
                    {selectedTemplate === null && (
                      <Check className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {DEFAULT_BOARD_COLUMNS.map((column, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: column.Color,
                          color: column.Color,
                        }}
                      >
                        {column.Name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Options */}
              {BOARD_TEMPLATES.map((template, index) => (
                <Card
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedTemplate === index && "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                  )}
                  onClick={() => handleTemplateSelect(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {selectedTemplate === index && (
                        <Check className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.columns.map((column, colIndex) => (
                        <Badge
                          key={colIndex}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: column.Color,
                            color: column.Color,
                          }}
                        >
                          {column.Name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Board Details Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter board name..."
                        className="h-12"
                        {...field}
                      />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your board..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !form.watch('name')}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Create Board
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 