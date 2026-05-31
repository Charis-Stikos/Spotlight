<div align="center">

# 🎭 Spotlight — Κράτηση Θέσεων σε Θεατρικές Παραστάσεις

**Μια full-stack εφαρμογή κινητού για να ψάχνεις θέατρα και παραστάσεις και να κλείνεις θέσεις σε πραγματικό χρόνο.**

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

Το **Spotlight** είναι μια εφαρμογή κινητού όπου ο χρήστης μπορεί να **περιηγηθεί** σε θέατρα και παραστάσεις, να δει τις διαθέσιμες ημερομηνίες και ώρες και να **κρατήσει τις θέσεις που θέλει** μέσα από έναν διαδραστικό χάρτη αίθουσας.

Από κάτω κρύβεται ένα κλασικό **κατανεμημένο σύστημα τριών επιπέδων**. Ένας **mobile client** σε React Native μιλάει μέσω ενός **REST API** σε Node.js και Express με μια **βάση δεδομένων** MariaDB. Έτσι καλύπτονται οι βασικές έννοιες του μαθήματος — **ταυτοποίηση και εξουσιοδότηση με JWT**, **συνέπεια δεδομένων** και **διαχείριση ταυτόχρονων κρατήσεων**.

```mermaid
flowchart LR
    subgraph CLIENT["Mobile Client · React Native + Expo"]
        direction TB
        SCR["Οθόνες · Πλοήγηση<br/>Discover · Search · ShowDetails<br/>SeatMap · Tickets · Profile"]
        CTX["Contexts<br/>Auth · Favorites · Recent · Badge"]
        APIC["API client · axios<br/>interceptors: Bearer JWT + auto-refresh"]
        SEC["expo-secure-store<br/>keychain / keystore"]
        SCR --> CTX
        CTX --> APIC
        CTX -. token storage .-> SEC
    end

    subgraph SERVER["REST API · Node.js / Express"]
        direction TB
        MW["Middleware<br/>helmet · CORS · rate-limit<br/>JWT auth · Zod validate · error handler"]
        RTE["Routes /api"]
        CTL["Controllers"]
        SVC["Services<br/>business logic + transactions"]
        MW --> RTE
        RTE --> CTL
        CTL --> SVC
    end

    subgraph DATA["Database · MariaDB 11.4 σε Docker"]
        direction TB
        POOL["mysql2 connection pool"]
        TBL["InnoDB tables<br/>10 σχετιζόμενοι πίνακες"]
        POOL --> TBL
    end

    APIC -->|"HTTPS / JSON · Bearer JWT"| MW
    SVC -->|"SQL · FOR UPDATE · transactions"| POOL
```

<div align="center"><sub><b>ο πελάτης</b> ──▶ <b>ο εξυπηρετητής</b> ──▶ <b>τα δεδομένα</b> — κατανεμημένο σύστημα τριών επιπέδων</sub></div>

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
- **Εγγραφή και σύνδεση** με email και κωδικό, με **JWT access tokens** και **rotating refresh tokens**.
- Τα tokens αποθηκεύονται **με ασφάλεια** στο keychain της συσκευής μέσω `expo-secure-store` και **ανανεώνονται αυτόματα** μόλις λήξει το access token.
- **Περιήγηση ως επισκέπτης**: η εφαρμογή ανοίγει κατευθείαν στην Ανακάλυψη και η σύνδεση ζητείται μόνο τη στιγμή της κράτησης ή στις καρτέλες Εισιτήρια και Προφίλ.

### 🎬 Αναζήτηση & περιήγηση
- **Ανακάλυψη**: ένα προβεβλημένο carousel που αλλάζει μόνο του, φίλτρα ανά πόλη, πλέγμα με αφίσες και ράφια **Πρόσφατα**, **Αγαπημένα** και **Για εσένα**.
- **Αναζήτηση** με βάση τον τίτλο της παράστασης, το όνομα του θεάτρου ή την τοποθεσία.
- **Αγαπημένα ♥**: αποθηκεύονται τοπικά στη συσκευή και δουλεύουν ακόμη και χωρίς λογαριασμό.

