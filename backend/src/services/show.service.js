import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

// Λίστα παραστάσεων με προαιρετικά φίλτρα: theatreId, τίτλος, ημερομηνία προβολής
export async function listShows({ theatreId, title, date } = {}) {
  const where = [];
  const params = {};
  let dateJoin = '';

  if (theatreId) { where.push('s.theatre_id = :theatreId'); params.theatreId = theatreId; }
  if (title) { where.push('s.title LIKE :title'); params.title = `%${title}%`; }
  if (date) {
    dateJoin = 'JOIN showtimes st ON st.show_id = s.show_id AND DATE(st.starts_at) = :date';
    params.date = date;
  }

  const sql =
    `SELECT DISTINCT s.show_id AS id, s.theatre_id AS theatreId, s.title, s.description,
            s.duration_min AS durationMin, s.age_rating AS ageRating, s.poster_url AS posterUrl,
            t.name AS theatreName, t.location AS theatreLocation
       FROM shows s
       JOIN theatres t ON t.theatre_id = s.theatre_id
       ${dateJoin}
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY s.title`;

  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getShow(id) {
  const [rows] = await pool.execute(
    `SELECT s.show_id AS id, s.theatre_id AS theatreId, s.title, s.description,
            s.duration_min AS durationMin, s.age_rating AS ageRating, s.poster_url AS posterUrl,
            t.name AS theatreName, t.location AS theatreLocation
       FROM shows s
       JOIN theatres t ON t.theatre_id = s.theatre_id
      WHERE s.show_id = :id`,
    { id },
  );
  if (!rows[0]) throw ApiError.notFound('Show not found');
  return rows[0];
}
