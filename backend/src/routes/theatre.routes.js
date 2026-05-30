// Διαδρομές θεάτρων (δημόσιες)
import { Router } from 'express';
import * as controller from '../controllers/theatre.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { theatresQuery, idParam } from '../validators/catalog.schema.js';

export const theatreRoutes = Router();

theatreRoutes.get('/', validate(theatresQuery, 'query'), asyncHandler(controller.list));
theatreRoutes.get('/:id', validate(idParam, 'params'), asyncHandler(controller.getOne));
