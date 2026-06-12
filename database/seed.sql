-- =============================================================================
--  Spotlight — Δεδομένα δοκιμής (τρέχει μετά το schema.sql)
--  Ρεαλιστικό ελληνικό ρεπερτόριο: 8 θέατρα, 16 αίθουσες, 20 παραγωγές, 40 προβολές.
-- =============================================================================
USE spotlight;
SET NAMES utf8mb4;

-- --- Θέατρα -------------------------------------------------------------------
INSERT INTO theatres (theatre_id, name, location, description) VALUES
  (1, 'Θέατρο Παλλάς',                  'Αθήνα',        'Ιστορικό θέατρο στο κέντρο της Αθήνας, γνωστό για μεγάλες μουσικές παραγωγές.'),
  (2, 'Εθνικό Θέατρο',                  'Αθήνα',        'Η κεντρική σκηνή του ελληνικού δραματικού ρεπερτορίου, στο νεοκλασικό κτίριο Τσίλλερ.'),
  (3, 'Θέατρο Τέχνης «Κάρολος Κουν»',   'Αθήνα',        'Θρυλική σκηνή του ελληνικού θεάτρου, με έμφαση στο σύγχρονο ρεπερτόριο.'),
  (4, 'Δημοτικό Θέατρο Πειραιά',        'Πειραιάς',     'Επιβλητικό νεοκλασικό θέατρο της πόλης του Πειραιά.'),
  (5, 'Κρατικό Θέατρο Βορείου Ελλάδος', 'Θεσσαλονίκη',  'Ο μεγαλύτερος θεατρικός οργανισμός της Βόρειας Ελλάδας.'),
  (6, 'Θέατρο Δάσους',                  'Θεσσαλονίκη',  'Υπαίθριο θέατρο μέσα στο πράσινο, ιδανικό για καλοκαιρινές παραστάσεις.'),
  (7, 'Δημοτικό Θέατρο «Απόλλων»',      'Πάτρα',        'Ιστορικό θέατρο της Πάτρας, σχεδιασμένο από τον Ernst Ziller.'),
  (8, 'Θέατρο «Νίκος Καζαντζάκης»',     'Ηράκλειο',     'Σύγχρονη πολιτιστική σκηνή στην καρδιά του Ηρακλείου.');

-- --- Αίθουσες (2 ανά θέατρο) ---------------------------------------------------
INSERT INTO halls (hall_id, theatre_id, name) VALUES
  (1, 1, 'Κεντρική Σκηνή'),   (2, 1, 'Μικρή Σκηνή'),
  (3, 2, 'Κεντρική Σκηνή'),   (4, 2, 'Νέα Σκηνή'),
  (5, 3, 'Κεντρική Σκηνή'),   (6, 3, 'Υπόγειο'),
  (7, 4, 'Κεντρική Σκηνή'),   (8, 4, 'Σκηνή Ω'),
  (9, 5, 'Σκηνή Καραντινός'), (10, 5, 'Βασιλικό Θέατρο'),
  (11, 6, 'Κεντρική Σκηνή'),  (12, 6, 'Μικρή Σκηνή'),
  (13, 7, 'Κεντρική Σκηνή'),  (14, 7, 'Φουαγιέ'),
  (15, 8, 'Κεντρική Σκηνή'),  (16, 8, 'Μικρή Σκηνή');

-- --- Θέσεις -------------------------------------------------------------------
-- 6 σειρές (A–F) x 8 θέσεις ανά αίθουσα, με τη μηχανή SEQUENCE της MariaDB (seq_1_to_8).
-- Κατηγορία ανά σειρά: A=VIP, B/C=PREMIUM, D/E/F=STANDARD.
INSERT INTO seats (hall_id, row_label, seat_number, category)
SELECT h.hall_id, r.row_label, s.seq, r.category
FROM halls h
CROSS JOIN (
  SELECT 'A' AS row_label, 'VIP'      AS category UNION ALL
  SELECT 'B',              'PREMIUM'              UNION ALL
  SELECT 'C',              'PREMIUM'              UNION ALL
  SELECT 'D',              'STANDARD'             UNION ALL
  SELECT 'E',              'STANDARD'             UNION ALL
  SELECT 'F',              'STANDARD'
) r
CROSS JOIN seq_1_to_8 s;

