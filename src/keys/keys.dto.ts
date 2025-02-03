import { z } from 'zod';

export const createKeySchema = z.object({
  access_key: z.string(),
  value: z.string(),
  by: z.string(),
});

export type CreateKeyDto = z.infer<typeof createKeySchema>;
