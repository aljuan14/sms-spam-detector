from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- WAJIB IMPORT INI
from pydantic import BaseModel
import joblib
import re
import spacy
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# --- 1. SETUP & DEFINISI FUNGSI ---

try:
    nlp = spacy.blank("id")
    STOP_WORDS = nlp.Defaults.stop_words
except Exception:
    STOP_WORDS = set()

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


# --- 2. LOAD MODEL & APP ---
app = FastAPI(title="SMS Spam Detector API")

# --- KONFIGURASI CORS (PENTING UNTUK MENGHUBUNGKAN FRONTEND) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua domain (termasuk localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua method (GET, POST, OPTIONS, dll)
    allow_headers=["*"],
)

try:
    model = joblib.load("sms_spam_detection_model.pkl")
    print("✅ Model berhasil dimuat!")
except Exception as e:
    print(f"❌ Error memuat model: {e}")


class SMSInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "SMS Spam Detector API is Running!"}


@app.post("/predict")
def predict_sms(input_data: SMSInput):
    raw_text = input_data.text
    cleaned_text = bersih_bersih(raw_text)

    try:
        input_df = pd.DataFrame({'Teks Bersih': [cleaned_text]})
        prediction = model.predict(input_df)[0]

        try:
            proba = model.predict_proba(input_df)
            confidence = np.max(proba) * 100
            print(
                f"DEBUG: Input='{cleaned_text}' | Pred={prediction} | Proba={proba}")
        except:
            confidence = 0
            print(f"DEBUG: Model tidak support predict_proba")

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
