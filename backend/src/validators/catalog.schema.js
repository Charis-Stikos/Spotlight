import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const theatresQuery = z.object({
  q: z.string().trim().min(1).max(150).optional(),
});

export const showsQuery = z.object({
  theatreId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  date: dateString.optional(),
});

export const showtimesQuery = z.object({
  showId: z.coerce.number().int().positive().optional(),
  date: dateString.optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});
