# Kalakai Full-Stack Project

Proyek decoupled full-stack menggunakan **Laravel 13** (Backend REST API) dan **Next.js** (Frontend).

## Struktur Direktori

```text
kalakai/
├── backend/          # Laravel 13 API Backend
│   ├── app/
│   ├── routes/api.php
│   └── ...
├── frontend/         # Next.js App Router (TypeScript, Tailwind CSS)
│   ├── src/app/
│   └── ...
└── README.md
```

---

## 1. Menjalankan Backend (Laravel 13)

Buka terminal di folder backend:

```bash
cd backend
php artisan serve
```

Server backend akan berjalan di `http://localhost:8000`.
- Endpoint Health Check: `http://localhost:8000/api/health`

---

## 2. Menjalankan Frontend (Next.js)

Buka terminal lain di folder frontend:

```bash
cd frontend
npm run dev
```

Server frontend akan berjalan di `http://localhost:3000`.

---

## Konfigurasi Environment

- **Backend** (`backend/.env`):
  - `APP_URL=http://localhost:8000`
  - `FRONTEND_URL=http://localhost:3000`
- **Frontend** (`frontend/.env.local`):
  - `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
