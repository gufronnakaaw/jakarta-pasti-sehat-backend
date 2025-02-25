import { z } from 'zod';

export type CareerQuery = {
  q?: string;
  page?: string;
  filter?: string;
};

export const createCareerSchema = z.object({
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string(),
  location: z.enum(['onsite', 'remote', 'hybrid']),
  type: z.enum(['fulltime', 'parttime', 'freelance', 'contract', 'internship']),
  requirements: z.string(),
  responsibilities: z.string().optional(),
  by: z.string(),
});

export type CreateCareerDto = z.infer<typeof createCareerSchema>;

export const updateCareerSchema = z.object({
  career_id: z.string(),
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().optional(),
  location: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  type: z
    .enum(['fulltime', 'parttime', 'freelance', 'contract', 'internship'])
    .optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  is_active: z.boolean().optional(),
  by: z.string(),
});

export type UpdateCareerDto = z.infer<typeof updateCareerSchema>;

export const createCareerApplSchema = z.object({
  career_id: z.string(),
  fullname: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone_number: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit'),
  address: z.string(),
  instagram_url: z.string().url().optional(),
  portofolio_url: z.string().url().optional(),
});

export type CreateCareerApplDto = z.infer<typeof createCareerApplSchema>;

export const updateCarApplSchema = z.object({
  car_appl_id: z.string(),
  by: z.string(),
});

export type UpdateCarApplDto = z.infer<typeof updateCarApplSchema>;
