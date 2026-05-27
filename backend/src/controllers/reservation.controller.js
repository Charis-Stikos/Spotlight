import * as reservationService from '../services/reservation.service.js';

export async function create(req, res) {
  res.status(201).json(await reservationService.createReservation(req.user.id, req.body));
}

export async function getOne(req, res) {
  res.json(await reservationService.getReservation(req.user.id, req.params.id));
}

export async function modify(req, res) {
  res.json(await reservationService.modifyReservation(req.user.id, req.params.id, req.body));
}

export async function cancel(req, res) {
  await reservationService.cancelReservation(req.user.id, req.params.id);
  res.status(204).send();
}
