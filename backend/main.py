import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import re
# import spacy <-- SUDAH DIHAPUS
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# --- 1. SETUP PATH & LOGGING (KHUSUS VERCEL) ---
# Ini wajib agar file .pkl bisa ditemukan di server Vercel
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "sms_spam_detection_model.pkl")

# --- 2. DEFINISI STOPWORDS MANUAL (PENGGANTI SPACY) ---
# Kita gunakan set manual ini agar tidak perlu install spacy yang ukurannya > 100MB
STOP_WORDS = set([
    'ada', 'adalah', 'adanya', 'adapun', 'agak', 'agaknya', 'agar', 'akan', 'akankah', 'akhir',
    'akhiri', 'akhirnya', 'aku', 'akulah', 'amat', 'amatlah', 'anda', 'andalah', 'antar', 'antara',
    'antaranya', 'apa', 'apaan', 'apabila', 'apakah', 'apalagi', 'apatah', 'artinya', 'asal', 'asalkan',
    'atas', 'atau', 'ataukah', 'ataupun', 'awal', 'awalnya', 'bagai', 'bagaikan', 'bagaimana', 'bagaimanakah',
    'bagaimanapun', 'bagi', 'bagian', 'bahkan', 'bahwa', 'bahwasanya', 'baik', 'bakal', 'bakalan', 'balik',
    'banyak', 'bapak', 'baru', 'bawah', 'beberapa', 'begini', 'beginian', 'beginikah', 'beginilah', 'begitu',
    'begitukah', 'begitulah', 'begitupun', 'bekerja', 'belakang', 'belakangan', 'belum', 'belumlah', 'benar',
    'benarkah', 'benarlah', 'berada', 'berakhir', 'berakhirlah', 'berakhirnya', 'berapa', 'berapakah', 'berapalah',
    'berapapun', 'berarti', 'berawal', 'berbagai', 'berdatangan', 'beri', 'berikan', 'berikut', 'berikutnya',
    'berjumlah', 'berkali-kali', 'berkata', 'berkehendak', 'berkeinginan', 'berkenaan', 'berlainan', 'berlalu',
    'berlangsung', 'berlebihan', 'bermacam', 'bermacam-macam', 'bermaksud', 'bermula', 'bersama', 'bersama-sama',
    'bersiap', 'bersiap-siap', 'bertanya', 'bertanya-tanya', 'berturut', 'berturut-turut', 'bertutur', 'berujar',
    'berupa', 'besar', 'betul', 'betulkah', 'biasa', 'biasanya', 'bila', 'bilakah', 'bisa', 'bisakah', 'boleh',
    'bolehkah', 'bolehlah', 'buat', 'bukan', 'bukankah', 'bukanlah', 'bukannya', 'bulan', 'bung', 'cara',
    'caranya', 'cukup', 'cukupkah', 'cukuplah', 'cuma', 'dahulu', 'dalam', 'dan', 'dapat', 'dari', 'daripada',
    'datang', 'dekat', 'demi', 'demikian', 'demikianlah', 'dengan', 'depan', 'di', 'dia', 'diakhiri', 'diakhirinya',
    'dialah', 'diantara', 'diantaranya', 'diberi', 'diberikan', 'diberikannya', 'dibuat', 'dibuatnya', 'didapat',
    'didatangkan', 'digunakan', 'diibaratkan', 'diinginkan', 'diingat', 'diingatkan', 'diinginkan', 'dijawab',
    'dijelaskan', 'dijelaskannya', 'dikarenakan', 'dikatakan', 'dikatakannya', 'dikerjakan', 'diketahui',
    'diketahuinya', 'dikira', 'dilakukan', 'dilalui', 'dilihat', 'dimaksud', 'dimaksudkan', 'dimaksudkannya',
    'dimana', 'dimanakah', 'dimana', 'dini', 'dipastikan', 'diperbuat', 'diperbuatnya', 'dipergunakan',
    'diperkirakan', 'diperlihatkan', 'diperlukan', 'diperlukannya', 'dipersoalkan', 'dipertanyakan', 'dipunyai',
    'diri', 'dirinya', 'disampaikan', 'disebut', 'disebutkan', 'disebutkannya', 'disini', 'disinilah', 'ditambahkan',
    'ditandaskan', 'ditanya', 'ditanyai', 'ditanyakan', 'ditegaskan', 'ditujukan', 'ditunjuk', 'ditunjuki', 'doang',
    'dong', 'dulu', 'empat', 'enggak', 'enggaknya', 'entah', 'entahlah', 'guna', 'gunakan', 'hal', 'hampir',
    'hanya', 'hanyalah', 'hari', 'harus', 'haruslah', 'harusnya', 'hendak', 'hendaklah', 'hendaknya', 'hingga',
    'ia', 'ialah', 'ibarat', 'ibaratkan', 'ibaratnya', 'ibu', 'ikut', 'ingat', 'ingat-ingat', 'ingin', 'inkah',
    'ini', 'inikah', 'inilah', 'itu', 'itukah', 'itulah', 'jadi', 'jadilah', 'jadinya', 'jangan', 'jangankan',
    'janganlah', 'jauh', 'jawab', 'jawaban', 'jawabnya', 'jelas', 'jelaskan', 'jelaslah', 'jelasnya', 'jika',
    'jikalau', 'juga', 'jumlah', 'jumlahnya', 'justru', 'kala', 'kalau', 'kalaulah', 'kalaupun', 'kalian', 'kami',
    'kamilah', 'kamu', 'kamulah', 'kan', 'kapan', 'kapankah', 'kapanpun', 'karena', 'karenanya', 'kasus', 'kata',
    'katakan', 'katanya', 'ke', 'keadaan', 'kebetulan', 'kecil', 'kedua', 'keduanya', 'keinginan', 'kelamaan',
    'kelihatan', 'kelihatannya', 'kelima', 'keluar', 'kembali', 'kemudian', 'kemungkinan', 'kemungkinannya',
    'kenapa', 'kepada', 'kepadanya', 'kesampaian', 'keseluruhan', 'keseluruhannya', 'keterlaluan', 'ketika',
    'khususnya', 'kini', 'kinilah', 'kira', 'kira-kira', 'kiranya', 'kita', 'kitalah', 'kok', 'kurang', 'lagi',
    'lagian', 'lah', 'lain', 'lainnya', 'lalu', 'lama', 'lamanya', 'lanjut', 'lanjutnya', 'lebih', 'lewat',
    'lima', 'luar', 'macam', 'maka', 'makanya', 'makin', 'malah', 'malahan', 'mampu', 'mampukah', 'mana',
    'manakala', 'manalagi', 'masa', 'masalah', 'masalahnya', 'masih', 'masihkah', 'masing', 'masing-masing',
    'mau', 'maupun', 'melainkan', 'melakukan', 'melalui', 'melihat', 'melihatnya', 'memang', 'memastikan',
    'memberi', 'memberikan', 'membuat', 'memerlukan', 'memihak', 'meminta', 'memintakan', 'memisalkan',
    'memperbuat', 'mempergunakan', 'memperkirakan', 'memperlihatkan', 'mempersiapkan', 'mempersoalkan',
    'mempertanyakan', 'mempunyai', 'memulai', 'memungkinkan', 'menaiki', 'menambahkan', 'menandaskan',
    'menanti', 'menanti-nanti', 'menantikan', 'menanya', 'menanyai', 'menanyakan', 'mendapat', 'mendapatkan',
    'mendatang', 'mendatangi', 'mendatangkan', 'menegaskan', 'mengakhiri', 'mengapa', 'mengatakan', 'mengatakannya',
    'mengenai', 'mengerjakan', 'mengetahui', 'menggunakan', 'menghendaki', 'mengibaratkan', 'mengibaratkannya',
    'mengingat', 'mengingatkan', 'menginginkan', 'mengira', 'mengucapkan', 'mengucapkannya', 'mengungkapkan',
    'menjadi', 'menjawab', 'menjelaskan', 'menuju', 'menunjuk', 'menunjuki', 'menunjukkan', 'menunjuknya',
    'menurut', 'menuturkan', 'menyampaikan', 'menyangkut', 'menyatakan', 'menyebutkan', 'menyeluruh', 'menyiapkan',
    'merasa', 'mereka', 'merekalah', 'merupakan', 'meski', 'meskipun', 'meyakini', 'meyakinkan', 'minta', 'mirip',
    'misal', 'misalkan', 'misalnya', 'mula', 'mulai', 'mulailah', 'mulanya', 'mungkin', 'mungkinkah', 'nah', 'naik',
    'namun', 'nanti', 'nantinya', 'nyaris', 'nyatanya', 'oleh', 'olehnya', 'pada', 'padahal', 'padanya', 'pak',
    'paling', 'panjang', 'pantas', 'para', 'pasti', 'pastilah', 'penting', 'pentingnya', 'per', 'percuma', 'perlu',
    'perlukah', 'perlunya', 'pernah', 'persoalan', 'pertama', 'pertama-tama', 'pertanyaan', 'pertanyakan', 'pihak',
    'pihaknya', 'pukul', 'pula', 'pun', 'punya', 'rasa', 'rasanya', 'rupanya', 'saat', 'saatnya', 'saja', 'sajalah',
    'saling', 'sama', 'sama-sama', 'sambil', 'sampai', 'sampai-sampai', 'sampaikan', 'sana', 'sangat', 'sangatlah',
    'satu', 'saya', 'sayalah', 'se', 'sebab', 'sebabnya', 'sebagai', 'sebagaimana', 'sebagainya', 'sebagian',
    'sebaik', 'sebaik-baiknya', 'sebaiknya', 'sebaliknya', 'sebanyak', 'sebegini', 'sebegitu', 'sebelum', 'sebelumnya',
    'sebenarnya', 'seberapa', 'sebesar', 'sebetulnya', 'sebisanya', 'sebuah', 'secara', 'sedang', 'sedangkan',
    'sedikit', 'sedikitnya', 'seenaknya', 'segala', 'segalanya', 'segera', 'seharus', 'seharusnya', 'sehinga',
    'sehingga', 'sejak', 'sejenak', 'sekali', 'sekalian', 'sekalipun', 'sesekali', 'sekaligus', 'sekarang',
    'sekarang', 'sekitar', 'sekitarnya', 'sela', 'selain', 'selalu', 'selama', 'selama-lamanya', 'selamanya',
    'selanjutnya', 'seluruh', 'seluruhnya', 'semacam', 'semakin', 'mampu', 'sementara', 'sempat', 'semua',
    'semuanya', 'semula', 'sendiri', 'sendirinya', 'seolah', 'seolah-olah', 'seorang', 'sepanjang', 'sepantasnya',
    'sepantasnyalah', 'seperlunya', 'seperti', 'sepertinya', 'sepihak', 'sering', 'seringnya', 'serta', 'serupa',
    'sesaat', 'sesama', 'sesampai', 'sesegera', 'sesekali', 'seseorang', 'sesuatu', 'sesuatunya', 'sesudah',
    'sesudahnya', 'setelah', 'setempat', 'setengah', 'seterusnya', 'setiap', 'setiba', 'setibanya', 'setidak-tidaknya',
    'setidaknya', 'setinggi', 'seusai', 'sewaktu', 'siap', 'siapa', 'siapakah', 'siapapun', 'sini', 'sinilah',
    'soal', 'soalnya', 'suatu', 'sudah', 'sudahkah', 'sudahlah', 'supaya', 'tadi', 'tadinya', 'tahu', 'tak',
    'tambah', 'tambahnya', 'tampak', 'tampaknya', 'tandas', 'tandasnya', 'tanpa', 'tanya', 'tanyakan', 'tanyanya',
    'tapi', 'tegas', 'tegasnya', 'telah', 'tempat', 'tengah', 'tentang', 'tentu', 'tentulah', 'tentunya', 'tepat',
    'terakhir', 'terasa', 'terbanyak', 'terdahulu', 'terdapat', 'terdiri', 'terhadap', 'terhadapnya', 'teringat',
    'teringat-ingat', 'terjadi', 'terjadilah', 'terjadinya', 'terkira', 'terlalu', 'terlebih', 'terlihat',
    'termasuk', 'ternyata', 'tersampaikan', 'tersebut', 'tersebutlah', 'tertentu', 'tertuju', 'terus', 'terutama',
    'tetap', 'tetapi', 'tiap', 'tiap-tiap', 'tidak', 'tidakkah', 'tidaklah', 'tiga', 'tinggi', 'toh', 'tunjuk',
    'turut', 'tutur', 'tuturnya', 'ucap', 'ucapnya', 'ujar', 'ujarnya', 'umum', 'umumnya', 'ungkap', 'ungkapnya',
    'untuk', 'usah', 'usai', 'waduh', 'wah', 'wahai', 'waktunya', 'walau', 'walaupun', 'wong', 'yaitu', 'yakin',
    'yakni', 'yang'
])

# Menambahkan slang words kustom kamu
STOP_WORDS.update(['yg', 'jg', 'teh', 'mah', 'da', 'atuh', 'jd', 'km', 'ak', 'lg', 'ya', 'ga', 'ngga', 'nggak', 'gak', 'tp',
                   'kalo', 'nya', 'pake', 'liat', 'udh', 'aja', 'wkwk', 'wkwkwk', 'wk', 'gt', 'gais', 'blm', 'sih', 'tau',
                   'tahu', 'gt', 'udah', 'utk', 'rb', 'rp', 'dgn', 'ayo', 'isi', 'biar', 'yah', 'dr', 'bawa', 'gitu', 'eh',
                   'pas', 'td', 'sm', 'pengen', 'pgn', 'dpt', 'sd', 'byr', 'min', 'dscn', 'sy', 'no'])

# --- 3. DEFINISI FUNGSI CUSTOM ---


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


# --- 4. LOAD MODEL & APP ---
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

# --- 5. SCHEMAS (Input Model) ---


class SMSInput(BaseModel):
    text: str


class BatchInput(BaseModel):
    texts: List[str]

# --- 6. ENDPOINTS ---


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
