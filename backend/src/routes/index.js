// Κεντρικός router — συνδέει όλες τις υποδιαδρομές κάτω από το /api
import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { theatreRoutes } from './theatre.routes.js';
import { showRoutes } from './show.routes.js';
import { showtimeRoutes } from './showtime.routes.js';
import { reservationRoutes } from './reservation.routes.js';
import { userRoutes } from './user.routes.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/theatres', theatreRoutes);
router.use('/shows', showRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/reservations', reservationRoutes);
router.use('/user', userRoutes);
