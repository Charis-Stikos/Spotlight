import { api } from './client';

export const createReservation = (showtimeId, seatIds) =>
  api.post('/reservations', { showtimeId, seatIds }).then((r) => r.data);

export const getMyReservations = () =>
  api.get('/user/reservations').then((r) => r.data);

export const getReservation = (id) =>
  api.get(`/reservations/${id}`).then((r) => r.data);

export const modifyReservation = (id, seatIds) =>
  api.patch(`/reservations/${id}`, { seatIds }).then((r) => r.data);

export const cancelReservation = (id) =>
  api.delete(`/reservations/${id}`).then((r) => r.data);
