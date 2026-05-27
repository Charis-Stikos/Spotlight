import { Router } from 'express';
import * as controller from '../controllers/reservation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createReservationSchema, modifyReservationSchema } from '../validators/reservation.schema.js';
import { idParam } from '../validators/catalog.schema.js';

export const reservationRoutes = Router();

// Όλες οι διαδρομές κρατήσεων απαιτούν σύνδεση
reservationRoutes.use(requireAuth);

reservationRoutes.post('/', validate(createReservationSchema), asyncHandler(controller.create));
reservationRoutes.get('/:id', validate(idParam, 'params'), asyncHandler(controller.getOne));
reservationRoutes.patch('/:id', validate(idParam, 'params'), validate(modifyReservationSchema), asyncHandler(controller.modify));
reservationRoutes.delete('/:id', validate(idParam, 'params'), asyncHandler(controller.cancel));
