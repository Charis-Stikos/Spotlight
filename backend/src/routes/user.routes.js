import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get('/reservations', asyncHandler(userController.reservations));
