// Controllers προβολών — προωθούν στο showtime.service
import * as showtimeService from '../services/showtime.service.js';

export async function list(req, res) {
  res.json(await showtimeService.listShowtimes(req.query));
}

export async function getOne(req, res) {
  res.json(await showtimeService.getShowtime(req.params.id));
}

export async function seats(req, res) {
  res.json(await showtimeService.getSeatMap(req.params.id));
}
