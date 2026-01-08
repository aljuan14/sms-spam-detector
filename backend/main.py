import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import re
import spacy
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# --- 1. SETUP PATH & LOGGING (KHUSUS VERCEL) ---
# Ini wajib agar file .pkl bisa ditemukan di server Vercel
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "sms_spam_detection_model.pkl")

# --- 2. DEFINISI FUNGSI CUSTOM (WAJIB ADA UNTUK UNPICKLING) ---
# Fungsi-fungsi ini harus didefinisikan SEBELUM load model
# karena kemungkinan pipeline model kamu memanggil fungsi ini.

try:
    # Coba load spacy, jika gagal (karena environment serverless), pakai set kosong
    # Di requirements.txt sebaiknya tambahkan link model spacy-nya
    nlp = spacy.blank("id")
    STOP_WORDS = nlp.Defaults.stop_words
except Exception as e:
    print(f"Warning Spacy: {e}")
    STOP_WORDS = set()

# List stop words tambahan kamu
STOP_WORDS.update(['yg', 'jg', 'teh', 'mah', 'da', 'atuh', 'jd', 'km', 'ak', 'lg', 'ya', 'ga', 'ngga', 'nggak', 'gak', 'tp',
                   'kalo', 'nya', 'pake', 'liat', 'udh', 'aja', 'wkwk', 'wkwkwk', 'wk', 'gt', 'gais', 'blm', 'sih', 'tau',
                   'tahu', 'gt', 'udah', 'utk', 'rb', 'rp', 'dgn', 'ayo', 'isi', 'biar', 'yah', 'dr', 'bawa', 'gitu', 'eh',
                   'pas', 'td', 'sm', 'pengen', 'pgn', 'dpt', 'sd', 'byr', 'min', 'dscn', 'sy', 'no'])


def bersih_bersih(sentence):
    sentence = str(sentence).lower()
    sentence = re.sub(r'(\[.*?\]|\(.*?\))', '', sentence)
    sentence = re.sub(r'\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.', '', sentence)
    sentence = re.sub(r'\d{2}\s\w{3,}\s\d{4}.', '', sentence)
    sentence = re.sub(
        r'(menit|mnt|thn|tahun|minggu|mg|hari|hr|jam|jm|detik|dtk|sekon)*', '', sentence)
    sentence = re.sub(
        r'(\d{1,}\s*gb|\d{1,}\s*kb|\d{1,}\s*mb|\d{1,}\s*tb|lte)', '', sentence)
    sentence = re.sub(
        r'(ribu|rb|jt|juta|milyar|miliar|triliun|trilyun)', '', sentence)
    sentence = re.sub(r'\w*\.*\w{1,}\.*\/\w{1,}', '', sentence)
    sentence = re.sub(r'rp\s*\d{1,}\s*', '', sentence)
    sentence = re.sub(r"\*\d{3,}\*\d{3,}#", "", sentence)
    sentence = re.sub(r"\*\d{3,}#", "", sentence)
    sentence = re.sub(r"https?://\S+|www\.\S+", "", sentence)
    sentence = re.sub(r'\b\d+\b', '', sentence)

    # Hapus Stopwords
    tokens = sentence.split()
    tokens = [word for word in tokens if word not in STOP_WORDS]
    sentence = ' '.join(tokens)

    sentence = sentence.strip()
    return sentence


def get_text_feature(data):
    if isinstance(data, pd.DataFrame):
        return data['Teks Bersih'] if 'Teks Bersih' in data.columns else data.iloc[:, 0]
    return data


def get_numeric_feature(data):
    if isinstance(data, pd.DataFrame):
        text_data = data['Teks Bersih'] if 'Teks Bersih' in data.columns else data.iloc[:, 0]
        return text_data.apply(len).values.reshape(-1, 1)
    elif isinstance(data, pd.Series):
        return data.apply(len).values.reshape(-1, 1)
    else:
        return np.array([len(x) for x in data]).reshape(-1, 1)


# --- 3. LOAD MODEL & APP ---
app = FastAPI(title="SMS Spam Detector API")

# --- KONFIGURASI CORS (PENTING UNTUK VERCEL) ---
app.add_middleware(
    CORSMiddleware,
    # Di production bisa diganti domain spesifik frontend Vercel kamu
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model dengan Path Absolut
try:
    print(f"Loading model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    print("✅ Model berhasil dimuat!")
except Exception as e:
    print(f"❌ Error memuat model: {e}")
    # Kita tidak raise error disini agar app tetap jalan dan bisa return error message di endpoint root
    model = None

# --- 4. SCHEMAS (Input Model) ---


class SMSInput(BaseModel):
    text: str


class BatchInput(BaseModel):
    texts: List[str]

# --- 5. ENDPOINTS ---


@app.get("/")
def home():
    if model is None:
        return {"status": "error", "message": "Model file not found or failed to load.", "path_checked": MODEL_PATH}
    return {"message": "SMS Spam Detector API is Running on Vercel!"}


@app.post("/predict")
def predict_sms(input_data: SMSInput):
    if model is None:
        raise HTTPException(
            status_code=500, detail="Model belum dimuat di server.")

    raw_text = input_data.text
    cleaned_text = bersih_bersih(raw_text)

    try:
        input_df = pd.DataFrame({'Teks Bersih': [cleaned_text]})
        prediction = model.predict(input_df)[0]

        try:
            proba = model.predict_proba(input_df)
            confidence = np.max(proba) * 100
        except:
            confidence = 0

        label_map = {0: "Normal", 1: "Penipuan/Fraud", 2: "Promo"}
        result = label_map.get(int(prediction), "Unknown")

        return {
            "text": raw_text,
            "cleaned_text": cleaned_text,
            "prediction": int(prediction),
            "label": result,
            "confidence": f"{confidence:.2f}%"
        }
    except Exception as e:
        print(f"Error saat prediksi: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-batch")
def predict_batch(input_data: BatchInput):
    if model is None:
        raise HTTPException(
            status_code=500, detail="Model belum dimuat di server.")

    texts = input_data.texts
    results = []

    # Preprocessing semua teks dalam list
    cleaned_texts = [bersih_bersih(t) for t in texts]

    try:
        # Buat DataFrame sekaligus (Batch processing)
        input_df = pd.DataFrame({'Teks Bersih': cleaned_texts})

        # Prediksi sekaligus
        predictions = model.predict(input_df)

        label_map = {0: "Normal", 1: "Penipuan/Fraud", 2: "Promo"}

        # Format output agar sesuai dengan tabel Frontend
        for i, raw_text in enumerate(texts):
            pred_label = label_map.get(int(predictions[i]), "Unknown")
            results.append({
                "Teks Asli": raw_text,
                "Prediksi": pred_label
            })

        return results

    except Exception as e:
        print(f"Batch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Host 0.0.0.0 penting untuk beberapa deployment container, tapi di Vercel ini di-handle entrypoint lain
    uvicorn.run(app, host="0.0.0.0", port=8000)
