# 🛡️ SMS Guard & Miner

**SMS Guard & Miner** adalah aplikasi web berbasis Machine Learning untuk mendeteksi dan mengklasifikasikan pesan SMS ke dalam kategori **Normal**, **Penipuan (Fraud)**, atau **Promo**.

Aplikasi ini dibangun menggunakan arsitektur Hybrid: Frontend menggunakan **React (Vite)** dan Backend menggunakan **FastAPI (Python)** dengan model Machine Learning **Scikit-Learn**.

![Project Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Fitur Utama

* **🔍 Live Prediction:** Cek status SMS (Spam/Ham) secara real-time via API.
* **📂 Batch Processing:** Upload file **CSV** atau **Excel** untuk melabeli ribuan SMS sekaligus secara otomatis.
* **📊 Dashboard Visualisasi:** Grafik statistik distribusi data (Normal vs Fraud vs Promo).
* **⬇️ Export Data:** Unduh hasil prediksi kembali ke format CSV.
* **⚡ Hybrid Deployment:** Frontend terdeploy di Vercel, Backend berjalan lokal via Ngrok Tunneling.

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **Charts:** Recharts
* **Icons:** Lucide React
* **HTTP Client:** Axios

### Backend & AI
* **Framework:** FastAPI
* **Server:** Uvicorn
* **Machine Learning:** Scikit-Learn, Pandas, Numpy
* **Tunneling:** Ngrok (untuk mengekspos localhost ke internet)

---

## 🚀 Cara Menjalankan (Local Development)

Ikuti langkah ini untuk menjalankan proyek di komputer lokal.

### 1. Clone Repository
```bash
git clone [https://github.com/aljuan14/sms-spam-detector.git](https://github.com/aljuan14/sms-spam-detector.git)
cd sms-spam-detector


2. Setup Backend (Python)
Pastikan Python sudah terinstall.

Bash

# Masuk ke folder backend
cd backend

# (Opsional) Buat virtual environment
python -m venv venv
# Aktifkan venv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)

# Install dependencies
pip install -r ../requirements.txt

# Jalankan Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
3. Setup Frontend (React)
Buka terminal baru.

Bash

# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan Frontend
npm run dev
🌐 Cara Deployment (Metode Ngrok + Vercel)
Karena model Machine Learning membutuhkan resource yang cukup besar, backend dijalankan di local server dan dihubungkan ke frontend Vercel menggunakan Ngrok.

Langkah 1: Nyalakan Backend & Ngrok
Di laptop/server lokal:

Jalankan Backend: uvicorn backend.main:app --reload --port 8000

Jalankan Ngrok: ngrok http 8000

Copy URL HTTPS dari Ngrok (contoh: https://xxxx.ngrok-free.app).

Langkah 2: Update Frontend
Buka file frontend/src/App.jsx.

Ganti URL API dengan link Ngrok yang baru.

JavaScript

const response = await axios.post('[https://xxxx.ngrok-free.app/predict](https://xxxx.ngrok-free.app/predict)', ...);
Push ke GitHub.

Langkah 3: Deploy Frontend
Frontend akan otomatis ter-deploy di Vercel setiap kali ada push ke branch main.

Pastikan Root Directory di settingan Vercel diarahkan ke folder frontend.

👨‍💻 Tim Pengembang
Kelompok 3 - Informatika UTY

Catatan: Proyek ini dibuat untuk memenuhi Tugas Besar mata kuliah Text Mining / Data Mining.