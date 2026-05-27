import rateLimit from 'express-rate-limit';

// Περιορισμός ρυθμού στα endpoints ταυτοποίησης (κατά brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 λεπτά
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later.' } },
});
