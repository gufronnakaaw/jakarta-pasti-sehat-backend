import { z } from 'zod';

export const adminLoginSchema = z.object({
  access_key: z.string().min(1, { message: 'Admin ID wajib diisi' }),
  admin_id: z.string().min(1, { message: 'Admin ID wajib diisi' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
});

export type AdminLoginDto = z.infer<typeof adminLoginSchema>;