-- --- Παραστάσεις --------------------------------------------------------------
INSERT INTO shows (show_id, theatre_id, title, description, duration_min, age_rating) VALUES
  (1,  1, 'Evita',                          'Το θρυλικό μιούζικαλ των Andrew Lloyd Webber & Tim Rice για την Εύα Περόν.',        150, 'ALL'),
  (2,  1, 'Chicago',                        'Το βραβευμένο μιούζικαλ για το έγκλημα, τη δόξα και το βαριετέ της δεκαετίας του ’20.', 145, '15'),
  (3,  1, 'Mamma Mia!',                     'Η ξέφρενη μουσική κωμωδία με τα τραγούδια των ABBA.',                                150, 'ALL'),
  (4,  2, 'Αντιγόνη',                       'Η τραγωδία του Σοφοκλή για τη σύγκρουση νόμου και συνείδησης.',                       110, 'ALL'),
  (5,  2, 'Οιδίπους Τύραννος',              'Το αριστούργημα του Σοφοκλή για τη μοίρα και την αλήθεια.',                           120, '12'),
  (6,  2, 'Βυσσινόκηπος',                   'Η μελαγχολική κωμωδία του Άντον Τσέχωφ για το τέλος μιας εποχής.',                    140, '12'),
  (7,  3, 'Άμλετ',                          'Η κορυφαία τραγωδία του Σαίξπηρ για την εκδίκηση και την αμφιβολία.',                 165, '15'),
  (8,  3, 'Ο Γλάρος',                       'Το διαχρονικό έργο του Τσέχωφ για την τέχνη και τον ανεκπλήρωτο έρωτα.',              130, '12'),
  (9,  3, 'Το Σπίτι της Μπερνάρντα Άλμπα',  'Το σκοτεινό δράμα του Φεντερίκο Γκαρθία Λόρκα.',                                      120, '15'),
  (10, 4, 'Ρωμαίος και Ιουλιέτα',           'Το αθάνατο ερωτικό δράμα του Σαίξπηρ.',                                               135, '12'),
  (11, 4, 'Ο Φιλάργυρος',                   'Η κλασική κωμωδία του Μολιέρου για την τσιγκουνιά.',                                  105, 'ALL'),
  (12, 5, 'Μήδεια',                         'Η συγκλονιστική τραγωδία του Ευριπίδη για την προδοσία και την εκδίκηση.',            115, '15'),
  (13, 5, 'Βάκχες',                         'Η τραγωδία του Ευριπίδη για τη μανία και τη λατρεία του Διονύσου.',                   120, '15'),
  (14, 6, 'Λυσιστράτη',                     'Η ξεκαρδιστική αντιπολεμική κωμωδία του Αριστοφάνη.',                                 110, '12'),
  (15, 6, 'Όνειρο Καλοκαιρινής Νύχτας',     'Η ονειρική κωμωδία του Σαίξπηρ.',                                                     125, 'ALL'),
  (16, 7, 'Η Αυλή των Θαυμάτων',            'Το αγαπημένο έργο του Ιάκωβου Καμπανέλλη για τη μεταπολεμική Αθήνα.',                 130, 'ALL'),
  (17, 7, 'Ματωμένος Γάμος',                'Το πάθος και η μοίρα στο δράμα του Φεντερίκο Γκαρθία Λόρκα.',                         120, '15'),
  (18, 8, 'Ο Καπετάν Μιχάλης',              'Η επική διασκευή του μυθιστορήματος του Νίκου Καζαντζάκη.',                           150, '12'),
  (19, 8, 'Βαβυλωνία',                      'Η κλασική κωμωδία του Δ. Κ. Βυζάντιου για τη γλωσσική σύγχυση των Ελλήνων.',          110, 'ALL'),
  (20, 8, 'Φουέντε Οβεχούνα',               'Το επαναστατικό δράμα του Λόπε ντε Βέγα για τη λαϊκή εξέγερση.',                      130, '12');

