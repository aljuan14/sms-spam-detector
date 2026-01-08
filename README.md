<div align="center">

# 🛡️ SMS Guard & Miner
### **Advanced SMS Spam Detection & Analysis System**

![Project Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge&logo=statuspage)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <b>SMS Guard & Miner</b> adalah aplikasi web Hybrid (React + Python) berbasis Machine Learning <br/>
  untuk mendeteksi pesan <b>Normal</b>, <b>Penipuan (Fraud)</b>, atau <b>Promo</b> secara akurat.
</p>

<a href="#-fitur-unggulan">Fitur</a> •
<a href="#-tech-stack">Teknologi</a> •
<a href="#-cara-instalasi-local">Instalasi</a> •
<a href="#-deployment-guide-ngrok--vercel">Deployment</a> •
<a href="#-tim-pengembang">Tim</a>

</div>

---

## ✨ Fitur Unggulan

| Fitur | Deskripsi |
| :--- | :--- |
| **🔍 Live Prediction** | Analisis status SMS (Spam/Ham) secara *real-time* via API tunggal. |
| **📂 Batch Processing** | Upload file **CSV/Excel** untuk melabeli ribuan data sekaligus secara otomatis. |
| **📊 Smart Dashboard** | Visualisasi data interaktif dengan grafik distribusi (Normal vs Fraud vs Promo). |
| **⬇️ Export Data** | Unduh hasil analisis dan prediksi kembali ke format CSV/Excel. |
| **⚡ Hybrid Architecture** | Kombinasi performa Backend Lokal (GPU/CPU) dengan fleksibilitas Frontend Cloud. |

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan teknologi modern untuk menjamin performa dan skalabilitas.

### **Frontend (Client)**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=hugo&logoColor=white)

### **Backend & AI (Server)**
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)

### **Infrastructure & Tools**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Ngrok](https://img.shields.io/badge/Ngrok-1F1E38?style=for-the-badge&logo=ngrok&logoColor=white)
![Git](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)

---

## 🚀 Cara Instalasi (Local)

Ikuti langkah ini untuk menjalankan proyek sepenuhnya di komputer lokal.

### 1️⃣ Clone Repository
```bash
git clone [https://github.com/aljuan14/sms-spam-detector.git](https://github.com/aljuan14/sms-spam-detector.git)
cd sms-spam-detector



### 2️⃣ Setup Backend (Python)

```bash
cd backend

# Buat & Aktifkan Virtual Environment (Opsional tapi direkomendasikan)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Library
pip install -r requirements.txt

# Jalankan Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

> ✅ Backend berjalan di: `http://localhost:8000`

### 3️⃣ Setup Frontend (React)

Buka terminal baru:

```bash
cd frontend

# Install Library JS
npm install

# Jalankan Web App
npm run dev

```

> ✅ Frontend berjalan di: `http://localhost:5173`

---

## 🌐 Deployment Guide (Ngrok + Vercel)

Karena model Machine Learning membutuhkan resource komputasi yang besar, kami menggunakan pendekatan **Hybrid**: Backend berjalan di Laptop lokal, Frontend berjalan di Vercel, dihubungkan oleh **Ngrok**.

### 🔹 Langkah 1: Nyalakan Backend & Tunnel

Di laptop/server lokal, buka dua terminal terpisah:

**Terminal A (Python Server):**

```bash
cd backend
uvicorn main:app --reload --port 8000

```

**Terminal B (Ngrok Tunnel):**

```bash
ngrok http 8000

```

👉 *Salin URL HTTPS yang muncul (contoh: `https://abcd-1234.ngrok-free.app`)*

### 🔹 Langkah 2: Update Frontend Config

Agar Vercel bisa berkomunikasi dengan laptop Anda:

1. Buka file `frontend/src/App.jsx`.
2. Cari `axios.post` dan ganti URL-nya dengan link Ngrok terbaru:
```javascript
const response = await axios.post('[https://abcd-1234.ngrok-free.app/predict](https://abcd-1234.ngrok-free.app/predict)', ...);

```


3. Simpan dan Push ke GitHub:
```bash
git add .
git commit -m "Update Production URL"
git push origin main

```



### 🔹 Langkah 3: Auto-Deploy

Vercel akan otomatis mendeteksi perubahan dan melakukan deployment ulang. Dalam 1-2 menit, aplikasi siap digunakan!

---

## 👨‍💻 Tim Pengembang

Proyek ini dikembangkan oleh **Kelompok 3 - Informatika UTY** untuk tugas besar mata kuliah *Text Mining / Data Mining*.

| Nama | Role |
| --- | --- |
| **Alfito Juanda** | Fullstack Developer & AI Engineer |
| **Akbar Ramadhan** | Data Analyst & Documentation |
| **Zahfar Aziz Ferdian** | UI/UX Designer & Tester |

---

<div align="center">
<small>Made with ❤️ by Kelompok 3 UTY using Python & React</small>
</div>

```

```