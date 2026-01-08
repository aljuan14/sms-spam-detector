import { useState } from 'react';
import axios from 'axios';
import { Send, AlertTriangle, CheckCircle, Megaphone, Loader2, MessageSquare } from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      // Mengirim request ke Backend FastAPI
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        text: inputText
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server. Pastikan backend sudah jalan!');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menentukan warna dan ikon berdasarkan hasil label
  const getResultStyle = (label) => {
    switch (label) {
      case 'Normal':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-12 h-12 text-green-600 mb-2" />,
          title: 'SMS AMAN (Normal)'
        };
      case 'Penipuan/Fraud':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="w-12 h-12 text-red-600 mb-2" />,
          title: 'BAHAYA! (Penipuan/Spam)'
        };
      case 'Promo':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Megaphone className="w-12 h-12 text-yellow-600 mb-2" />,
          title: 'Iklan / Promo'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <MessageSquare className="w-12 h-12 text-gray-600" />,
          title: 'Tidak Diketahui'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6" /> SMS Detector
          </h1>
          <p className="text-indigo-200 text-sm mt-1">Cek apakah SMS kamu penipuan atau bukan</p>
        </div>

        <div className="p-6">
          {/* Form Input */}
          <form onSubmit={handlePredict}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempel isi SMS di sini:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-32 resize-none"
              placeholder="Contoh: Selamat anda menang undian 100jt..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            <button
              type="submit"
              disabled={loading || !inputText}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Menganalisis...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" /> Cek SMS Sekarang
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          {/* Result Area */}
          {result && (
            <div className={`mt-6 p-6 rounded-xl border-2 text-center animate-fade-in ${getResultStyle(result.label).color}`}>
              <div className="flex justify-center">
                {getResultStyle(result.label).icon}
              </div>
              <h3 className="text-xl font-bold mb-1">{getResultStyle(result.label).title}</h3>
              <p className="text-sm opacity-80">
                Model memprediksi ini sebagai kategori <strong>{result.label}</strong>
              </p>

              <div className="mt-4 pt-4 border-t border-black/10 text-xs text-left">
                <p><strong>Teks Asli:</strong> {result.text}</p>
                <p className="mt-1"><strong>Setelah Dibersihkan:</strong> {result.cleaned_text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;