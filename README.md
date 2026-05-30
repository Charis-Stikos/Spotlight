<div align="center">

# 🎭 Spotlight — Κράτηση Θέσεων σε Θεατρικές Παραστάσεις

**Μια full-stack εφαρμογή κινητού για αναζήτηση θεάτρων & παραστάσεων και κράτηση θέσεων σε πραγματικό χρόνο.**

Εργασία για το μάθημα **CN6035 — Mobile & Distributed Systems**

👤 Δημιουργός: **Χαράλαμπος Στίκος**

![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-11.4-003545?logo=mariadb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 📖 Περιγραφή

Το **Spotlight** είναι μια εφαρμογή κινητού που επιτρέπει στους χρήστες να **περιηγηθούν** σε θέατρα και παραστάσεις, να δουν διαθέσιμες ημερομηνίες/ώρες και να **κρατήσουν συγκεκριμένες θέσεις** μέσα από έναν διαδραστικό χάρτη αίθουσας.

Υλοποιεί ένα κλασικό **κατανεμημένο σύστημα τριών επιπέδων**: ένας **mobile client** (React Native) επικοινωνεί μέσω **REST API** (Node.js / Express) με μια **βάση δεδομένων** (MariaDB). Καλύπτει τις βασικές αρχές του μαθήματος: **ταυτοποίηση/εξουσιοδότηση (JWT)**, **συνέπεια δεδομένων** και **διαχείριση ταυτόχρονων κρατήσεων θέσεων**.

```
 ┌───────────────────────┐      HTTPS / JSON      ┌───────────────────────┐      SQL       ┌──────────────┐
 │   React Native (Expo)  │  ───────────────────▶ │   Express REST API     │  ───────────▶ │   MariaDB     │
 │   ο mobile client      │   Bearer JWT           │   routes → controllers │  (mysql2 pool) │   (Docker)    │
 │   expo-secure-store    │ ◀───────────────────  │   → services           │ ◀───────────  │   InnoDB      │
 └───────────────────────┘                        └───────────────────────┘                └──────────────┘
        ο πελάτης                                        ο εξυπηρετητής                        τα δεδομένα
```

---

## 📑 Πίνακας περιεχομένων

- [✨ Λειτουργίες](#-λειτουργίες)
- [🧱 Τεχνολογίες](#-τεχνολογίες)
- [📁 Δομή αποθετηρίου](#-δομή-αποθετηρίου)
- [✅ Προαπαιτούμενα](#-προαπαιτούμενα)
- [🚀 Εγκατάσταση & εκτέλεση](#-εγκατάσταση--εκτέλεση)
- [📱 Δοκιμή σε πραγματική συσκευή](#-δοκιμή-σε-πραγματική-συσκευή)
- [🗺️ Οθόνες & εμπειρία χρήστη](#️-οθόνες--εμπειρία-χρήστη)
- [🔌 API Reference](#-api-reference)
- [🗄️ Σχεδιασμός βάσης δεδομένων](#️-σχεδιασμός-βάσης-δεδομένων)
- [🔒 Έλεγχος ταυτόχρονων κρατήσεων](#-έλεγχος-ταυτόχρονων-κρατήσεων)
- [🔐 Ασφάλεια & ταυτοποίηση](#-ασφάλεια--ταυτοποίηση)
- [🛠️ Επίλυση προβλημάτων](#️-επίλυση-προβλημάτων)
- [🔮 Μελλοντικές επεκτάσεις](#-μελλοντικές-επεκτάσεις)

---

## ✨ Λειτουργίες

### 👤 Χρήστης & ταυτοποίηση
- **Εγγραφή / Σύνδεση** με email & κωδικό, με **JWT access tokens** + **rotating refresh tokens**.
- **Ασφαλής αποθήκευση** των tokens στο keychain της συσκευής (`expo-secure-store`) και **αυτόματη ανανέωση** όταν λήξει το access token.
- **Περιήγηση ως επισκέπτης (guest):** η εφαρμογή ανοίγει απευθείας στην Ανακάλυψη — η σύνδεση ζητείται **μόνο** τη στιγμή της κράτησης ή στις καρτέλες Εισιτήρια / Προφίλ.

### 🎬 Αναζήτηση & περιήγηση
- **Ανακάλυψη (Discover):** προβεβλημένο **carousel** που εναλλάσσεται αυτόματα, **φίλτρα ανά πόλη**, πλέγμα με αφίσες και «ράφια» **Πρόσφατα**, **Αγαπημένα** και **Για εσένα**.
- **Αναζήτηση** με βάση τον **τίτλο παράστασης**, το **όνομα θεάτρου** ή την **τοποθεσία**.
- **Αγαπημένα (♥):** αποθηκεύονται τοπικά στη συσκευή και λειτουργούν ακόμα και χωρίς λογαριασμό.

### 🎟️ Λεπτομέρειες & κράτηση
- **Σελίδα παράστασης** με parallax εικόνα, διάρκεια, καταλληλότητα, **τιμοκατάλογο ανά κατηγορία**, περίληψη και τις διαθέσιμες **ώρες προβολής ομαδοποιημένες ανά ημέρα**.
- **Διαδραστικός χάρτης θέσεων:** επιλογή ακριβών θέσεων με χρωματικό κώδικα ανά κατηγορία (Standard / Premium / VIP), ζωντανό σύνολο τιμής και κουμπί **«Καλύτερη διαθέσιμη»**.
- **Επιβεβαίωση κράτησης** με εορταστική animation (confetti).

### 📋 Διαχείριση κρατήσεων & προφίλ
- **Ιστορικό κρατήσεων** με διαχωρισμό **Επερχόμενες / Ιστορικό**.
- **Ακύρωση** ή **αλλαγή θέσεων** για μελλοντικές κρατήσεις.
- Εισιτήριο σε στυλ **boarding pass** (barcode, αποκόμματα, κωδικός κράτησης).
- **Στατιστικά προφίλ** (κρατήσεις, επερχόμενες, θέσεις) με animation.

---

## 🧱 Τεχνολογίες

| Επίπεδο | Τεχνολογίες |
|--------|-------------|
| **Frontend** | React Native (**Expo SDK 54**, JavaScript), React Navigation 7 (bottom tabs + native stacks), axios, expo-secure-store, expo-linear-gradient |
| **Backend** | Node.js + Express (ES modules), mysql2, jsonwebtoken, bcryptjs, zod, helmet, cors, express-rate-limit, morgan |
| **Database** | MariaDB 11.4 (InnoDB) μέσω Docker · Adminer GUI |
| **Εργαλεία** | Docker Compose, Postman, Git/GitHub, WebStorm |

> 🎨 Όλες οι animations (carousel, count-up, confetti, seat pop, skeleton loaders) υλοποιούνται με το ενσωματωμένο **`Animated` API** του React Native — **χωρίς επιπλέον native εξαρτήσεις**, ώστε να τρέχει απρόσκοπτα στο Expo Go.

---

## 📁 Δομή αποθετηρίου

```
Spotlight/
├─ frontend/                      Εφαρμογή React Native (Expo)
│  ├─ App.js                      Providers (Auth, Favorites, Recent, Badge) + Navigation
│  └─ src/
│     ├─ api/                     axios client + endpoints (auth, catalog, reservations)
│     ├─ auth/                    AuthContext (tokens, session, auto-refresh)
│     ├─ badge/ · favorites/      Contexts (αγαπημένα, πρόσφατα, tab badge)
│     ├─ components/              UI kit (Button, Card, Cover, HeartButton, Confetti, Skeleton…)
│     ├─ navigation/              RootNavigator (4 tabs + modal auth)
│     ├─ screens/                 Discover, Search, ShowDetails, SeatMap, Tickets, Profile…
│     ├─ storage/ · theme/ · utils/
│     └─ ...
├─ backend/                       REST API (Express)
│  ├─ src/  config/ · routes/ · controllers/ · services/ · middleware/ · validators/ · utils/
│  ├─ requests.http               (εκτελέσιμο στο WebStorm)
│  └─ postman/Spotlight.postman_collection.json
└─ database/                      schema.sql · seed.sql · docker-compose.yml
```

---

## ✅ Προαπαιτούμενα

- **Node.js** 18+ και npm
- **Docker Desktop** για τη MariaDB — *ή* τοπική εγκατάσταση **MariaDB** (οδηγίες «Χωρίς Docker» παρακάτω)
- Εφαρμογή **Expo Go** στο κινητό (iOS App Store / Google Play) — ή Android emulator
- Κινητό και υπολογιστής στο **ίδιο δίκτυο Wi-Fi**

---

## 🚀 Εγκατάσταση & εκτέλεση

### 1️⃣ Βάση δεδομένων (Docker) — αναλυτικός οδηγός για αρχάριους

**Τι είναι το Docker;** Ένα εργαλείο που τρέχει τη βάση δεδομένων μέσα σε ένα έτοιμο, απομονωμένο «κουτί» (container). Έτσι **δεν χρειάζεται να εγκαταστήσεις ή να ρυθμίσεις μόνος σου** τη MariaDB — το Docker φορτώνει αυτόματα και τους πίνακες και τα δεδομένα.

#### α) Κατέβασμα & εγκατάσταση του Docker Desktop
1. Πήγαινε στο **<https://www.docker.com/products/docker-desktop/>** και πάτα **«Download Docker Desktop» → για Windows** (ή για Mac, ανάλογα το σύστημά σου).
2. Τρέξε το αρχείο που κατέβηκε, **`Docker Desktop Installer.exe`**. Στην εγκατάσταση **άφησε τσεκαρισμένη** την επιλογή **«Use WSL 2 instead of Hyper-V»** και πάτα **OK / Install**.
3. Όταν τελειώσει, κάνε **επανεκκίνηση** του υπολογιστή αν σου το ζητήσει.
   > 💡 Αν εμφανιστεί μήνυμα ότι λείπει το **WSL 2**: άνοιξε το **PowerShell ως διαχειριστής** (δεξί κλικ → «Εκτέλεση ως διαχειριστής»), τρέξε `wsl --install`, και κάνε επανεκκίνηση.

#### β) Ξεκίνα το Docker Desktop (πρέπει να «τρέχει»)
1. Άνοιξε την εφαρμογή **Docker Desktop** από το Start Menu.
2. Περίμενε λίγο: κάτω αριστερά να γράψει **«Engine running»** και το εικονίδιο της φάλαινας 🐳 στη γραμμή εργασιών να σταματήσει να κινείται.
   > ⚠️ Το Docker Desktop πρέπει να είναι **ανοιχτό και ενεργό κάθε φορά** που δίνεις εντολές `docker`. Αλλιώς θα δεις σφάλμα όπως *«Cannot connect to the Docker daemon»*.
3. Δοκίμασε ότι δουλεύει — άνοιξε **PowerShell** και τρέξε:
   ```powershell
   docker --version
   docker ps
   ```
   Αν δεν βγάλει σφάλμα, είσαι έτοιμος. *(Αν λέει «το docker δεν αναγνωρίζεται…», κλείσε και ξανάνοιξε το PowerShell — ή κάνε επανεκκίνηση μετά την εγκατάσταση.)*

#### γ) Ξεκίνα τη βάση δεδομένων
```powershell
cd Spotlight\database
docker compose up -d
```
- **Την πρώτη φορά** το Docker κατεβάζει τις εικόνες (MariaDB + Adminer) — χρειάζεται **σύνδεση στο internet** και μπορεί να πάρει 1–3 λεπτά. Οι επόμενες φορές ξεκινούν άμεσα.
- Το `-d` τρέχει τη βάση στο **παρασκήνιο**. Τα `schema.sql` + `seed.sql` φορτώνονται **αυτόματα** την πρώτη φορά.

#### δ) Επιβεβαίωσε ότι όλα δουλεύουν
```powershell
docker ps
```
Πρέπει να δεις δύο containers σε λειτουργία: **`spotlight-mariadb`** και **`spotlight-adminer`**.
- Βάση → `localhost:3306` (db `spotlight`, user `spotlight`, pass `spotlightpass`)
- Γραφικό περιβάλλον **Adminer** → άνοιξε <http://localhost:8080> και βάλε: System **MySQL**, Server **db**, Username **spotlight**, Password **spotlightpass**. Θα δεις τους πίνακες με τα δεδομένα.

#### ε) Χρήσιμες εντολές (από τον φάκελο `database/`)
```powershell
docker compose stop        # σταματά τη βάση (κρατά τα δεδομένα)
docker compose up -d       # την ξαναξεκινά
docker compose down        # σταματά & αφαιρεί τα containers (κρατά τα δεδομένα)
docker compose down -v     # σβήνει ΚΑΙ τα δεδομένα — το επόμενο «up» ξαναφορτώνει schema + seed
```

---

### 🐬 Εναλλακτικά: χωρίς Docker (τοπική MariaDB)

Αν **δεν έχεις Docker**, στήνεις τη βάση με τοπική εγκατάσταση MariaDB. Κάνε **μόνο αυτό το βήμα** αντί για το 1️⃣ και μετά συνέχισε κανονικά με τα βήματα 2️⃣ και 3️⃣.

> ⚠️ Χρειάζεται **MariaDB**, *όχι* MySQL — το `seed.sql` χρησιμοποιεί τη μηχανή **SEQUENCE** (`seq_1_to_8`) που υπάρχει μόνο στη MariaDB.

**1. Εγκατάσταση MariaDB**
- **Windows:** κατέβασε τον installer από το <https://mariadb.org/download/>. Κατά την εγκατάσταση:
  - όρισε **κωδικό για τον χρήστη `root`** (σημείωσέ τον),
  - άφησε ενεργό το **«Install as service»** (τρέχει αυτόματα στη θύρα **3306**),
  - (προαιρετικά) εγκατέστησε και το **HeidiSQL** για γραφικό περιβάλλον.
- **macOS:** `brew install mariadb && brew services start mariadb`
- **Linux (Debian/Ubuntu):** `sudo apt install mariadb-server && sudo systemctl start mariadb`

**2. Δημιούργησε τον χρήστη της εφαρμογής** — σύνδεσου ως `root` και τρέξε τις εντολές SQL:
```sql
-- Windows: από το Start Menu άνοιξε «MariaDB Command Prompt» και τρέξε:  mysql -u root -p
CREATE USER IF NOT EXISTS 'spotlight'@'localhost' IDENTIFIED BY 'spotlightpass';
GRANT ALL PRIVILEGES ON spotlight.* TO 'spotlight'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
> Εναλλακτικά, παράλειψε το βήμα αυτό και χρησιμοποίησε τον χρήστη `root` — απλώς βάλε τα στοιχεία του `root` στο `.env` (βήμα 4).

**3. Φόρτωσε το σχήμα και τα δεδομένα** (από τον φάκελο `database/`)

- **Windows (PowerShell):** το PowerShell **δεν** υποστηρίζει το `<`. Σύνδεσου στον client και χρησιμοποίησε την εντολή `SOURCE` με **forward slashes**:
  ```powershell
  mysql -u root -p --default-character-set=utf8mb4
  ```
  και μέσα στο prompt της MariaDB:
  ```sql
  SOURCE C:/Spotlight/database/schema.sql;
  SOURCE C:/Spotlight/database/seed.sql;
  EXIT;
  ```
- **macOS / Linux (ή cmd.exe στα Windows):**
  ```bash
  mysql -u root -p < database/schema.sql
  mysql -u root -p spotlight < database/seed.sql
  ```
> Το `schema.sql` περιέχει `CREATE DATABASE` + `USE`, οπότε δημιουργεί μόνο του τη βάση `spotlight` και τους πίνακες. Το `--default-character-set=utf8mb4` εξασφαλίζει σωστή φόρτωση των ελληνικών.

**4. Ρύθμισε το backend** — στο `backend/.env` βεβαιώσου ότι τα στοιχεία ταιριάζουν:
```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=spotlight          # ή root
DB_PASSWORD=spotlightpass  # ή ο κωδικός του root σου
DB_NAME=spotlight
```

**Επαναφορά/ανανέωση δεδομένων (χωρίς Docker):** ξανατρέξε τα δύο scripts — το `schema.sql` κάνει `DROP TABLE` και τα ξαναδημιουργεί, καθαρίζοντας τα πάντα.

**GUI χωρίς Adminer:** χρησιμοποίησε **HeidiSQL** (έρχεται με τη MariaDB στα Windows), **DBeaver** ή **MySQL Workbench** — Host `127.0.0.1`, port `3306`.

---

### 2️⃣ Backend (Express API)
```bash
cd backend
copy .env.example .env         # Windows  ·  (macOS/Linux: cp .env.example .env)
npm install
npm start                      # → http://localhost:4000
```
Έλεγχος ότι λειτουργεί: άνοιξε το http://localhost:4000/health → `{"status":"ok",...}`

### 3️⃣ Frontend (React Native)
```bash
cd frontend
npm install
npx expo start                 # ανοίγει το Metro + ένα QR code
```
Σκάναρε το QR με το **Expo Go** (Android: από την εφαρμογή · iOS: από την Κάμερα). Η εφαρμογή εντοπίζει **αυτόματα** τη διεύθυνση LAN του υπολογιστή από το Metro, ώστε να βρει το backend στη θύρα 4000.

> 📱 **Android emulator;** Λειτουργεί επίσης — πάτησε `a` στο terminal του Expo.

---

## 📱 Δοκιμή σε πραγματική συσκευή

- Κινητό + υπολογιστής **στο ίδιο Wi-Fi**.
- Την πρώτη φορά, το **Τείχος Προστασίας των Windows** ίσως ζητήσει άδεια για το Node.js — πάτησε **Allow** (Private networks), αλλιώς το κινητό δεν φτάνει στη θύρα 4000.
- Η διεύθυνση του API προκύπτει αυτόματα από τον host του Expo (`<IP-υπολογιστή>:4000/api`) — δες το `frontend/src/api/client.js`.

---

## 🗺️ Οθόνες & εμπειρία χρήστη

| Καρτέλα | Περιεχόμενο |
|---------|-------------|
| 🎬 **Ανακάλυψη** | Carousel, φίλτρα πόλεων, πλέγμα παραστάσεων, ράφια Πρόσφατα/Αγαπημένα/Για εσένα |
| 🔍 **Αναζήτηση** | Ζωντανή αναζήτηση παραστάσεων & θεάτρων με εναλλαγή πεδίου |
| 🎟️ **Εισιτήρια** | Κρατήσεις (Επερχόμενες/Ιστορικό) · σήμα με αριθμό επερχόμενων |
| 👤 **Προφίλ** | Avatar, στατιστικά, αγαπημένα & πρόσφατα, λογαριασμός, αποσύνδεση |

**Ροή κράτησης:** Ανακάλυψη → Παράσταση → επιλογή ώρας → Χάρτης θέσεων → επιλογή θέσεων → **Επιβεβαίωση** → εμφάνιση στα Εισιτήρια.

---

## 🔌 API Reference

Βασικό μονοπάτι: `/api`

| Method | Endpoint | Auth | Περιγραφή |
|--------|----------|:----:|-----------|
| POST | `/auth/register` | – | Δημιουργία λογαριασμού, επιστρέφει tokens |
| POST | `/auth/login` | – | Σύνδεση, επιστρέφει tokens |
| POST | `/auth/refresh` | – | Ανανέωση (rotation) tokens |
| POST | `/auth/logout` | – | Ανάκληση refresh token |
| GET | `/auth/me` | ✓ | Στοιχεία τρέχοντος χρήστη |
| GET | `/theatres` | – | Λίστα/αναζήτηση θεάτρων (`?q=`) |
| GET | `/theatres/:id` | – | Θέατρο + οι παραστάσεις του |
| GET | `/shows` | – | Λίστα παραστάσεων (`?theatreId=&title=&date=`) |
| GET | `/shows/:id` | – | Λεπτομέρειες παράστασης |
| GET | `/showtimes` | – | Ώρες προβολής (`?showId=&date=`) |
| GET | `/showtimes/:id` | – | Προβολή + τιμές ανά κατηγορία |
| GET | `/showtimes/:id/seats` | – | Χάρτης θέσεων με διαθεσιμότητα |
| POST | `/reservations` | ✓ | Κράτηση θέσεων (concurrency-safe) |
| GET | `/reservations/:id` | ✓ | Λεπτομέρειες κράτησης |
| PATCH | `/reservations/:id` | ✓ | Αλλαγή θέσεων |
| DELETE | `/reservations/:id` | ✓ | Ακύρωση (απελευθερώνει θέσεις) |
| GET | `/user/reservations` | ✓ | Οι κρατήσεις μου |

> 📮 Έτοιμη **συλλογή Postman** (`backend/postman/`) και αρχείο **`backend/requests.http`** καλύπτουν όλα τα endpoints.

---

## 🗄️ Σχεδιασμός βάσης δεδομένων

Πίνακες (InnoDB, `utf8mb4` για πλήρη υποστήριξη ελληνικών):

`users`, `refresh_tokens`, `theatres`, `halls`, `seats`, `shows`, `showtimes`, `showtime_prices`, `reservations`, `reservation_seats`.

```
theatres 1─┬─* halls 1─* seats
           └─* shows 1─* showtimes 1─┬─* showtime_prices
                                     └─* reservations 1─* reservation_seats *─1 seats
users 1─* reservations          users 1─* refresh_tokens
```

- **Primary / Foreign keys** σε όλες τις σχέσεις, με `ON DELETE CASCADE`.
- **`UNIQUE(showtime_id, seat_id)`** στον πίνακα `reservation_seats` → η εγγύηση ότι μια θέση **δεν πωλείται δύο φορές** για την ίδια προβολή.
- **`UNIQUE(hall_id, starts_at)`** → μια αίθουσα δεν φιλοξενεί δύο προβολές την ίδια στιγμή.

> 🌱 Το `seed.sql` φορτώνει ρεαλιστικό ελληνικό ρεπερτόριο: **8 θέατρα, 16 αίθουσες, 20 παραγωγές, 40 προβολές** — με τιμές ανά κατηγορία και μελλοντικές ημερομηνίες.

---

## 🔒 Έλεγχος ταυτόχρονων κρατήσεων

> Η βασική έννοια του μαθήματος *Mobile & Distributed Systems*. Δύο χρήστες δεν πρέπει ποτέ να κρατήσουν την **ίδια θέση** για την ίδια προβολή.

Η εγγύηση επιβάλλεται σε **επίπεδο βάσης δεδομένων**:

1. Ο πίνακας `reservation_seats` έχει περιορισμό **`UNIQUE(showtime_id, seat_id)`**.
2. Η κράτηση εκτελείται μέσα σε **transaction**: κλειδώνει τις ζητούμενες θέσεις (`SELECT … FOR UPDATE`), ελέγχει διαθεσιμότητα και μετά κάνει `INSERT`.
3. Αν δύο αιτήματα «τρέξουν» ταυτόχρονα, ο **unique περιορισμός** απορρίπτει το δεύτερο `INSERT` → το API επιστρέφει **`409 Conflict`** και κάνει rollback.

Η **ακύρωση** μιας κράτησης διαγράφει τις γραμμές `reservation_seats`, ελευθερώνοντας ξανά τις θέσεις.

---

## 🔐 Ασφάλεια & ταυτοποίηση

- **bcrypt** για hashing κωδικών — ο καθαρός κωδικός δεν αποθηκεύεται ποτέ.
- **JWT access tokens** (μικρής διάρκειας) + **rotating refresh tokens**: στη βάση αποθηκεύεται μόνο το **HMAC-SHA256 hash** του refresh token, ώστε διαρροή της βάσης να μην εκθέτει χρησιμοποιήσιμα tokens. Τα tokens μπορούν να **ανακληθούν**.
- Τα tokens φυλάσσονται στο **keychain/keystore** της συσκευής (`expo-secure-store`) και **ανανεώνονται αυτόματα** σε απόκριση `401`.
- **helmet**, **CORS** και **rate-limiting** στα endpoints ταυτοποίησης.
- **Επικύρωση εισόδου** με **Zod** σε κάθε αίτημα (body / query / params) και **κεντρική διαχείριση σφαλμάτων**.

---

## 🛠️ Επίλυση προβλημάτων

| Πρόβλημα | Λύση |
|----------|------|
| «Cannot reach the server» | Το backend δεν τρέχει ή το firewall μπλοκάρει τη θύρα 4000. Ξεκίνα το backend, επίτρεψε το Node, ίδιο Wi-Fi. |
| `docker` not found | Ξεκίνα το Docker Desktop και άνοιξε ξανά το terminal. |
| Η θύρα 3306 είναι κατειλημμένη | Τρέχει ήδη άλλη MySQL/MariaDB — σταμάτησέ την ή άλλαξε τη θύρα στο `docker-compose.yml`. |
| Επαναφορά βάσης | `docker compose down -v && docker compose up -d` (ξανατρέχει schema + seed). |

---

## 🔮 Μελλοντικές επεκτάσεις

- Σύστημα **βαθμολογιών & κριτικών** (ratings & reviews).
- **Πληρωμές** και email επιβεβαίωσης.
- Προσωρινό **«κράτημα» θέσεων** με χρονικό όριο (seat hold).
- **Push notifications** και πίνακας **διαχείρισης (admin)**.

---

<div align="center">

🎭 **Spotlight** — CN6035 Mobile & Distributed Systems

Δημιουργήθηκε από τον **Χαράλαμπο Στίκο**

</div>
