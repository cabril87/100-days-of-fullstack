import { z } from 'zod';

export const createCustomBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export type CreateCustomBoardFormData = z.infer<typeof createCustomBoardSchema>; 