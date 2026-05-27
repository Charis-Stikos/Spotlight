import * as showService from '../services/show.service.js';

export async function list(req, res) {
  res.json(await showService.listShows(req.query));
}

export async function getOne(req, res) {
  res.json(await showService.getShow(req.params.id));
}
