import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.schema.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
authRoutes.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
authRoutes.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
authRoutes.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));
authRoutes.get('/me', requireAuth, asyncHandler(authController.me));
