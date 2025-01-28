import { z } from 'zod';

export type BannersQuery = {
  q?: string;
  page: string;
};

export const createBannerSchema = z.object({
  alt: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  by: z.string(),
});

export type CreateBannerDto = z.infer<typeof createBannerSchema>;

export const updateBannerSchema = z.object({
  banner_id: z.string(),
  alt: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  by: z.string(),
});

export type UpdateBannerDto = z.infer<typeof updateBannerSchema>;
