// Διαδρομές παραστάσεων (δημόσιες)
import { Router } from 'express';
import * as controller from '../controllers/show.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { showsQuery, idParam } from '../validators/catalog.schema.js';

export const showRoutes = Router();

showRoutes.get('/', validate(showsQuery, 'query'), asyncHandler(controller.list));
showRoutes.get('/:id', validate(idParam, 'params'), asyncHandler(controller.getOne));
