// Controllers ταυτοποίησης — προωθούν τα αιτήματα στο auth.service και επιστρέφουν JSON
import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  res.status(201).json(await authService.register(req.body));
}

export async function login(req, res) {
  res.json(await authService.login(req.body));
}

export async function refresh(req, res) {
  res.json(await authService.refresh(req.body));
}

export async function logout(req, res) {
  await authService.logout(req.body);
  res.status(204).send();
}

export async function me(req, res) {
  res.json({ user: await authService.getUserById(req.user.id) });
}
