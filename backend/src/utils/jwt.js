import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.user_id, email: user.email, name: user.name },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_TTL },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

// Στη βάση αποθηκεύεται μόνο το hash του refresh token, ώστε διαρροή να μην εκθέτει χρηστικά tokens
export function hashRefreshToken(token) {
  return crypto.createHmac('sha256', config.JWT_REFRESH_SECRET).update(token).digest('hex');
}

export function refreshTokenExpiry() {
  return new Date(Date.now() + durationToMs(config.JWT_REFRESH_TTL));
}

// Μετατροπή διάρκειας τύπου "15m", "30d" σε ms
function durationToMs(str) {
  const match = /^(\d+)([smhd])$/.exec(String(str).trim());
  if (!match) throw new Error(`Invalid duration: ${str}`);
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * units[match[2]];
}
