import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from '../utils/jwt.js';

// Δημόσια μορφή χρήστη — δεν εκθέτει ποτέ το password_hash
const publicUser = (u) => ({ id: u.user_id, name: u.name, email: u.email });

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (:userId, :hash, :expiresAt)`,
    { userId: user.user_id, hash: hashRefreshToken(refreshToken), expiresAt: refreshTokenExpiry() },
  );
  return { accessToken, refreshToken };
}

export async function register({ name, email, password }) {
  const passwordHash = await hashPassword(password);
  let result;
  try {
    [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :hash)`,
      { name, email, hash: passwordHash },
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw ApiError.conflict('Email is already registered');
    throw err;
  }
  const user = { user_id: result.insertId, name, email };
  return { user: publicUser(user), ...(await issueTokens(user)) };
}

export async function login({ email, password }) {
  const [rows] = await pool.execute(
    `SELECT user_id, name, email, password_hash FROM users WHERE email = :email`,
    { email },
  );
  const user = rows[0];
  // Ίδιο μήνυμα για άγνωστο email ή λάθος κωδικό (αποφυγή enumeration)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  return { user: publicUser(user), ...(await issueTokens(user)) };
}

export async function refresh({ refreshToken }) {
  const tokenHash = hashRefreshToken(refreshToken);
  const [rows] = await pool.execute(
    `SELECT rt.token_id, rt.user_id, rt.expires_at, rt.revoked_at, u.name, u.email
       FROM refresh_tokens rt
       JOIN users u ON u.user_id = rt.user_id
      WHERE rt.token_hash = :hash`,
    { hash: tokenHash },
  );
  const row = rows[0];
  if (!row || row.revoked_at || new Date(row.expires_at) < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Rotation: ανάκληση του παλιού token και έκδοση νέου ζεύγους μέσα σε transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_id = :id`,
      { id: row.token_id },
    );
    const user = { user_id: row.user_id, name: row.name, email: row.email };
    const accessToken = signAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    await conn.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (:userId, :hash, :expiresAt)`,
      { userId: user.user_id, hash: hashRefreshToken(newRefreshToken), expiresAt: refreshTokenExpiry() },
    );
    await conn.commit();
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function logout({ refreshToken }) {
  await pool.execute(
    `UPDATE refresh_tokens SET revoked_at = NOW()
      WHERE token_hash = :hash AND revoked_at IS NULL`,
    { hash: hashRefreshToken(refreshToken) },
  );
}

export async function getUserById(id) {
  const [rows] = await pool.execute(
    `SELECT user_id, name, email FROM users WHERE user_id = :id`,
    { id },
  );
  if (!rows[0]) throw ApiError.notFound('User not found');
  return publicUser(rows[0]);
}
