# Sistem Manajemen Sekolah Sepak Bola (SSB)

Sebuah sistem informasi sederhana berbasis web untuk mengelola data operasional Sekolah Sepak Bola, termasuk manajemen data siswa, jadwal latihan rutin, dan jadwal turnamen.

## Tools yang Digunakan

Proyek ini dibangun menggunakan arsitektur *decoupled* (API-driven) dengan pemisahan antara sisi server dan antarmuka pengguna.

**Backend (REST API):**
* Node.js & Express.js: Sebagai framework backend web server utama.
* MySQL: Sebagai database.
* PhpMyadmin: Sebagai UI mengatur database.
* Sequelize: Sebagai ORM (Object-Relational Mapper) untuk interaksi database melalui Code.
* JSON Web Token (JWT) & Bcrypt: Untuk sistem autentikasi dan enkripsi password.
* Express Rate Limit: Untuk keamanan dari serangan brute-force dan spam.
* Docker & Docker Compose: Untuk containerization dan deployment database.
* Nginx: Sebagai Web server.
* Nginx Proxy Manager: Sebagai proxy server.
* CLoudflare tunnel: Sebagai Tunneling ke Internet.
* Github: Version Control.
* Proxmox: Sebagai OS deployment.

**Frontend:**
* React.js: Sebagai library UI utama.
* Vite: Sebagai build tool agar proses development lebih cepat.

---

## Bagian yang Dibantu AI

Dalam proses penyelesaian proyek ini, saya menggunakan AI Github Copilot dengan model Cloude Sonnet 4.5 sebagai asisten diskusi teknis pada beberapa bagian berikut:
1. Perancangan Arsitektur: Membantu membedah perbandingan, keuntungan dan kemudahan menggunakan beberapa arsitektur.
2. Troubleshooting & Debugging: Membantu menganalisis pesan error saat proses development.
3. Konfigurasi Lingkungan: Membantu membuat draf awal untuk file `docker-compose.yml` agar sesuai dengan lingkungan deployment.
4. Pekerjaan berulan: Membantu membuat fuction template untuk bagian CRUD berdasarkan code yang sudah dibuat, seperti pada bagian `jadwalLatihanController.js` dan `jadwalTurnamenController.js`. Pada bagian routes juga dibantun penulisannya untuk efisiensi kerja.
5. Pembuatan frontend pada pengaturan layouting.

---

## 🚧 Kendala yang Dihadapi & Cara Mengatasinya

* Kendala 1: Tidak bisa membuat bagian frontend
  * Masalah: Saya jarang menangani bagian frontend, terutama pada bagian layouting pada css.
  * Cara Mengatasi: Pemanfaatan AI untuk membuat layout pada bagian forntend.

* Kendala 2: Menentukan Logika Bisnis yang paling sesuai dengan kebutuhan.
  * Masalah: Pada studycase yang diberikan, kira disuruh untuk membuat sebuah aplikasi untuk memanage SSB. Saya awal nya bingung menentukan apakah siswanya nanti akan membuat akun sendiri atau tidak, lalu pada bagian jadwal tunamen dan jadwal latihan apakah harus menginputkan satu persatu atau bagaimana.
  * Cara Mengatasi: Untuk permasalahan pertama saya memutuskan untuk sementara admin yang akan memasukan data secara manual ke dalam sistem, karena aplikasi ini difokuskan untuk mengatur pemain dan saya rasa untuk sekala ini form masih masuk akal untuk dilakukan, dan berdasarkan riset singkat saya pun untuk rata rata murid SSB berkisar 50 - 100. Untuk permasalahan ke dua saya menerapkan dua pendekatan berbeda. Jadwal latihan dihubungkan melalui pengelompokan berdasarkan "Kelompok Umur" (U-10, U-12) agar lebih dinamis, sementara Jadwal Turnamen dibuat lebih lebih seperti event kalender untuk pengingat manajemen atau admin bahwa waktunya tinggal dekat.