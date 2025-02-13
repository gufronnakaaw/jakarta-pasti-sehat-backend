import { z } from 'zod';

export type VolsQuery = {
  q?: string;
  page?: string;
  filter?: string;
};

export const createVolSchema = z.object({
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().min(1, 'Judul tidak boleh kosong'),
  requirements: z.string().min(1, 'Persyaratan tidak boleh kosong'),
  responsibilities: z.string().optional(),
  by: z.string(),
});

export type CreateVolDto = z.infer<typeof createVolSchema>;

export const updateVolSchema = z.object({
  volunteer_id: z.string(),
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().min(1, 'Judul tidak boleh kosong').optional(),
  requirements: z.string().min(1, 'Persyaratan tidak boleh kosong').optional(),
  responsibilities: z.string().optional(),
  is_active: z.boolean().optional(),
  by: z.string(),
});

export type UpdateVolDto = z.infer<typeof updateVolSchema>;

export const createVolApplSchema = z.object({
  volunteer_id: z.string(),
  fullname: z.string().min(1, 'Nama lengkap tidak boleh kosong'),
  email: z.string().email('Format email tidak valid'),
  institution: z.string().min(1, 'Institusi tidak boleh kosong'),
  level: z.enum([
    'TK',
    'SD',
    'SMP',
    'SMA',
    'SMK',
    'D1',
    'D2',
    'D3',
    'D4',
    'S1',
    'S2',
    'S3',
  ]),
  study_program: z.string().min(1, 'Program studi tidak boleh kosong'),
  reason: z.string().min(1, 'Alasan tidak boleh kosong'),
});

export type CreateVolApplDto = z.infer<typeof createVolApplSchema>;

export const updateVolApplSchema = z.object({
  vol_appl_id: z.string(),
  by: z.string(),
});

export type UpdateVolApplDto = z.infer<typeof updateVolApplSchema>;
