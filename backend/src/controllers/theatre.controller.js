// Controllers θεάτρων — προωθούν στο theatre.service
import * as theatreService from '../services/theatre.service.js';

export async function list(req, res) {
  res.json(await theatreService.listTheatres(req.query));
}

export async function getOne(req, res) {
  res.json(await theatreService.getTheatre(req.params.id));
}
