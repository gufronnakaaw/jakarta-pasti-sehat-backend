import { z } from 'zod';

export type EventsQuery = {
  q?: string;
  page?: string;
  filter?: string;
};

export const createEventSchema = z.object({
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  detail: z.string(),
  type: z.enum(['free', 'paid']),
  location: z.string(),
  map_url: z.string().optional(),
  payment_url: z.string().optional(),
  by: z.string(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  event_id: z.string(),
  pillar_id: z.string().optional(),
  sub_pillar_id: z.string().optional(),
  title: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  detail: z.string().optional(),
  type: z.enum(['free', 'paid']).optional(),
  location: z.string().optional(),
  map_url: z.string().optional(),
  payment_url: z.string().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  by: z.string(),
});

export type UpdateEventDto = z.infer<typeof updateEventSchema>;
