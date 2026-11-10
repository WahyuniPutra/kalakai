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

Sebelum Next.js mulai, `npm run dev` otomatis membangun studio OpenDesign yang tertanam di tab **Template** dan **Editor**. Pada pemakaian pertama, skrip akan menyiapkan pnpm melalui npx bila belum tersedia. OpenDesign sudah disesuaikan untuk template undangan Kalakai; desain, halaman, brand kit, dan font disimpan bersama data acara melalui Laravel. Bundle editor dibuat otomatis dan tidak perlu menjalankan Wrangler atau server OpenDesign terpisah.

Sumber OpenDesign dan lisensi MIT tersedia di [`frontend/opendesign`](frontend/opendesign) dan [repositori resminya](https://github.com/clawnify/OpenDesign).

---

## Konfigurasi Environment

- **Backend** (`backend/.env`):
  - `APP_URL=http://localhost:8000`
  - `FRONTEND_URL=http://localhost:3000`
- **Frontend** (`frontend/.env.local`):
  - `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
