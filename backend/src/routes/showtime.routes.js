// Διαδρομές προβολών & χάρτη θέσεων (δημόσιες)
import { Router } from 'express';
import * as controller from '../controllers/showtime.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { showtimesQuery, idParam } from '../validators/catalog.schema.js';

export const showtimeRoutes = Router();

showtimeRoutes.get('/', validate(showtimesQuery, 'query'), asyncHandler(controller.list));
showtimeRoutes.get('/:id', validate(idParam, 'params'), asyncHandler(controller.getOne));
showtimeRoutes.get('/:id/seats', validate(idParam, 'params'), asyncHandler(controller.seats));
