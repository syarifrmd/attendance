## Plan: Intern Attendance PWA Implementation

Perancangan PWA untuk absensi *mobile-first* (bagi anak magang) dan *dashboard* berbasis *desktop* (bagi mentor), menggunakan fitur Geolocation dan Face Verification *client-side*.

**Steps**

**Phase 1: Project & Database Foundation**
1. Instalasi dependensi tambahan: `vite-plugin-pwa`, `face-api.js`, `recharts` (indikator capaian UI), `react-hot-toast` (*feedback*).
2. Inisialisasi PWA dengan `vite-plugin-pwa`, buat manifest dengan nama "Intern Attendance" dan ikon yang sesuai.
3. Konfigurasi `vite-plugin-pwa` di `vite.config.ts`.
4. Update skema `users` pada file `0001_01_01_000000_create_users_table.php` untuk menambahkan `role` (enum: 'intern', 'mentor').
5. Pembuatan migration & Model `Profile` (kolom: `user_id`, `foto`, `nama_lengkap`, `asal_kampus`, `divisi`, `mentor_id`, `periode_magang`).
6. Pembuatan migration & Model `Attendance` (kolom: `user_id`, `status`, `latitude`, `longitude`, `face_verification_path`, `proof_image_path`, `reason`).

**Phase 2: Backend API & Business Logic**
1. Buat `AttendanceRequest` untuk validasi ketat (WFO/WFH/WFA wajib lampirkan GPS & Face; Izin/Sakit wajib *Proof Photo* & Alasan - memvalidasi sesuai panduan).
2. Buat `AttendanceController` untuk memproses *check-in*, menyimpan file via `Storage::disk('public')`, dan mengambil *history*.
3. Buat 'announcement' fitur yang bisa diposting mentor untuk dilihat intern di menu dockbar.
4. Buat `MentorController` dilengkapi *eager loading* `.with('profile')` untuk menghindari kendala performa *N+1 query*.
5. Ekstraksi logika perhitungan (Harian, Mingguan, Bulanan) ke dalam sebuah Actions/Service class agar *controller* tetap *lean* (tipis).

**Phase 3: Frontend Shared Components**
1. Buat `MobileLayout` dengan kelas utilitas pengekang lebar layar (`w-full max-w-md mx-auto`) untuk memaksakan desain *mobile-first* di web.
2. Buat komponen `BottomNav` khusus peran `intern` dengan ikon *Home*, Absent (Checkin/Checkout), News, dan Profil menyesuaikan dengan UI referensi.
3. Buat komponen re-usable `AttendanceSummaryCard` menggunakan `recharts` untuk menampilkan indikator skala performa magang.
4. Buat sub-komponen kartu riwayat dan *Skeleton Loaders* untuk memberi tahu *user* bila sedang memuat *history* dari API.

**Phase 4: Frontend Pages & Hardware Integration**
1. Halaman **Intern Dashboard**: Menggabungkan `AttendanceSummaryCard` dan *scrollable list* pendaftaran *(chronological)*.
2. Halaman **Attendance Capture**: Mengintegrasikan HTML5 Geolocation API dan Camera WebRTC. Logika deteksi wajah diproses di *client-side* (`face-api.js`), kemudian hasil validasinya (gambar & true/false) di-*post* ke *backend*.
3. Halaman **Mentor Dashboard**: Menggunakan *layout* desktop standar, tabel data dengan filterisasi cepat, pengelolaan *intern* (CRUD).

**Relevant files**
- `database/migrations/*` — Penambahan *table* Profiles dan Attendances.
- `app/Models/User.php` — Penambahan relasi *One-to-One* ke Profile dan *One-to-Many* ke Attendances.
- `app/Http/Requests/AttendanceRequest.php` — Berisi aturan validasi status absensi.
- `vite.config.ts` — Modifikasi untuk PWA manifest.
- `resources/js/layouts/MobileLayout.tsx` — Pengekang lebar dan Bottom Nav untuk UI intern.
- `resources/js/pages/Intern/AttendanceForm.tsx` — Komponen tangkapan lokasi dan wajah.

**Verification**
1. Pastikan validasi form API Laravel menolak payload WFO jika koordinat lokasi sengaja dikosongkan/dimatikan dari frontend.
2. Cek instalabilitas PWA melalui Chrome DevTools (tab Aplikasi) guna memastikan service worker berjalan dengan benar.
3. Uji *Eager Loading* di sisi Mentor dengan Laravel Telescope, pastikan tidak muncul *N+1 query detection*.
4. Uji Camera API pada simulator perangkat *mobile* sesungguhnya (*ngrok* / *local IP exposure*) untuk verifikasi wajah jalan atau tidak secara UX.

**Decisions** 
- Pemrosesan spesifik *Machine Learning* untuk wajah akan dikerjakan seefisien mungkin di perangkat anak magang (browser-based) guna menghemat *load server* dan menjamin respons PWA yang cepat.
- Menggunakan pendekatan *Strict Role Isolation*: *Route* React/Inertia milik Intern dan Mentor sama sekali terpisah guna keamanan data dan mencegah insiden antarmuka tertukar.