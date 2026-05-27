import { z } from 'zod';

export const createReservationSchema = z.object({
  showtimeId: z.coerce.number().int().positive(),
  seatIds: z
    .array(z.number().int().positive())
    .min(1, 'Select at least one seat')
    .max(10, 'At most 10 seats per booking'),
});

export const modifyReservationSchema = z.object({
  seatIds: z
    .array(z.number().int().positive())
    .min(1, 'Select at least one seat')
    .max(10, 'At most 10 seats per booking'),
});
