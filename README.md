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
| <img src="./assets/screenshots/Dashboard.jpg" width="200" alt="Dashboard"/> | <img src="./assets/screenshots/Map.jpg" width="200" alt="Peta"/> | <img src="./assets/screenshots/History.jpg" width="200" alt="History"/> | <img src="./assets/screenshots/profile.jpg" width="200" alt="Profil"/> |

---
*Dibuat untuk memenuhi tugas Responsi PGPBL 2025.*