### 🎟️ Λεπτομέρειες & κράτηση
- **Σελίδα παράστασης** με parallax εικόνα, διάρκεια, καταλληλότητα, τιμοκατάλογο ανά κατηγορία, περίληψη και τις ώρες προβολής ομαδοποιημένες ανά ημέρα.
- **Διαδραστικός χάρτης θέσεων**: διαλέγεις ακριβώς τις θέσεις σου με χρωματικό κώδικα ανά κατηγορία — Standard, Premium, VIP — βλέπεις ζωντανά το σύνολο και έχεις και κουμπί **«Καλύτερη διαθέσιμη»**.
- **Επιβεβαίωση κράτησης** με ένα εορταστικό confetti.

### 📋 Διαχείριση κρατήσεων & προφίλ
- **Ιστορικό κρατήσεων** χωρισμένο σε **Επερχόμενες** και **Ιστορικό**.
- **Ακύρωση** ή **αλλαγή θέσεων** για τις μελλοντικές κρατήσεις.
- Εισιτήριο σε στυλ **boarding pass**, με barcode, αποκόμματα και κωδικό κράτησης.
- **Στατιστικά προφίλ** — κρατήσεις, επερχόμενες, θέσεις — με ένα μικρό animation.

---

## 🧱 Τεχνολογίες

| Επίπεδο | Τεχνολογίες |
|--------|-------------|
| **Frontend** | React Native με Expo SDK 54 σε JavaScript, React Navigation 7 με bottom tabs και native stacks, axios, expo-secure-store, expo-linear-gradient |
| **Backend** | Node.js με Express σε ES modules, mysql2, jsonwebtoken, bcryptjs, zod, helmet, cors, express-rate-limit, morgan |
| **Database** | MariaDB 11.4 με InnoDB πάνω σε Docker, μαζί με το γραφικό περιβάλλον Adminer |
| **Εργαλεία** | Docker Compose, Postman, Git και GitHub, WebStorm |

> 🎨 Όλα τα animations — carousel, count-up, confetti, seat pop, skeleton loaders — είναι φτιαγμένα με το ενσωματωμένο **`Animated` API** του React Native, χωρίς καμία επιπλέον native εξάρτηση, ώστε να τρέχουν απρόσκοπτα μέσα στο Expo Go.

---

## 📁 Δομή αποθετηρίου

```
Spotlight/
├─ frontend/                      Εφαρμογή React Native με Expo
│  ├─ App.js                      Providers Auth, Favorites, Recent, Badge και η πλοήγηση
│  └─ src/
│     ├─ api/                     axios client και endpoints για auth, catalog, reservations
│     ├─ auth/                    AuthContext — tokens, session, auto-refresh
│     ├─ badge/ · favorites/      Contexts για αγαπημένα, πρόσφατα, tab badge
│     ├─ components/              UI kit — Button, Card, Cover, HeartButton, Confetti, Skeleton…
│     ├─ navigation/              RootNavigator με 4 καρτέλες και modal για το auth
│     ├─ screens/                 Discover, Search, ShowDetails, SeatMap, Tickets, Profile…
│     ├─ storage/ · theme/ · utils/
│     └─ ...
├─ backend/                       REST API με Express
│  ├─ src/  config/ · routes/ · controllers/ · services/ · middleware/ · validators/ · utils/
│  ├─ requests.http               εκτελείται κατευθείαν μέσα από το WebStorm
│  └─ postman/Spotlight.postman_collection.json
└─ database/                      schema.sql · seed.sql · docker-compose.yml
```

---

## ✅ Προαπαιτούμενα

- **Node.js** 18+ και npm
- **Docker Desktop** για τη MariaDB — ή μια τοπική εγκατάσταση **MariaDB**, με οδηγίες στην ενότητα «Χωρίς Docker» παρακάτω
- Την εφαρμογή **Expo Go** στο κινητό, από το App Store ή το Google Play — εναλλακτικά έναν Android emulator
- Κινητό και υπολογιστή στο **ίδιο δίκτυο Wi-Fi**

---

## 🚀 Εγκατάσταση & εκτέλεση

