import * as reservationService from '../services/reservation.service.js';

export async function reservations(req, res) {
  res.json(await reservationService.getUserReservations(req.user.id));
}
