Gambar yang muncul sebagai ikon "pecah" (broken image) berarti GitHub gagal menemukan file tersebut di jalur (path) yang dituliskan.

Ini biasanya terjadi karena dua alasan:

Perubahan nama folder belum ter-update di GitHub: Di laptop folder sudah bernama screenshots, tapi di GitHub mungkin masih screenshoots (dobel 'o') atau folder tersebut belum ter-push.

Case Sensitive: Besar kecil huruf nama file tidak sesuai persis.

Solusi Paling Ampuh: Gunakan Link "Raw"

Agar kita tidak perlu pusing menebak jalur relatif (./assets/...), kita gunakan Link Absolut (Raw URL) langsung dari repository GitHub kamu. Cara ini dijamin memunculkan gambar selama filenya ada di GitHub.

Silakan Copy & Paste kode di bawah ini untuk menggantikan bagian tabel gambar di README.md kamu. Saya sudah menyusun link-nya berdasarkan akun GitHub kamu (23Rayzu).

code
Markdown
download
content_copy
expand_less
# HITE MOJO (Hilang Temu Motor Jogja)

## Deskripsi Produk
**HITE MOJO** adalah Aplikasi Perangkat Bergerak Berbasis Geospasial yang dirancang untuk membantu masyarakat Yogyakarta dalam melaporkan dan melacak kendaraan bermotor yang hilang. Aplikasi ini menghubungkan masyarakat dengan pihak kepolisian melalui pemetaan lokasi kejadian (TKP) dan lokasi kantor polisi terdekat secara *real-time*.

## Komponen Pembangun Produk
Aplikasi ini dikembangkan menggunakan teknologi berikut:
- **Framework**: React Native (Expo SDK)
- **Bahasa Pemrograman**: TypeScript
- **Peta & Geospasial**: React Native Maps (Google Maps API)
- **Backend & Database**: Firebase Realtime Database
- **Autentikasi**: Firebase Authentication
- **Manajemen State**: React Context API & Hooks
- **Desain Antarmuka**: React Native Vector Icons & Custom Styling

## Sumber Data
Data yang digunakan dalam aplikasi ini bersumber dari:
1.  **Crowdsourcing**: Data kehilangan motor yang diinputkan langsung oleh pengguna (Nama, Nopol, Ciri-ciri, Foto, Koordinat).
2.  **Data Statis**: Titik koordinat kantor polisi (Polsek/Polda) di wilayah D.I. Yogyakarta.
3.  **Google Maps Services**: Base map dan geocoding untuk visualisasi lokasi.

## Tangkapan Layar Komponen Penting
Berikut adalah tampilan antarmuka utama aplikasi HITE MOJO:

| Dashboard Monitoring | Peta Persebaran | Riwayat Laporan | Profil Pengguna |
| :---: | :---: | :---: | :---: |
| <img src="https://raw.githubusercontent.com/23Rayzu/HITE-MOJO/main/assets/screenshots/Dashboard.jpg" width="200" alt="Dashboard"/> | <img src="https://raw.githubusercontent.com/23Rayzu/HITE-MOJO/main/assets/screenshots/Map.jpg" width="200" alt="Peta"/> | <img src="https://raw.githubusercontent.com/23Rayzu/HITE-MOJO/main/assets/screenshots/History.jpg" width="200" alt="History"/> | <img src="https://raw.githubusercontent.com/23Rayzu/HITE-MOJO/main/assets/screenshots/profile.jpg" width="200" alt="Profil"/> |

---
*Dibuat untuk memenuhi tugas Responsi PGPBL 2025.*
