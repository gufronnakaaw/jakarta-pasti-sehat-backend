import { z } from 'zod';

export type DocsQuery = {
  q?: string;
  page?: string;
  filter?: string;
};

export const createDocSchema = z.object({
  pillar_id: z.string(),
  sub_pillar_id: z.string(),
  title: z.string(),
  by: z.string(),
});

export type CreateDocDto = z.infer<typeof createDocSchema>;

export const updateDocSchema = z.object({
  doc_id: z.string(),
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().optional(),
  by: z.string(),
  is_active: z.enum(['true', 'false']).optional(),
});

export type UpdateDocDto = z.infer<typeof updateDocSchema>;

export const createDocImageSchema = z.object({
  doc_id: z.string(),
});

export type CreateDocImageDto = z.infer<typeof createDocImageSchema>;