### 🔐 Μεταβλητές περιβάλλοντος `.env` — διάβασέ το πρώτα

Το project κρατάει τις ρυθμίσεις του — τους κωδικούς της βάσης και τα μυστικά του JWT — σε αρχεία **`.env`**. Για λόγους ασφάλειας αυτά τα αρχεία **δεν** ανεβαίνουν στο Git, γι' αυτό και θα βρεις έτοιμα παραδείγματα **`.env.example`** που απλώς τα **αντιγράφεις** σε `.env`.

| Αρχείο | Φάκελος | Χρειάζεται; | Τι ρυθμίζει |
|--------|---------|:-----------:|-------------|
| `backend/.env` | `backend/` | **Ναι, υποχρεωτικό** | Θύρα, στοιχεία σύνδεσης στη βάση και μυστικά JWT. Χωρίς αυτό το backend δεν ξεκινάει καν. |
| `database/.env` | `database/` | Όχι, προαιρετικό | Αλλάζει τους κωδικούς της MariaDB στο Docker. Αν λείπει, ισχύουν οι προεπιλογές από το `docker-compose.yml`. |

> ✅ **Τα καλά νέα:** τα `.env.example` έρχονται με έτοιμες, λειτουργικές προεπιλογές που ταιριάζουν με το Docker. Για τοπική δοκιμή αρκεί να αντιγράψεις το `backend/.env.example` σε `backend/.env`, κάτι που γίνεται στο βήμα 2️⃣, και δεν χρειάζεται να αλλάξεις ούτε μία τιμή.

> ⚠️ **Ο μόνος κανόνας που πρέπει να θυμάσαι:** τα στοιχεία της βάσης `DB_USER`, `DB_PASSWORD` και `DB_NAME` πρέπει να είναι ίδια στο `backend/.env` και στη βάση σου, είτε στο `database/.env` του Docker είτε στην τοπική σου MariaDB. Με τις προεπιλογές είναι ήδη ίδια: `spotlight`, `spotlightpass`, `spotlight`.

> 📱 Το **frontend δεν θέλει `.env`**. Βρίσκει μόνο του τη διεύθυνση του backend από τον host του Expo — δες το `frontend/src/api/client.js`.

**Με δυο λόγια, ανάλογα με το πώς θα τρέξεις το project:**
- **Με Docker, που είναι και το προτεινόμενο:** δεν αγγίζεις κανένα `.env` της βάσης. Κάνεις μόνο `copy backend\.env.example backend\.env` και είσαι έτοιμος, αφού οι προεπιλογές ταιριάζουν με το Docker.
- **Χωρίς Docker, με τοπική MariaDB:** αντιγράφεις το `backend/.env` το ίδιο, αλλά προσαρμόζεις τα `DB_USER` και `DB_PASSWORD` ώστε να ταιριάζουν με τον χρήστη που έφτιαξες στη MariaDB. Τα λέω αναλυτικά στην ενότητα «Χωρίς Docker», στο βήμα 4.

---

### 1️⃣ Βάση δεδομένων με Docker — αναλυτικός οδηγός για αρχάριους

**Τι είναι το Docker;** Ένα εργαλείο που τρέχει τη βάση δεδομένων μέσα σε ένα έτοιμο, απομονωμένο «κουτί», το λεγόμενο container. Έτσι **δεν χρειάζεται να εγκαταστήσεις ή να ρυθμίσεις μόνος σου** τη MariaDB — το Docker φορτώνει αυτόματα και τους πίνακες και τα δεδομένα.

#### α. Κατέβασμα και εγκατάσταση του Docker Desktop
1. Πήγαινε στο **<https://www.docker.com/products/docker-desktop/>** και πάτα **«Download Docker Desktop»** για Windows, ή για Mac ανάλογα με το σύστημά σου.
2. Τρέξε το αρχείο που κατέβηκε, το **`Docker Desktop Installer.exe`**. Στην εγκατάσταση **άφησε τσεκαρισμένη** την επιλογή **«Use WSL 2 instead of Hyper-V»** και πάτα **OK / Install**.
3. Όταν τελειώσει, κάνε **επανεκκίνηση** του υπολογιστή αν σου το ζητήσει.
   > 💡 Αν εμφανιστεί μήνυμα ότι λείπει το **WSL 2**, άνοιξε το **PowerShell ως διαχειριστής** με δεξί κλικ και «Εκτέλεση ως διαχειριστής», τρέξε `wsl --install` και κάνε επανεκκίνηση.

