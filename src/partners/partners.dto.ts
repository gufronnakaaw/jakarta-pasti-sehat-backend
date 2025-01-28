import { z } from 'zod';

export type PartnersQuery = {
  q?: string;
  page: string;
};

export const createPartnerSchema = z.object({
  alt: z.string(),
  description: z.string().optional(),
  by: z.string(),
});

export type CreatePartnerDto = z.infer<typeof createPartnerSchema>;

export const updatePartnerSchema = z.object({
  partner_id: z.string(),
  alt: z.string().optional(),
  description: z.string().optional(),
  by: z.string(),
});

export type UpdatePartnerDto = z.infer<typeof updatePartnerSchema>;
