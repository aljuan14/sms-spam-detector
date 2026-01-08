```markdown
# 🛡️ SMS Guard & Miner

**SMS Guard & Miner** adalah aplikasi web berbasis Machine Learning untuk mendeteksi dan mengklasifikasikan pesan SMS ke dalam kategori **Normal**, **Penipuan (Fraud)**, atau **Promo**.

Aplikasi ini dibangun menggunakan arsitektur Hybrid: Frontend menggunakan **React (Vite)** dan Backend menggunakan **FastAPI (Python)** dengan model Machine Learning **Scikit-Learn**.

![Project Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![React](https://img.shields.io/badge/React-Vite-61DAFB)

## ✨ Fitur Utama

* **🔍 Live Prediction:** Cek status SMS (Spam/Ham) secara real-time via API.
* **📂 Batch Processing:** Upload file **CSV** atau **Excel** untuk melabeli ribuan SMS sekaligus secara otomatis.
* **📊 Dashboard Visualisasi:** Grafik statistik distribusi data (Normal vs Fraud vs Promo).
* **⬇️ Export Data:** Unduh hasil prediksi kembali ke format CSV.
* **⚡ Hybrid Deployment:** Frontend terdeploy di Vercel, Backend berjalan lokal via Ngrok Tunneling untuk performa ML yang optimal.

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

```

### 2. Setup Backend (Python)

Pastikan Python sudah terinstall di komputermu.

```bash
# 1. Masuk ke folder backend
cd backend

# 2. (Opsional) Buat dan aktifkan virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Jalankan Server
# Pastikan dijalankan di dalam folder 'backend'
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

*Backend akan berjalan di `http://localhost:8000*`

### 3. Setup Frontend (React)

Buka terminal baru (jangan matikan terminal backend).

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Jalankan Frontend
npm run dev

```

*Frontend akan berjalan di `http://localhost:5173*`

---

## 🌐 Cara Deployment (Metode Ngrok + Vercel)

Karena model Machine Learning dan library pendukung (Pandas/Scikit-learn) membutuhkan resource yang cukup besar, backend dijalankan di **Local Server** (Laptop) dan dihubungkan ke frontend Vercel menggunakan **Ngrok**.

### Langkah 1: Nyalakan Backend & Ngrok

Di laptop/server lokal, buka dua terminal:

**Terminal 1 (Backend):**

```bash
cd backend
uvicorn main:app --reload --port 8000

```

**Terminal 2 (Ngrok):**

```bash
ngrok http 8000

```

👉 *Copy URL HTTPS yang muncul (contoh: `https://xxxx.ngrok-free.app`).*

### Langkah 2: Update Frontend

Agar Vercel bisa menghubungi laptopmu, update URL API di kode frontend.

1. Buka file `frontend/src/App.jsx`.
2. Cari dan ganti URL `axios.post` dengan link Ngrok barumu:

```javascript
// Contoh perubahan:
const response = await axios.post('[https://xxxx.ngrok-free.app/predict](https://xxxx.ngrok-free.app/predict)', ...);

```

3. Simpan perubahan, lalu push ke GitHub:

```bash
git add .
git commit -m "Update API URL"
git push origin main

```

### Langkah 3: Deploy Frontend

Frontend akan otomatis ter-deploy di **Vercel** setiap kali ada push ke branch `main`.

* Pastikan **Root Directory** di settingan Project Vercel diarahkan ke folder `frontend`.

---

## 👨‍💻 Tim Pengembang

**Kelompok 3 - Informatika UTY**

* **Alfito Juanda** (Fullstack Developer & AI Engineer)
* **Akbar Ramadhan**
* **Zahfar Aziz Ferdian**

---

**Catatan:** Proyek ini dibuat untuk memenuhi Tugas Besar mata kuliah Text Mining / Data Mining.

```