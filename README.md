# AORTA Hospital OS - Frontend

![Vue.js](https://img.shields.io/badge/Vue.js-3.0-4FC08D?style=for-the-badge&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

AORTA Hospital OS Frontend adalah Single Page Application (SPA) berbasis Vue 3 yang dikembangkan dengan arsitektur Enterprise Modular. Aplikasi ini dirancang khusus untuk manajemen operasional rumah sakit yang modern, skalabel, dan responsif.

## 🌟 Fitur Utama
- **Arsitektur Modular:** Pemisahan logic berdasarkan modul (Auth, Dashboard, dll) untuk mempermudah maintenance.
- **Kinerja Tinggi:** Menggunakan Vite untuk waktu build yang super cepat dan HMR (Hot Module Replacement) instan.
- **Tipe Data Aman:** Dikembangkan sepenuhnya menggunakan TypeScript.
- **Desain Modern:** Memanfaatkan Tailwind CSS untuk styling utilitas.
- **State Management:** Pinia untuk manajemen state aplikasi yang reaktif dan intuitif.

## 📂 Struktur Direktori

```text
src/
├── api/          # Konfigurasi Axios & interseptor API
├── assets/       # Aset statis seperti gambar, font, dan CSS global
├── components/   # Komponen UI Vue yang dapat digunakan ulang (Re-usable)
├── composables/  # Logic bisnis yang dapat digunakan ulang (Vue Composition API)
├── layouts/      # Layout utama aplikasi (mis: Layout Dashboard, Layout Auth)
├── modules/      # Modul domain spesifik (Auth, Dashboard, Pasien, dll)
│   ├── Auth/
│   │   └── views/
│   └── Dashboard/
│       └── views/
├── router/       # Konfigurasi Vue Router
├── store/        # Manajemen state global menggunakan Pinia
├── App.vue       # Root komponen Vue
└── main.ts       # Entry point aplikasi
```

## 🚀 Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal:

### 1. Kloning Repositori
```bash
git clone https://github.com/Habibalfrz/Aorta-Frontend.git
cd Aorta-Frontend
```

### 2. Instalasi Dependensi
Pastikan Anda sudah menginstal Node.js (direkomendasikan versi terbaru LTS).

```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` (jika ada) ke `.env` dan sesuaikan URL API untuk koneksi ke backend ASP.NET.

```bash
cp .env.example .env
```
*(Catatan: pastikan mengatur `VITE_API_BASE_URL` sesuai alamat backend lokal atau server dev Anda).*

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan secara default di `http://localhost:5173`.

## 📦 Build untuk Produksi

Untuk melakukan kompilasi proyek agar siap di-deploy ke environment produksi:
```bash
npm run build
```
Hasil kompilasi akan berada di folder `dist/`.

## 🛠 Teknologi yang Digunakan
- [Vue 3 (Composition API & `<script setup>`)](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vue Router 4](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)

---
*AORTA Hospital OS - Frontend System*
