import { z } from 'zod';

export type ArticlesQuery = {
  q?: string;
  page?: string;
  filter?: string;
};

export const createArticleSchema = z.object({
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  by: z.string(),
});

export type CreateArticleDto = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = z.object({
  article_id: z.string(),
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  by: z.string(),
});

export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
