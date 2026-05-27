import mysql from 'mysql2/promise';
import { config } from './env.js';

// Κοινό pool συνδέσεων προς τη MariaDB
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  charset: 'utf8mb4',       // πλήρης υποστήριξη ελληνικών
  connectionLimit: config.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  namedPlaceholders: true,  // placeholders της μορφής :name
  decimalNumbers: true,     // DECIMAL ως αριθμοί JS
  timezone: 'Z',            // DATETIME ως UTC
});

// Έλεγχος σύνδεσης κατά την εκκίνηση (fail fast)
export async function assertDbConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
