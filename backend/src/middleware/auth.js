import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

// Απαιτεί έγκυρο "Authorization: Bearer <token>" και προσθέτει τον χρήστη στο req.user
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: Number(payload.sub), email: payload.email, name: payload.name };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
