import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

// Μελλοντικές προβολές, προαιρετικά ανά παράσταση ή/και ημέρα
export async function listShowtimes({ showId, date } = {}) {
  const where = ['st.starts_at >= NOW()'];
  const params = {};
  if (showId) { where.push('st.show_id = :showId'); params.showId = showId; }
  if (date) { where.push('DATE(st.starts_at) = :date'); params.date = date; }

  const [rows] = await pool.execute(
    `SELECT st.showtime_id AS id, st.show_id AS showId, st.hall_id AS hallId,
            st.starts_at AS startsAt, st.base_price AS basePrice,
            h.name AS hallName, s.title AS showTitle,
            t.theatre_id AS theatreId, t.name AS theatreName, t.location
       FROM showtimes st
       JOIN halls h ON h.hall_id = st.hall_id
       JOIN shows s ON s.show_id = st.show_id
       JOIN theatres t ON t.theatre_id = s.theatre_id
      WHERE ${where.join(' AND ')}
      ORDER BY st.starts_at`,
    params,
  );
  return rows;
}

export async function getShowtime(id) {
  const [rows] = await pool.execute(
    `SELECT st.showtime_id AS id, st.show_id AS showId, st.hall_id AS hallId,
            st.starts_at AS startsAt, st.base_price AS basePrice,
            h.name AS hallName, s.title AS showTitle, s.duration_min AS durationMin,
            s.age_rating AS ageRating,
            t.theatre_id AS theatreId, t.name AS theatreName, t.location
       FROM showtimes st
       JOIN halls h ON h.hall_id = st.hall_id
       JOIN shows s ON s.show_id = st.show_id
       JOIN theatres t ON t.theatre_id = s.theatre_id
      WHERE st.showtime_id = :id`,
    { id },
  );
  if (!rows[0]) throw ApiError.notFound('Showtime not found');

  const [prices] = await pool.execute(
    `SELECT category, price FROM showtime_prices WHERE showtime_id = :id ORDER BY price`,
    { id },
  );
  return { ...rows[0], prices };
}

// Χάρτης θέσεων: όλες οι θέσεις της αίθουσας με την τιμή τους και αν είναι κρατημένες για αυτή την προβολή
export async function getSeatMap(showtimeId) {
  const [stRows] = await pool.execute(
    `SELECT hall_id AS hallId, base_price AS basePrice FROM showtimes WHERE showtime_id = :id`,
    { id: showtimeId },
  );
  if (!stRows[0]) throw ApiError.notFound('Showtime not found');
  const { hallId, basePrice } = stRows[0];

  const [seats] = await pool.execute(
    `SELECT se.seat_id AS seatId, se.row_label AS rowLabel, se.seat_number AS number,
            se.category,
            COALESCE(sp.price, :basePrice) AS price,
            (rs.seat_id IS NOT NULL) AS taken
       FROM seats se
       LEFT JOIN showtime_prices sp
              ON sp.showtime_id = :showtimeId AND sp.category = se.category
       LEFT JOIN reservation_seats rs
              ON rs.showtime_id = :showtimeId AND rs.seat_id = se.seat_id
      WHERE se.hall_id = :hallId
      ORDER BY se.row_label, se.seat_number`,
    { showtimeId, hallId, basePrice },
  );

  return seats.map((s) => ({ ...s, taken: Boolean(s.taken) }));
}