-- --- Προβολές -----------------------------------------------------------------
-- Κάθε παράσταση παίζει σε αίθουσα του δικού της θεάτρου· κάθε starts_at είναι μοναδικό.
-- Οι ημερομηνίες είναι σχετικές με την ημέρα φόρτωσης (CURDATE), ώστε το demo να έχει πάντα μελλοντικές προβολές.
INSERT INTO showtimes (showtime_id, show_id, hall_id, starts_at, base_price) VALUES
  (1,  1,  1,  CURDATE() + INTERVAL  1 DAY + INTERVAL '21:00' HOUR_MINUTE, 34.00),
  (2,  1,  1,  CURDATE() + INTERVAL  8 DAY + INTERVAL '21:00' HOUR_MINUTE, 34.00),
  (3,  2,  1,  CURDATE() + INTERVAL  2 DAY + INTERVAL '21:00' HOUR_MINUTE, 32.00),
  (4,  2,  2,  CURDATE() + INTERVAL 15 DAY + INTERVAL '21:00' HOUR_MINUTE, 30.00),
  (5,  3,  1,  CURDATE() + INTERVAL  3 DAY + INTERVAL '21:00' HOUR_MINUTE, 36.00),
  (6,  3,  2,  CURDATE() + INTERVAL 16 DAY + INTERVAL '21:00' HOUR_MINUTE, 36.00),
  (7,  4,  3,  CURDATE() + INTERVAL  4 DAY + INTERVAL '20:00' HOUR_MINUTE, 22.00),
  (8,  4,  3,  CURDATE() + INTERVAL 11 DAY + INTERVAL '20:00' HOUR_MINUTE, 22.00),
  (9,  5,  3,  CURDATE() + INTERVAL  5 DAY + INTERVAL '20:00' HOUR_MINUTE, 22.00),
  (10, 5,  4,  CURDATE() + INTERVAL 18 DAY + INTERVAL '20:30' HOUR_MINUTE, 20.00),
  (11, 6,  4,  CURDATE() + INTERVAL  6 DAY + INTERVAL '20:30' HOUR_MINUTE, 20.00),
  (12, 6,  3,  CURDATE() + INTERVAL 22 DAY + INTERVAL '20:00' HOUR_MINUTE, 22.00),
  (13, 7,  5,  CURDATE() + INTERVAL  7 DAY + INTERVAL '20:30' HOUR_MINUTE, 24.00),
  (14, 7,  5,  CURDATE() + INTERVAL 14 DAY + INTERVAL '20:30' HOUR_MINUTE, 24.00),
  (15, 8,  6,  CURDATE() + INTERVAL  9 DAY + INTERVAL '21:00' HOUR_MINUTE, 18.00),
  (16, 8,  6,  CURDATE() + INTERVAL 23 DAY + INTERVAL '21:00' HOUR_MINUTE, 18.00),
  (17, 9,  5,  CURDATE() + INTERVAL 10 DAY + INTERVAL '20:30' HOUR_MINUTE, 22.00),
  (18, 9,  6,  CURDATE() + INTERVAL 24 DAY + INTERVAL '21:00' HOUR_MINUTE, 18.00),
  (19, 10, 7,  CURDATE() + INTERVAL 12 DAY + INTERVAL '20:00' HOUR_MINUTE, 20.00),
  (20, 10, 7,  CURDATE() + INTERVAL 19 DAY + INTERVAL '20:00' HOUR_MINUTE, 20.00),
  (21, 11, 8,  CURDATE() + INTERVAL 13 DAY + INTERVAL '21:00' HOUR_MINUTE, 18.00),
  (22, 11, 7,  CURDATE() + INTERVAL 26 DAY + INTERVAL '20:00' HOUR_MINUTE, 20.00),
  (23, 12, 9,  CURDATE() + INTERVAL 27 DAY + INTERVAL '21:00' HOUR_MINUTE, 26.00),
  (24, 12, 9,  CURDATE() + INTERVAL 34 DAY + INTERVAL '21:00' HOUR_MINUTE, 26.00),
  (25, 13, 10, CURDATE() + INTERVAL 28 DAY + INTERVAL '21:00' HOUR_MINUTE, 24.00),
  (26, 13, 9,  CURDATE() + INTERVAL 41 DAY + INTERVAL '21:00' HOUR_MINUTE, 26.00),
  (27, 14, 11, CURDATE() + INTERVAL 29 DAY + INTERVAL '21:00' HOUR_MINUTE, 20.00),
  (28, 14, 11, CURDATE() + INTERVAL 36 DAY + INTERVAL '21:00' HOUR_MINUTE, 20.00),
  (29, 15, 12, CURDATE() + INTERVAL 30 DAY + INTERVAL '21:00' HOUR_MINUTE, 18.00),
  (30, 15, 11, CURDATE() + INTERVAL 43 DAY + INTERVAL '21:00' HOUR_MINUTE, 20.00),
  (31, 16, 13, CURDATE() + INTERVAL 31 DAY + INTERVAL '20:30' HOUR_MINUTE, 18.00),
  (32, 16, 13, CURDATE() + INTERVAL 38 DAY + INTERVAL '20:30' HOUR_MINUTE, 18.00),
  (33, 17, 14, CURDATE() + INTERVAL 32 DAY + INTERVAL '21:00' HOUR_MINUTE, 16.00),
  (34, 17, 13, CURDATE() + INTERVAL 45 DAY + INTERVAL '20:30' HOUR_MINUTE, 18.00),
  (35, 18, 15, CURDATE() + INTERVAL 33 DAY + INTERVAL '20:30' HOUR_MINUTE, 22.00),
  (36, 18, 15, CURDATE() + INTERVAL 40 DAY + INTERVAL '20:30' HOUR_MINUTE, 22.00),
  (37, 19, 16, CURDATE() + INTERVAL 35 DAY + INTERVAL '21:00' HOUR_MINUTE, 16.00),
  (38, 19, 16, CURDATE() + INTERVAL 47 DAY + INTERVAL '21:00' HOUR_MINUTE, 16.00),
  (39, 20, 15, CURDATE() + INTERVAL 37 DAY + INTERVAL '20:30' HOUR_MINUTE, 20.00),
  (40, 20, 16, CURDATE() + INTERVAL 49 DAY + INTERVAL '21:00' HOUR_MINUTE, 16.00);

-- --- Τιμές προβολών (ανά κατηγορία) -------------------------------------------
-- Παράγονται set-based: STANDARD = base, PREMIUM = base + 8, VIP = base + 16.
INSERT INTO showtime_prices (showtime_id, category, price)
SELECT st.showtime_id, c.category, st.base_price + c.delta
FROM showtimes st
CROSS JOIN (
  SELECT 'STANDARD' AS category, 0  AS delta UNION ALL
  SELECT 'PREMIUM',               8          UNION ALL
  SELECT 'VIP',                   16
) c;