#### β. Ξεκίνα το Docker Desktop — πρέπει να «τρέχει»
1. Άνοιξε την εφαρμογή **Docker Desktop** από το Start Menu.
2. Περίμενε λίγο μέχρι να γράψει κάτω αριστερά **«Engine running»** και το εικονίδιο της φάλαινας 🐳 στη γραμμή εργασιών να σταματήσει να κινείται.
   > ⚠️ Το Docker Desktop πρέπει να είναι **ανοιχτό και ενεργό κάθε φορά** που δίνεις εντολές `docker`. Αλλιώς θα δεις ένα σφάλμα του στιλ *«Cannot connect to the Docker daemon»*.
3. Για να σιγουρευτείς ότι δουλεύει, άνοιξε **PowerShell** και τρέξε:
   ```powershell
   docker --version
   docker ps
   ```
   Αν δεν βγάλει σφάλμα, είσαι έτοιμος. Αν σου πει «το docker δεν αναγνωρίζεται…», κλείσε και ξανάνοιξε το PowerShell, ή κάνε μια επανεκκίνηση μετά την εγκατάσταση.

#### γ. Ξεκίνα τη βάση δεδομένων
```powershell
cd Spotlight\database
docker compose up -d
```
- **Την πρώτη φορά** το Docker κατεβάζει τις εικόνες της MariaDB και του Adminer. Θέλει **σύνδεση στο internet** και μπορεί να πάρει 1–3 λεπτά. Τις επόμενες φορές ξεκινάει στο πι και φι.
- Το `-d` τρέχει τη βάση στο **παρασκήνιο**. Τα `schema.sql` και `seed.sql` φορτώνονται **αυτόματα** την πρώτη φορά.
- **Δεν χρειάζεται** να φτιάξεις `database/.env` — το `docker-compose.yml` έχει ήδη έτοιμες προεπιλογές. Βάλε ένα μόνο αν θες να αλλάξεις τους κωδικούς, και τότε άλλαξέ τους **και** στο `backend/.env`.

#### δ. Επιβεβαίωσε ότι όλα δουλεύουν
```powershell
docker ps
```
Πρέπει να δεις δύο containers να τρέχουν, το **`spotlight-mariadb`** και το **`spotlight-adminer`**.
- Βάση → `localhost:3306`, με βάση `spotlight`, χρήστη `spotlight` και κωδικό `spotlightpass`.
- Γραφικό περιβάλλον **Adminer** → άνοιξε το <http://localhost:8080> και βάλε System **MySQL**, Server **db**, Username **spotlight**, Password **spotlightpass**. Θα δεις τους πίνακες με τα δεδομένα.

#### ε. Χρήσιμες εντολές — από τον φάκελο `database/`
```powershell
docker compose stop        # σταματά τη βάση και κρατά τα δεδομένα
docker compose up -d       # την ξαναξεκινά
docker compose down        # σταματά και αφαιρεί τα containers, αλλά κρατά τα δεδομένα
docker compose down -v     # σβήνει ΚΑΙ τα δεδομένα — το επόμενο «up» ξαναφορτώνει schema και seed
```

---

### 🐬 Εναλλακτικά: χωρίς Docker, με τοπική MariaDB

Αν **δεν έχεις Docker**, στήνεις τη βάση με μια τοπική εγκατάσταση MariaDB. Κάνε **μόνο αυτό το βήμα** αντί για το 1️⃣ και μετά συνέχισε κανονικά με τα βήματα 2️⃣ και 3️⃣.

> ⚠️ Θέλει **MariaDB**, όχι MySQL — το `seed.sql` χρησιμοποιεί τη μηχανή **SEQUENCE** με το `seq_1_to_8`, που υπάρχει μόνο στη MariaDB.

