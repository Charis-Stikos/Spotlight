import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

// Λίστα/αναζήτηση θεάτρων (με βάση όνομα ή τοποθεσία)
export async function listTheatres({ q } = {}) {
  if (q) {
    const like = `%${q}%`;
    const [rows] = await pool.execute(
      `SELECT theatre_id AS id, name, location, description
         FROM theatres
        WHERE name LIKE :like OR location LIKE :like
        ORDER BY name`,
      { like },
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT theatre_id AS id, name, location, description FROM theatres ORDER BY name`,
  );
  return rows;
}

// Θέατρο μαζί με τις παραστάσεις του
export async function getTheatre(id) {
  const [rows] = await pool.execute(
    `SELECT theatre_id AS id, name, location, description FROM theatres WHERE theatre_id = :id`,
    { id },
  );
  if (!rows[0]) throw ApiError.notFound('Theatre not found');

  const [shows] = await pool.execute(
    `SELECT show_id AS id, title, description, duration_min AS durationMin,
            age_rating AS ageRating, poster_url AS posterUrl
       FROM shows WHERE theatre_id = :id ORDER BY title`,
    { id },
  );
  return { ...rows[0], shows };
}
