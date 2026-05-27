-- =============================================================================
--  Spotlight — Σχήμα βάσης (MariaDB / DDL)
--    utf8mb4 για σωστή αποθήκευση ελληνικών.
--    InnoDB παντού για foreign keys + row-level locking (έλεγχος ταυτόχρονων κρατήσεων).
--    Εγγύηση κράτησης: UNIQUE(showtime_id, seat_id) στο reservation_seats.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS spotlight
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spotlight;

SET NAMES utf8mb4;

-- Διαγραφή με αντίστροφη σειρά εξαρτήσεων ώστε το script να ξανατρέχει καθαρά.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reservation_seats;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS showtime_prices;
DROP TABLE IF EXISTS showtimes;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS halls;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS theatres;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Χρήστες
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  user_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,           -- bcrypt hash, ποτέ ο κωδικός
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Refresh tokens — υποστηρίζουν το JWT refresh & την ανάκληση· αποθηκεύεται μόνο SHA-256 hash.
-- -----------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
  token_id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)        NOT NULL,              -- sha256 hex
  expires_at TIMESTAMP       NOT NULL,
  revoked_at TIMESTAMP       NULL DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_id),
  UNIQUE KEY uq_refresh_hash (token_hash),
  KEY idx_refresh_user (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Θέατρα
-- -----------------------------------------------------------------------------
CREATE TABLE theatres (
  theatre_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)    NOT NULL,
  location    VARCHAR(150)    NOT NULL,
  description TEXT            NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (theatre_id),
  KEY idx_theatres_location (location),
  KEY idx_theatres_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Αίθουσες — ένα θέατρο έχει μία ή περισσότερες αίθουσες.
-- -----------------------------------------------------------------------------
CREATE TABLE halls (
  hall_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  theatre_id BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(100)    NOT NULL,
  PRIMARY KEY (hall_id),
  KEY idx_halls_theatre (theatre_id),
  CONSTRAINT fk_halls_theatre FOREIGN KEY (theatre_id)
    REFERENCES theatres (theatre_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Θέσεις — οι φυσικές θέσεις μιας αίθουσας.
-- -----------------------------------------------------------------------------
CREATE TABLE seats (
  seat_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hall_id     BIGINT UNSIGNED NOT NULL,
  row_label   VARCHAR(3)      NOT NULL,                                  -- 'A', 'B', ...
  seat_number INT UNSIGNED    NOT NULL,                                  -- 1..N
  category    ENUM('STANDARD','PREMIUM','VIP') NOT NULL DEFAULT 'STANDARD',
  PRIMARY KEY (seat_id),
  UNIQUE KEY uq_seat_in_hall (hall_id, row_label, seat_number),
  KEY idx_seats_hall (hall_id),
  CONSTRAINT fk_seats_hall FOREIGN KEY (hall_id)
    REFERENCES halls (hall_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Παραστάσεις (παραγωγές) ενός θεάτρου.
-- -----------------------------------------------------------------------------
CREATE TABLE shows (
  show_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  theatre_id   BIGINT UNSIGNED NOT NULL,
  title        VARCHAR(200)    NOT NULL,
  description  TEXT            NULL,
  duration_min INT UNSIGNED    NOT NULL,
  age_rating   VARCHAR(10)     NULL,                  -- 'ALL','12','15','18'
  poster_url   VARCHAR(500)    NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (show_id),
  KEY idx_shows_theatre (theatre_id),
  KEY idx_shows_title (title),
  CONSTRAINT fk_shows_theatre FOREIGN KEY (theatre_id)
    REFERENCES theatres (theatre_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Προβολές — μια προβολή παράστασης, σε αίθουσα, σε συγκεκριμένη στιγμή.
-- Μια αίθουσα δεν φιλοξενεί δύο προβολές την ίδια στιγμή (uq_hall_slot).
-- -----------------------------------------------------------------------------
CREATE TABLE showtimes (
  showtime_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  show_id     BIGINT UNSIGNED NOT NULL,
  hall_id     BIGINT UNSIGNED NOT NULL,
  starts_at   DATETIME        NOT NULL,
  base_price  DECIMAL(8,2)    NOT NULL,
  PRIMARY KEY (showtime_id),
  UNIQUE KEY uq_hall_slot (hall_id, starts_at),
  KEY idx_showtimes_show (show_id),
  KEY idx_showtimes_starts (starts_at),
  CONSTRAINT fk_showtimes_show FOREIGN KEY (show_id)
    REFERENCES shows (show_id) ON DELETE CASCADE,
  CONSTRAINT fk_showtimes_hall FOREIGN KEY (hall_id)
    REFERENCES halls (hall_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Τιμές προβολής — τιμή ανά κατηγορία θέσης για μια προβολή.
-- -----------------------------------------------------------------------------
CREATE TABLE showtime_prices (
  showtime_id BIGINT UNSIGNED NOT NULL,
  category    ENUM('STANDARD','PREMIUM','VIP') NOT NULL,
  price       DECIMAL(8,2)    NOT NULL,
  PRIMARY KEY (showtime_id, category),
  CONSTRAINT fk_stprices_showtime FOREIGN KEY (showtime_id)
    REFERENCES showtimes (showtime_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Κρατήσεις — μια κράτηση χρήστη για μία προβολή.
-- -----------------------------------------------------------------------------
CREATE TABLE reservations (
  reservation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED NOT NULL,
  showtime_id    BIGINT UNSIGNED NOT NULL,
  status         ENUM('CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  total_price    DECIMAL(10,2)   NOT NULL DEFAULT 0,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id),
  KEY idx_res_user (user_id),
  KEY idx_res_showtime (showtime_id),
  CONSTRAINT fk_res_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_res_showtime FOREIGN KEY (showtime_id)
    REFERENCES showtimes (showtime_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Θέσεις κράτησης — ποιες φυσικές θέσεις κρατά μια κράτηση.
--   Το showtime_id είναι denormalised ΣΚΟΠΙΜΑ, ώστε το UNIQUE(showtime_id, seat_id)
--   να εγγυάται σε επίπεδο βάσης ότι μια θέση δεν πωλείται δύο φορές για την ίδια
--   προβολή — ακόμα και σε ταυτόχρονα αιτήματα. Στην ακύρωση διαγράφονται οι γραμμές
--   και οι θέσεις ξαναγίνονται διαθέσιμες.
-- -----------------------------------------------------------------------------
CREATE TABLE reservation_seats (
  reservation_seat_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id      BIGINT UNSIGNED NOT NULL,
  showtime_id         BIGINT UNSIGNED NOT NULL,
  seat_id             BIGINT UNSIGNED NOT NULL,
  price               DECIMAL(8,2)    NOT NULL,
  PRIMARY KEY (reservation_seat_id),
  UNIQUE KEY uq_seat_per_showtime (showtime_id, seat_id),
  KEY idx_rs_reservation (reservation_id),
  KEY idx_rs_seat (seat_id),
  CONSTRAINT fk_rs_reservation FOREIGN KEY (reservation_id)
    REFERENCES reservations (reservation_id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_showtime FOREIGN KEY (showtime_id)
    REFERENCES showtimes (showtime_id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_seat FOREIGN KEY (seat_id)
    REFERENCES seats (seat_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
