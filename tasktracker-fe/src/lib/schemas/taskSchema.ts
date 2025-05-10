import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .nullable()
    .default(''),
  status: z
    .enum(['todo', 'in-progress', 'done'])
    .default('todo'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium')
    .optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(val => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date format'),
});

export type TaskSchemaType = z.infer<typeof taskSchema>; 