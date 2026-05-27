import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

// Δημιουργεί IN-list με named placeholders (:s0, :s1, ...) και γεμίζει το params
function buildSeatInClause(seatIds, params) {
  return seatIds
    .map((id, i) => {
      params[`s${i}`] = id;
      return `:s${i}`;
    })
    .join(', ');
}

// Φορτώνει τις θέσεις της αίθουσας με την τιμή της κατηγορίας τους για τη συγκεκριμένη προβολή
async function loadSeatsForHall(conn, { seatIds, hallId, showtimeId, basePrice }) {
  const params = { hallId, showtimeId, basePrice };
  const inClause = buildSeatInClause(seatIds, params);
  const [rows] = await conn.execute(
    `SELECT se.seat_id AS seatId, se.row_label AS rowLabel, se.seat_number AS number,
            se.category, COALESCE(sp.price, :basePrice) AS price
       FROM seats se
       LEFT JOIN showtime_prices sp
              ON sp.showtime_id = :showtimeId AND sp.category = se.category
      WHERE se.hall_id = :hallId AND se.seat_id IN (${inClause})`,
    params,
  );
  if (rows.length !== seatIds.length) {
    throw ApiError.badRequest('One or more selected seats do not exist in this hall');
  }
  return rows;
}

// Κλειδώνει (FOR UPDATE) και επιστρέφει όσες από τις θέσεις είναι ήδη κρατημένες
async function findTakenSeats(conn, { seatIds, showtimeId }) {
  const params = { showtimeId };
  const inClause = buildSeatInClause(seatIds, params);
  const [rows] = await conn.execute(
    `SELECT seat_id AS seatId FROM reservation_seats
      WHERE showtime_id = :showtimeId AND seat_id IN (${inClause})
      FOR UPDATE`,
    params,
  );
  return rows.map((r) => r.seatId);
}

// Το UNIQUE(showtime_id, seat_id) είναι η οριστική εγγύηση: ταυτόχρονη κράτηση → ER_DUP_ENTRY → 409
async function insertReservationSeats(conn, reservationId, showtimeId, seats) {
  for (const seat of seats) {
    try {
      await conn.execute(
        `INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id, price)
         VALUES (:rid, :showtimeId, :seatId, :price)`,
        { rid: reservationId, showtimeId, seatId: seat.seatId, price: seat.price },
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw ApiError.conflict('A selected seat was just booked by someone else', {
          seatId: seat.seatId,
        });
      }
      throw err;
    }
  }
}

