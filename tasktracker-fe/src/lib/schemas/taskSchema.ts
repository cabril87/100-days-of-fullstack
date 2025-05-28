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
    .number()
    .int('Priority must be an integer')
    .min(0, 'Priority must be at least 0')
    .max(3, 'Priority must be at most 3')
    .optional()
    .default(1), // Default to Medium (1)
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(val => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date format'),
  dueTime: z
    .string()
    .optional()
    .nullable()
    .refine(val => {
      if (!val) return true;
      // Basic time format validation (HH:MM)
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    }, 'Invalid time format (use HH:MM)'),
  categoryId: z
    .number()
    .int('Category ID must be an integer')
    .positive('Category ID must be positive')
    .optional()
    .nullable(),
});

export type TaskSchemaType = z.infer<typeof taskSchema>; 