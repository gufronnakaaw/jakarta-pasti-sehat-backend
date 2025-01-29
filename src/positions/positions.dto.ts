import { z } from 'zod';

export const createPositionSchema = z.object({
  name: z.string(),
  by: z.string(),
});

export type CreatePositionDto = z.infer<typeof createPositionSchema>;

export const updatePositionSchema = z.object({
  position_id: z.string(),
  name: z.string().optional(),
  by: z.string(),
});

export type UpdatePositionDto = z.infer<typeof updatePositionSchema>;
