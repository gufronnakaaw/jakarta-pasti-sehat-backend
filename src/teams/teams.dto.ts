import { z } from 'zod';

export type TeamsQuery = {
  q?: string;
  page: string;
};

export const createTeamsSchema = z.object({
  position_id: z.string(),
  fullname: z.string(),
  description: z.string(),
  educations: z
    .array(
      z.object({
        name: z.string(),
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
      }),
    )
    .optional(),
  social_links: z
    .array(
      z.object({
        name: z.enum(['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'LINKEDIN']),
        url: z.string(),
      }),
    )
    .optional(),
  with_education: z.enum(['true', 'false']),
  with_social_links: z.enum(['true', 'false']),
  by: z.string(),
});

export type CreateTeamsDto = z.infer<typeof createTeamsSchema>;

export const updateTeamsSchema = z.object({
  team_id: z.string(),
  position_id: z.string().optional(),
  fullname: z.string().optional(),
  description: z.string().optional(),
  educations: z
    .array(
      z.object({
        education_id: z.string(),
        name: z.string().optional(),
        level: z
          .enum([
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
          ])
          .optional(),
      }),
    )
    .optional(),
  social_links: z
    .array(
      z.object({
        socmed_id: z.string(),
        name: z.enum(['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'LINKEDIN']).optional(),
        url: z.string().optional(),
      }),
    )
    .optional(),
  by: z.string(),
});

export type UpdateTeamsDto = z.infer<typeof updateTeamsSchema>;
