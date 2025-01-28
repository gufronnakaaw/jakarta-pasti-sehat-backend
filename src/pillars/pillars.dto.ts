import { z } from 'zod';

export type PillarsQuery = {
  q?: string;
  page: string;
};

export const createPillarSchema = z.object({
  name: z.string(),
  subpillars: z.array(z.string()).min(1, { message: 'Minimal 1 sub pillar' }),
  by: z.string(),
});

export type CreatePillarDto = z.infer<typeof createPillarSchema>;

export const updatePillarSchema = z.object({
  pillar_id: z.string(),
  name: z.string().optional(),
  subpillars: z
    .array(
      z.object({
        sub_pillar_id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  by: z.string(),
});

export type UpdatePillarDto = z.infer<typeof updatePillarSchema>;
