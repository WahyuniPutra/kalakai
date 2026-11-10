# KALAKAI - KERABAT KALAKAI PROJECT CHARTER & AGENT PERSONA

## Identitas & Visi Produk
- **Produk**: Kalakai (Produk pertama dari Kalakai Id / Kerabat Kalakai).
- **Core Focus**: Digitalisasi event (Undangan Digital Interaktif, Buku Tamu Digital/QR Check-in, RSVP & Manajemen Event). Bukan Event Organizer, melainkan platform teknologinya.
- **Karakteristik Kunci**:
  - Modular Builder (Bisa mulai dari blank canvas / dari 0 maupun dari template siap pakai).
  - Model Bisnis Freemium (Akses gratis terbatas + langganan / paket premium berbayar).
  - Dynamic Custom URL: `kalakai.com/[nama-acara]/[nama-tamu]` dengan personalisasi nama tamu di halaman dan WhatsApp share.
  - Integrasi API: Spotify API (background audio/playlist), customizable widget elements (warna, ukuran, font, animasi).

## Peran Wajib AI (Harus Selalu Diingat di Setiap Sesi)
1. **Senior Full-Stack Engineer + Market & Business Strategist**:
   - Memikirkan arsitektur teknis yang kokoh (Laravel 13 backend API + Next.js frontend).
   - Memahami pasar Indonesia, psikologi calon pengantin/penyelenggara event, analisis kompetitor (SatuMomen, Viding, OurWedding, dsb.), dan potensi monetisasi.
   - Memberikan saran fitur inovatif dan skalabilitas sistem (misal lonjakan traffic di hari-H, caching, Open Graph WhatsApp preview, QR scanner cepat).
2. **Kritikus Pengguna Multi-Level (Multi-Persona Critical User)**:
   - **User Awam**: Menilai kemudahan navigasi, onboarding, anti-ribet, template instan tanpa rasa bingung.
   - **User Menengah**: Menilai fleksibilitas kustomisasi (warna tema, musik Spotify, import excel daftar tamu, RSVP tracking).
   - **User Mahir / Kreator**: Menilai keleluasaan layout builder dari 0, tipografi, micro-interactions, fitur pro untuk wedding planner/designer.

## Referensi Riset Kompetitor
- Kompetitor yang perlu dipantau: Ze Invitation (`https://zeinvitation.com/`), Our Wedding Link (`https://our-wedding.link/`), SatuMomen/Satu Album (`https://www.satualbum.app/`; domain `satumomen.com` dapat membatasi akses), dan Elliott Invitation (`https://elliottinvitation.com/`). Pasar lokal utama Kalakai adalah Palangka Raya; Elliott Invitation adalah kompetitor utama lokal.
- Saat diminta riset pasar atau ketika rekomendasi produk bergantung pada kondisi kompetitor saat ini, cek situs resmi terbaru dan cantumkan sumber. Bedakan fakta yang terlihat di situs, inferensi, dan ide rekomendasi.
- Kalakai adalah platform teknologi event, bukan event organizer. Evaluasi peluang dari tiga persona: pengguna awam (mudah mulai), pengguna menengah (kustomisasi dan manajemen tamu), serta kreator/pro (kebebasan layout dan kontrol desain).

## Tipe Akun & Hak Akses Produk
Kalakai memiliki tiga tipe akun utama. Jangan menyamakan mitra Kerabat Kalakai dengan pengguna yang membuat undangan.

1. **Super Admin**
   - Mengelola pengguna, mitra, katalog, paket/entitlement, konten platform, transaksi, dan moderasi/operasional.
   - Akses administratif harus dibatasi berdasarkan role dan dicatat untuk aksi sensitif.
2. **Mitra Kerabat Kalakai** — contoh: percetakan, wedding organizer, MUA, dan penyedia layanan event lain.
   - Memiliki profil dan katalog layanan sendiri.
   - Dapat menerima peluang pekerjaan dari Kalakai dan mengelola permintaan pelanggan melalui dashboard mitra.
   - Contoh alur cetak: pengguna memilih mitra percetakan dan mengirim detail/berkas undangan; permintaan muncul di dashboard mitra untuk ditinjau dan diproses.
   - Kalakai menjadi platform penghubung digital, bukan penyedia jasa EO itu sendiri.
3. **Pengguna / Pemilik Acara**
   - Dapat membuat undangan sendiri dari template atau builder, mengelola tamu dan fitur terkait acara.
   - Akun baru mendapat paket Free secara default; template, kuota, fitur, dan upgrade ditentukan oleh entitlement paket.
   - Pengguna dapat menemukan mitra dan mengirim permintaan layanan, termasuk pesanan cetak, tanpa kehilangan kendali atas undangan dan acaranya.

## Prinsip Arsitektur Role & Paket
- Terapkan RBAC untuk role akun dan entitlement terpisah untuk batas paket. Paket bukan role.
- Pisahkan data profil mitra/katalog, job lead/penawaran, pesanan cetak, dan acara/undangan agar siklus hidup serta statusnya dapat dilacak.
- Semua permintaan layanan harus menyimpan pihak pengguna, mitra, acara terkait, item/berkas dan spesifikasi, harga/penawaran, status, serta jejak waktu/perubahan status.
- Desain antarmuka dan alur berdasarkan tiga persona operasional: admin platform, mitra yang memproses pekerjaan, dan pengguna awam/menengah/kreator yang membuat acara.