export async function createReservation(userId, { showtimeId, seatIds }) {
  const uniqueSeatIds = [...new Set(seatIds)];
  const conn = await pool.getConnection();
  let reservationId;
  try {
    await conn.beginTransaction();

    const [stRows] = await conn.execute(
      `SELECT hall_id AS hallId, base_price AS basePrice FROM showtimes WHERE showtime_id = :id`,
      { id: showtimeId },
    );
    if (!stRows[0]) throw ApiError.notFound('Showtime not found');
    const { hallId, basePrice } = stRows[0];

    const seats = await loadSeatsForHall(conn, { seatIds: uniqueSeatIds, hallId, showtimeId, basePrice });

    const taken = await findTakenSeats(conn, { seatIds: uniqueSeatIds, showtimeId });
    if (taken.length > 0) {
      throw ApiError.conflict('Some of the selected seats are no longer available', { takenSeatIds: taken });
    }

    const total = seats.reduce((sum, s) => sum + Number(s.price), 0);
    const [result] = await conn.execute(
      `INSERT INTO reservations (user_id, showtime_id, status, total_price)
       VALUES (:userId, :showtimeId, 'CONFIRMED', :total)`,
      { userId, showtimeId, total },
    );
    reservationId = result.insertId;

    await insertReservationSeats(conn, reservationId, showtimeId, seats);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return getReservation(userId, reservationId);
}

export async function getReservation(userId, reservationId) {
  const [rows] = await pool.execute(
    `SELECT r.reservation_id AS id, r.status, r.total_price AS totalPrice, r.created_at AS createdAt,
            st.showtime_id AS showtimeId, st.starts_at AS startsAt,
            s.title AS showTitle, t.name AS theatreName, t.location, h.name AS hallName
       FROM reservations r
       JOIN showtimes st ON st.showtime_id = r.showtime_id
       JOIN shows s ON s.show_id = st.show_id
       JOIN theatres t ON t.theatre_id = s.theatre_id
       JOIN halls h ON h.hall_id = st.hall_id
      WHERE r.reservation_id = :id AND r.user_id = :userId`,
    { id: reservationId, userId },
  );
  if (!rows[0]) throw ApiError.notFound('Reservation not found');

  const [seats] = await pool.execute(
    `SELECT rs.seat_id AS seatId, se.row_label AS rowLabel, se.seat_number AS number,
            se.category, rs.price
       FROM reservation_seats rs
       JOIN seats se ON se.seat_id = rs.seat_id
      WHERE rs.reservation_id = :id
      ORDER BY se.row_label, se.seat_number`,
    { id: reservationId },
  );
  return { ...rows[0], seats };
}

export async function getUserReservations(userId) {
  const [rows] = await pool.execute(
    `SELECT r.reservation_id AS id, r.status, r.total_price AS totalPrice, r.created_at AS createdAt,
            st.showtime_id AS showtimeId, st.starts_at AS startsAt,
            s.title AS showTitle, t.name AS theatreName, t.location, h.name AS hallName,
            COUNT(rs.reservation_seat_id) AS seatCount
       FROM reservations r
       JOIN showtimes st ON st.showtime_id = r.showtime_id
       JOIN shows s ON s.show_id = st.show_id
       JOIN theatres t ON t.theatre_id = s.theatre_id
       JOIN halls h ON h.hall_id = st.hall_id
       LEFT JOIN reservation_seats rs ON rs.reservation_id = r.reservation_id
      WHERE r.user_id = :userId
      GROUP BY r.reservation_id
      ORDER BY st.starts_at DESC`,
    { userId },
  );
  return rows.map((r) => ({ ...r, seatCount: Number(r.seatCount) }));
}

export async function cancelReservation(userId, reservationId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      `SELECT r.status, st.starts_at AS startsAt
         FROM reservations r
         JOIN showtimes st ON st.showtime_id = r.showtime_id
        WHERE r.reservation_id = :id AND r.user_id = :userId
        FOR UPDATE`,
      { id: reservationId, userId },
    );
    const reservation = rows[0];
    if (!reservation) throw ApiError.notFound('Reservation not found');

    if (reservation.status === 'CANCELLED') {
      await conn.commit();
      return; // ήδη ακυρωμένη — idempotent
    }
    if (new Date(reservation.startsAt) < new Date()) {
      throw ApiError.badRequest('Cannot cancel a reservation for a past showtime');
    }

    await conn.execute(
      `UPDATE reservations SET status = 'CANCELLED' WHERE reservation_id = :id`,
      { id: reservationId },
    );
    // Η διαγραφή των θέσεων τις ελευθερώνει ξανά (καθαρίζει το UNIQUE)
    await conn.execute(`DELETE FROM reservation_seats WHERE reservation_id = :id`, { id: reservationId });

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function modifyReservation(userId, reservationId, { seatIds }) {
  const uniqueSeatIds = [...new Set(seatIds)];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      `SELECT r.showtime_id AS showtimeId, r.status, st.hall_id AS hallId,
              st.base_price AS basePrice, st.starts_at AS startsAt
         FROM reservations r
         JOIN showtimes st ON st.showtime_id = r.showtime_id
        WHERE r.reservation_id = :id AND r.user_id = :userId
        FOR UPDATE`,
      { id: reservationId, userId },
    );
    const reservation = rows[0];
    if (!reservation) throw ApiError.notFound('Reservation not found');
    if (reservation.status !== 'CONFIRMED') {
      throw ApiError.badRequest('Only confirmed reservations can be modified');
    }
    if (new Date(reservation.startsAt) < new Date()) {
      throw ApiError.badRequest('Cannot modify a reservation for a past showtime');
    }
    const { showtimeId, hallId, basePrice } = reservation;

    // Απελευθέρωση των τρεχουσών θέσεων ώστε ο χρήστης να μπορεί να κρατήσει κάποιες ξανά
    await conn.execute(`DELETE FROM reservation_seats WHERE reservation_id = :id`, { id: reservationId });

    const seats = await loadSeatsForHall(conn, { seatIds: uniqueSeatIds, hallId, showtimeId, basePrice });

    const taken = await findTakenSeats(conn, { seatIds: uniqueSeatIds, showtimeId });
    if (taken.length > 0) {
      throw ApiError.conflict('Some of the selected seats are no longer available', { takenSeatIds: taken });
    }

    await insertReservationSeats(conn, reservationId, showtimeId, seats);

    const total = seats.reduce((sum, s) => sum + Number(s.price), 0);
    await conn.execute(
      `UPDATE reservations SET total_price = :total WHERE reservation_id = :id`,
      { total, id: reservationId },
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return getReservation(userId, reservationId);
}
