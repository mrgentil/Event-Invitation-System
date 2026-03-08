# Event Invitation Platform

Fullstack application for creating events and sending email invitations to guests. Backend: Laravel API with JWT, Excel import, and Mail. Frontend: React + Vite + TailwindCSS.

## Project structure

```
event-invitation-platform/
├── backend/          # Laravel API
└── frontend/         # React (Vite) SPA
```

## Prerequisites

- **PHP** 8.2+ (with extensions: mbstring, xml, openssl, pdo_mysql, tokenizer)
- **Composer**
- **Node.js** 18+ and npm
- **MySQL** (e.g. via Laragon, XAMPP, or standalone)

---

## Backend (Laravel API)

### 1. Install dependencies

```bash
cd backend
composer install
```

### 2. Environment

Copy the example env and configure database and app URL:

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Edit `.env` and set:

- `DB_CONNECTION=mysql`
- `DB_DATABASE=event_invitation` (create this database in MySQL)
- `DB_USERNAME` and `DB_PASSWORD` as needed
- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:5173` (for CORS)
- Mail (optional): for real emails set `MAIL_MAILER=smtp` and your SMTP settings; default `MAIL_MAILER=log` writes to `storage/logs/laravel.log`

### 3. Database

```bash
php artisan migrate
```

### 4. Run the API server

```bash
php artisan serve
```

API base URL: **http://localhost:8000**  
API routes: **http://localhost:8000/api**

---

## Frontend (React + Vite)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment

Create `.env` in the frontend folder (optional):

```env
VITE_API_URL=http://localhost:8000/api
```

If you omit this, the app uses `http://localhost:8000/api` by default.

### 3. Run the dev server

```bash
npm run dev
```

App URL: **http://localhost:5173**

---

## Running both servers

1. **Terminal 1 – Laravel API**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Terminal 2 – React frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open **http://localhost:5173** in the browser.  
   Register or log in, then create events and upload Excel guest lists; invitations are sent automatically after event creation.

---

## API overview

| Method | Endpoint           | Auth  | Description        |
|--------|--------------------|-------|--------------------|
| POST   | `/api/register`    | No    | Register user      |
| POST   | `/api/login`       | No    | Login (returns JWT)|
| POST   | `/api/logout`      | Yes   | Logout             |
| GET    | `/api/user`        | Yes   | Current user (profile) |
| PUT    | `/api/user`        | Yes   | Update profile (name, email, password) |
| DELETE | `/api/user`        | Yes   | Delete account     |
| GET    | `/api/events`      | Yes   | List user's events |
| POST   | `/api/events`      | Yes   | Create event + upload Excel, send emails |
| GET    | `/api/events/{id}` | Yes   | Event detail + guests |
| PUT    | `/api/events/{id}` | Yes   | Update event       |
| DELETE | `/api/events/{id}` | Yes   | Delete event       |

Authenticated requests use header: `Authorization: Bearer <token>`.

---

## Excel guest file

For **Create Event**, upload an Excel file (`.xlsx`, `.xls`, or `.csv`) with columns (spec du test : **Nom**, **Email**) :

- **Nom** ou **name**
- **email**

Headers are read from the first row (case-insensitive). After the event is created, invitation emails are sent automatically to all listed guests (message type : « Cher(e) {nom}, Vous êtes invité(e) à l'événement … Nous espérons vous y voir. »).

---

## Database tables

- **users** – id, name, email, password, timestamps  
- **events** – id, user_id, title, description, location, date, time, timestamps  
- **guests** – id, event_id, name, email, timestamps  

---

## Build for production

**Backend**

- Set `APP_ENV=production`, `APP_DEBUG=false`, and a strong `APP_KEY`
- Run `php artisan config:cache` and `php artisan route:cache`
- Point your web server (e.g. Nginx/Apache) to `backend/public`

**Frontend**

```bash
cd frontend
npm run build
```

Serve the `frontend/dist` folder from your web server and set `VITE_API_URL` to your production API URL when building.