**1. Εγκατάσταση της MariaDB**
- **Windows:** κατέβασε τον installer από το <https://mariadb.org/download/>. Κατά την εγκατάσταση:
  - όρισε **κωδικό για τον χρήστη `root`** και σημείωσέ τον,
  - άφησε ενεργό το **«Install as service»**, ώστε να τρέχει αυτόματα στη θύρα **3306**,
  - αν θέλεις, εγκατέστησε και το **HeidiSQL** για γραφικό περιβάλλον.
- **macOS:** `brew install mariadb && brew services start mariadb`
- **Linux σε Debian ή Ubuntu:** `sudo apt install mariadb-server && sudo systemctl start mariadb`

**2. Φτιάξε τον χρήστη της εφαρμογής** — σύνδεσου ως `root` και τρέξε τις εντολές SQL:
```sql
-- Στα Windows, άνοιξε από το Start Menu το «MariaDB Command Prompt» και τρέξε:  mysql -u root -p
CREATE USER IF NOT EXISTS 'spotlight'@'localhost' IDENTIFIED BY 'spotlightpass';
GRANT ALL PRIVILEGES ON spotlight.* TO 'spotlight'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
> Εναλλακτικά, παράλειψε αυτό το βήμα και χρησιμοποίησε απευθείας τον χρήστη `root` — απλώς βάλε τα στοιχεία του `root` στο `.env`, στο βήμα 4.

**3. Φόρτωσε το σχήμα και τα δεδομένα** — από τον φάκελο `database/`

- **Windows με PowerShell:** το PowerShell **δεν** υποστηρίζει το `<`. Σύνδεσου στον client και χρησιμοποίησε την εντολή `SOURCE` με **forward slashes**:
  ```powershell
  mysql -u root -p --default-character-set=utf8mb4
  ```
  και μέσα στο prompt της MariaDB:
  ```sql
  SOURCE C:/Spotlight/database/schema.sql;
  SOURCE C:/Spotlight/database/seed.sql;
  EXIT;
  ```
- **macOS, Linux ή cmd.exe στα Windows:**
  ```bash
  mysql -u root -p < database/schema.sql
  mysql -u root -p spotlight < database/seed.sql
  ```
> Το `schema.sql` περιέχει `CREATE DATABASE` και `USE`, οπότε δημιουργεί μόνο του τη βάση `spotlight` και τους πίνακες. Το `--default-character-set=utf8mb4` φροντίζει να φορτωθούν σωστά τα ελληνικά.

**4. Ρύθμισε το backend** — στο `backend/.env` βεβαιώσου ότι τα στοιχεία ταιριάζουν:
```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=spotlight          # ή root
DB_PASSWORD=spotlightpass  # ή ο κωδικός του root σου
DB_NAME=spotlight
```

**Για να επαναφέρεις ή να ανανεώσεις τα δεδομένα χωρίς Docker:** ξανατρέξε τα δύο scripts. Το `schema.sql` κάνει `DROP TABLE` και τα ξαναδημιουργεί, καθαρίζοντας τα πάντα.

**Για γραφικό περιβάλλον χωρίς το Adminer:** χρησιμοποίησε **HeidiSQL**, που έρχεται μαζί με τη MariaDB στα Windows, ή **DBeaver** ή **MySQL Workbench**, με Host `127.0.0.1` και port `3306`.

---

### 2️⃣ Backend — το Express API
```bash
cd backend
copy .env.example .env         # Windows  ·  σε macOS/Linux: cp .env.example .env
npm install
npm start                      # → http://localhost:4000
```
> 💡 Με το Docker, οι **προεπιλογές του `.env` δουλεύουν ως έχουν και δεν θέλουν καμία αλλαγή**. Χωρίς Docker, προσάρμοσε πρώτα τα `DB_*` όπως στην ενότητα «Χωρίς Docker», βήμα 4.

Για να δεις ότι λειτουργεί, άνοιξε το http://localhost:4000/health και θα πάρεις `{"status":"ok",...}`.

### 3️⃣ Frontend — το React Native
```bash
cd frontend
npm install
npx expo start                 # ανοίγει το Metro μαζί με ένα QR code
```
Σκάναρε το QR με το **Expo Go** — στο Android μέσα από την ίδια την εφαρμογή, στο iOS από την Κάμερα. Η εφαρμογή εντοπίζει **αυτόματα** τη διεύθυνση LAN του υπολογιστή από το Metro, ώστε να βρει το backend στη θύρα 4000.

> 📱 **Έχεις Android emulator;** Δουλεύει κι αυτό — πάτα `a` στο terminal του Expo.

---

## 📱 Δοκιμή σε πραγματική συσκευή

- Κινητό και υπολογιστής στο **ίδιο Wi-Fi**.
- Την πρώτη φορά, το **Τείχος Προστασίας των Windows** μπορεί να ζητήσει άδεια για το Node.js — πάτα **Allow** για τα Private networks, αλλιώς το κινητό δεν φτάνει στη θύρα 4000.
- Η διεύθυνση του API προκύπτει αυτόματα από τον host του Expo, στη μορφή `<IP-υπολογιστή>:4000/api` — δες το `frontend/src/api/client.js`.

---

## 🗺️ Οθόνες & εμπειρία χρήστη

| Καρτέλα | Περιεχόμενο |
|---------|-------------|
| 🎬 **Ανακάλυψη** | Carousel, φίλτρα πόλεων, πλέγμα παραστάσεων, ράφια Πρόσφατα, Αγαπημένα και Για εσένα |
| 🔍 **Αναζήτηση** | Ζωντανή αναζήτηση παραστάσεων και θεάτρων με εναλλαγή πεδίου |
| 🎟️ **Εισιτήρια** | Οι κρατήσεις σου σε Επερχόμενες και Ιστορικό, με σήμα που δείχνει πόσες είναι οι επερχόμενες |
| 👤 **Προφίλ** | Avatar, στατιστικά, αγαπημένα και πρόσφατα, λογαριασμός, αποσύνδεση |

**Η ροή της κράτησης:** Ανακάλυψη → Παράσταση → επιλογή ώρας → Χάρτης θέσεων → επιλογή θέσεων → **Επιβεβαίωση** → και η κράτηση εμφανίζεται στα Εισιτήρια.

---

## 🔌 API Reference

Βασικό μονοπάτι: `/api`

| Method | Endpoint | Auth | Περιγραφή |
|--------|----------|:----:|-----------|
| POST | `/auth/register` | – | Δημιουργία λογαριασμού, επιστρέφει tokens |
| POST | `/auth/login` | – | Σύνδεση, επιστρέφει tokens |
| POST | `/auth/refresh` | – | Ανανέωση tokens με rotation |
| POST | `/auth/logout` | – | Ανάκληση refresh token |
| GET | `/auth/me` | ✓ | Στοιχεία τρέχοντος χρήστη |
| GET | `/theatres` | – | Λίστα και αναζήτηση θεάτρων με `?q=` |
| GET | `/theatres/:id` | – | Θέατρο μαζί με τις παραστάσεις του |
| GET | `/shows` | – | Λίστα παραστάσεων με `?theatreId=&title=&date=` |
| GET | `/shows/:id` | – | Λεπτομέρειες παράστασης |
| GET | `/showtimes` | – | Ώρες προβολής με `?showId=&date=` |
| GET | `/showtimes/:id` | – | Προβολή μαζί με τις τιμές ανά κατηγορία |
| GET | `/showtimes/:id/seats` | – | Χάρτης θέσεων με τη διαθεσιμότητα |
| POST | `/reservations` | ✓ | Κράτηση θέσεων, ασφαλής σε ταυτόχρονα αιτήματα |
| GET | `/reservations/:id` | ✓ | Λεπτομέρειες κράτησης |
| PATCH | `/reservations/:id` | ✓ | Αλλαγή θέσεων |
| DELETE | `/reservations/:id` | ✓ | Ακύρωση που απελευθερώνει τις θέσεις |
| GET | `/user/reservations` | ✓ | Οι κρατήσεις μου |

> 📮 Όλα τα endpoints καλύπτονται από μια έτοιμη **συλλογή Postman** στο `backend/postman/` και από το αρχείο **`backend/requests.http`**.

---

## 🗄️ Σχεδιασμός βάσης δεδομένων

Οι πίνακες, όλοι σε InnoDB και με `utf8mb4` για πλήρη υποστήριξη των ελληνικών:

`users`, `refresh_tokens`, `theatres`, `halls`, `seats`, `shows`, `showtimes`, `showtime_prices`, `reservations`, `reservation_seats`.

```mermaid
erDiagram
    users           ||--o{ reservations      : "κάνει"
    users           ||--o{ refresh_tokens    : "έχει"
    theatres        ||--o{ halls             : "διαθέτει"
    theatres        ||--o{ shows             : "ανεβάζει"
    halls           ||--o{ seats             : "περιέχει"
    halls           ||--o{ showtimes         : "φιλοξενεί"
    shows           ||--o{ showtimes         : "προγραμματίζει"
    showtimes       ||--o{ showtime_prices   : "τιμολογεί"
    showtimes       ||--o{ reservations      : "δέχεται"
    showtimes       ||--o{ reservation_seats : "δεσμεύει"
    reservations    ||--o{ reservation_seats : "περιλαμβάνει"
    seats           ||--o{ reservation_seats : "αντιστοιχεί"

    users {
        bigint   user_id       PK
        varchar  name
        varchar  email         UK
        varchar  password_hash
    }
    refresh_tokens {
        bigint   token_id      PK
        bigint   user_id       FK
        char     token_hash    UK "sha256 hash"
        datetime expires_at
        datetime revoked_at
    }
    theatres {
        bigint   theatre_id    PK
        varchar  name
        varchar  location
    }
    halls {
        bigint   hall_id       PK
        bigint   theatre_id    FK
        varchar  name
    }
    seats {
        bigint   seat_id       PK
        bigint   hall_id       FK
        varchar  row_label
        int      seat_number
        enum     category      "STANDARD | PREMIUM | VIP"
    }
    shows {
        bigint   show_id       PK
        bigint   theatre_id    FK
        varchar  title
        int      duration_min
        varchar  age_rating
    }
    showtimes {
        bigint   showtime_id   PK
        bigint   show_id       FK
        bigint   hall_id       FK
        datetime starts_at     "UNIQUE(hall_id, starts_at)"
        decimal  base_price
    }
    showtime_prices {
        bigint   showtime_id   PK, FK
        enum     category      PK
        decimal  price
    }
    reservations {
        bigint   reservation_id PK
        bigint   user_id        FK
        bigint   showtime_id    FK
        enum     status         "CONFIRMED | CANCELLED"
        decimal  total_price
    }
    reservation_seats {
        bigint   reservation_seat_id PK
        bigint   reservation_id      FK
        bigint   showtime_id         FK
        bigint   seat_id             FK
        decimal  price               "UNIQUE(showtime_id, seat_id)"
    }
```

- **Primary και foreign keys** σε όλες τις σχέσεις, με `ON DELETE CASCADE`.
- Το **`UNIQUE(showtime_id, seat_id)`** στον πίνακα `reservation_seats` είναι η εγγύηση ότι μια θέση **δεν πουλιέται δύο φορές** για την ίδια προβολή.
- Το **`UNIQUE(hall_id, starts_at)`** εξασφαλίζει ότι μια αίθουσα δεν φιλοξενεί δύο προβολές την ίδια στιγμή.

> 🌱 Το `seed.sql` φορτώνει ένα ρεαλιστικό ελληνικό ρεπερτόριο — **8 θέατρα, 16 αίθουσες, 20 παραγωγές και 40 προβολές**, με τιμές ανά κατηγορία και μελλοντικές ημερομηνίες.

---

## 🔒 Έλεγχος ταυτόχρονων κρατήσεων

> Η καρδιά του μαθήματος *Mobile & Distributed Systems*. Δύο χρήστες δεν πρέπει ποτέ να κρατήσουν την **ίδια θέση** για την ίδια προβολή.

Η εγγύηση μπαίνει σε **επίπεδο βάσης δεδομένων**:

1. Ο πίνακας `reservation_seats` έχει τον περιορισμό **`UNIQUE(showtime_id, seat_id)`**.
2. Η κράτηση γίνεται μέσα σε ένα **transaction**: κλειδώνει τις ζητούμενες θέσεις με `SELECT … FOR UPDATE`, ελέγχει τη διαθεσιμότητα και μετά κάνει `INSERT`.
3. Αν δύο αιτήματα τρέξουν ταυτόχρονα, ο **unique περιορισμός** απορρίπτει το δεύτερο `INSERT`, οπότε το API επιστρέφει **`409 Conflict`** και κάνει rollback.

```mermaid
sequenceDiagram
    autonumber
    actor A as Χρήστης Α
    actor B as Χρήστης Β
    participant API as Express API
    participant DB as MariaDB · InnoDB

    Note over A,B: Επιλέγουν ταυτόχρονα την ΙΔΙΑ θέση για την ίδια προβολή
    A->>API: POST /reservations για τη θέση 12
    B->>API: POST /reservations για τη θέση 12

    Note over API,DB: Transaction A
    API->>DB: BEGIN · SELECT … FOR UPDATE
    DB-->>API: κλείδωμα της θέσης 12
    API->>DB: INSERT reservation_seats
    API->>DB: COMMIT
    API-->>A: 201 Created

    Note over API,DB: Transaction B — περίμενε στο κλείδωμα
    API->>DB: INSERT reservation_seats για τη θέση 12
    DB-->>API: ER_DUP_ENTRY<br/>UNIQUE(showtime_id, seat_id)
    API->>DB: ROLLBACK
    API-->>B: 409 Conflict
```

Η **ακύρωση** μιας κράτησης διαγράφει τις γραμμές του `reservation_seats` και ελευθερώνει ξανά τις θέσεις.

---

## 🔐 Ασφάλεια & ταυτοποίηση

- **bcrypt** για το hashing των κωδικών — ο καθαρός κωδικός δεν αποθηκεύεται ποτέ.
- **JWT access tokens** μικρής διάρκειας μαζί με **rotating refresh tokens**. Στη βάση κρατιέται μόνο το **HMAC-SHA256 hash** του refresh token, ώστε ακόμη και μια διαρροή της βάσης να μην εκθέτει χρησιμοποιήσιμα tokens. Και φυσικά τα tokens μπορούν να **ανακληθούν**.
- Τα tokens φυλάσσονται στο **keychain ή keystore** της συσκευής μέσω `expo-secure-store` και **ανανεώνονται αυτόματα** όταν έρθει ένα `401`.
- **helmet**, **CORS** και **rate-limiting** στα endpoints της ταυτοποίησης.
- **Επικύρωση εισόδου** με **Zod** σε κάθε αίτημα, σε body, query και params, μαζί με **κεντρική διαχείριση σφαλμάτων**.

---

## 🛠️ Επίλυση προβλημάτων

| Πρόβλημα | Λύση |
|----------|------|
| «Cannot reach the server» | Το backend δεν τρέχει ή το firewall μπλοκάρει τη θύρα 4000. Ξεκίνα το backend, επίτρεψε το Node και βεβαιώσου ότι είστε στο ίδιο Wi-Fi. |
| `docker` not found | Ξεκίνα το Docker Desktop και άνοιξε ξανά το terminal. |
| Η θύρα 3306 είναι κατειλημμένη | Τρέχει ήδη κάποια άλλη MySQL ή MariaDB — σταμάτησέ την ή άλλαξε τη θύρα στο `docker-compose.yml`. |
| Θέλω να επαναφέρω τη βάση | `docker compose down -v && docker compose up -d`, που ξανατρέχει schema και seed. |

---

## 🔮 Μελλοντικές επεκτάσεις

- Σύστημα **βαθμολογιών και κριτικών**.
- **Πληρωμές** και email επιβεβαίωσης.
- Προσωρινό **«κράτημα» θέσεων** με χρονικό όριο.
- **Push notifications** και πίνακας **διαχείρισης** για admin.

---

<div align="center">

🎭 **Spotlight** — CN6035 Mobile & Distributed Systems

Δημιουργήθηκε από τον **Χαράλαμπο Στίκο**

</div>
