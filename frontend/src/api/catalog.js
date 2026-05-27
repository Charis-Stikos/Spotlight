import { api } from './client';

export const getTheatres = (q) =>
  api.get('/theatres', { params: q ? { q } : {} }).then((r) => r.data);

export const getTheatre = (id) => api.get(`/theatres/${id}`).then((r) => r.data);

export const getShows = (filters = {}) =>
  api.get('/shows', { params: filters }).then((r) => r.data);

export const getShow = (id) => api.get(`/shows/${id}`).then((r) => r.data);

export const getShowtimes = (showId) =>
  api.get('/showtimes', { params: showId ? { showId } : {} }).then((r) => r.data);

export const getShowtime = (id) => api.get(`/showtimes/${id}`).then((r) => r.data);

export const getSeatMap = (showtimeId) =>
  api.get(`/showtimes/${showtimeId}/seats`).then((r) => r.data);
