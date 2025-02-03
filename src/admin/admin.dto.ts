import { z } from 'zod';

export type AdminQuery = {
  q?: string;
  page: string;
};

export const createAdminSchema = z.object({
  fullname: z
    .string()
    .min(1, { message: 'Nama lengkap wajib diisi' })
    .trim()
    .transform((val) => val.replace(/\s+/g, ' ')),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
  role: z.enum(['admin', 'superadmin']),
  access_key: z.string().min(8, { message: 'Access key minimal 8 karakter' }),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;

export const updateAdminSchema = z.object({
  fullname: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ' '))
    .optional(),
  password: z
    .string()
    .min(8, { message: 'Password minimal 8 karakter' })
    .optional(),
  role: z.enum(['admin', 'superadmin']).optional(),
  access_key: z.string().min(8, { message: 'Access key minimal 8 karakter' }),
  admin_id: z.string(),
});

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
