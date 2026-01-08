import { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Send, AlertTriangle, CheckCircle, Megaphone, Loader2, MessageSquare,
  Upload, FileText, Activity, BarChart2, Brain, Trash2
} from 'lucide-react';

function App() {
  // --- STATE BAGIAN KIRI: SMS DETECTOR (API) ---
  const [inputText, setInputText] = useState('');
  const [smsResult, setSmsResult] = useState(null);
  const [loadingSms, setLoadingSms] = useState(false);
  const [errorSms, setErrorSms] = useState('');

  // --- STATE BAGIAN KANAN: FILE UPLOAD (DASHBOARD) ---
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [dataStats, setDataStats] = useState({ rows: 0, cols: 0 });

  // ==========================================
  // LOGIKA 1: SMS DETECTOR (LEFT COLUMN)
  // ==========================================
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoadingSms(true);
    setSmsResult(null);
    setErrorSms('');

    try {
      // Mengirim request ke Backend FastAPI
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        text: inputText
      });
      setSmsResult(response.data);
    } catch (err) {
      console.error(err);
      setErrorSms('Gagal menghubungi server. Pastikan backend sudah jalan!');
    } finally {
      setLoadingSms(false);
    }
  };

  const getResultStyle = (label) => {
    switch (label) {
      case 'Normal':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-10 h-10 text-green-600 mb-2" />,
          title: 'SMS AMAN (Normal)'
        };
      case 'Penipuan/Fraud':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="w-10 h-10 text-red-600 mb-2" />,
          title: 'BAHAYA! (Penipuan/Spam)'
        };
      case 'Promo':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Megaphone className="w-10 h-10 text-yellow-600 mb-2" />,
          title: 'Iklan / Promo'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <MessageSquare className="w-10 h-10 text-gray-600" />,
          title: 'Tidak Diketahui'
        };
    }
  };

  // ==========================================
  // LOGIKA 2: FILE UPLOAD (RIGHT COLUMN)
  // ==========================================
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 1. BERSIHKAN MEMORI DULU (Supaya tidak Crash/Memory Leak)
    setTableData([]);
    setTableHeaders([]);
    setDataStats({ rows: 0, cols: 0 });

    setFile(selectedFile);
    setIsProcessing(true);
    setShowDashboard(false);

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const fileInputElem = e.target; // Simpan referensi elemen input

    // Fungsi callback saat parsing selesai
    const onParseComplete = (data, headers) => {
      setTableData(data);
      setTableHeaders(headers);
      setDataStats({ rows: data.length, cols: headers.length });
      setIsProcessing(false);
      setShowDashboard(true);

      // 2. RESET INPUT VALUE (Penting agar bisa upload file yang sama lagi tanpa error)
      fileInputElem.value = "";
    };

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.meta.fields || Object.keys(results.data[0]);
            // Beri jeda sedikit agar UI rendering lancar
            setTimeout(() => onParseComplete(results.data, headers), 500);
          } else {
            setIsProcessing(false);
            alert("File CSV kosong atau format salah!");
            fileInputElem.value = "";
          }
        },
        error: (error) => {
          console.error(error);
          setIsProcessing(false);
          fileInputElem.value = "";
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const parsedData = XLSX.utils.sheet_to_json(ws);

          if (parsedData.length > 0) {
            const headers = Object.keys(parsedData[0]);
            setTimeout(() => onParseComplete(parsedData, headers), 500);
          } else {
            setIsProcessing(false);
            alert("File Excel kosong!");
            fileInputElem.value = "";
          }
        } catch (err) {
          console.error(err);
          setIsProcessing(false);
          alert("Gagal membaca file Excel.");
          fileInputElem.value = "";
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      alert("Format file tidak didukung!");
      setIsProcessing(false);
      fileInputElem.value = "";
    }
  };

  const handleResetDashboard = () => {
    setShowDashboard(false);
    setTableData([]);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">SMS Guard & Miner</h1>
            <p className="text-xs text-gray-500">Spam Detection & Data Analysis</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Kelompok 3 - IF UTY
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Pilih Metode <span className="text-indigo-600">Analisis</span>
          </h2>
          <p className="text-gray-500">Gunakan input manual untuk cek SMS cepat, atau upload file untuk analisis massal.</p>
        </div>

        {/* --- GRID DUA KOLOM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-16">

          {/* =======================
              KOLOM KIRI: SMS API 
             ======================= */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Cek SMS (Live API)</h3>
            </div>

            <form onSubmit={handlePredict} className="flex-1 flex flex-col">
              <textarea
                className="w-full h-40 p-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-700 mb-4 transition"
                placeholder="Tempel isi SMS di sini (Contoh: Selamat anda menang 100jt...)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>

              <button
                type="submit"
                disabled={loadingSms || !inputText}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSms ? (
                  <> <Loader2 className="w-5 h-5 animate-spin" /> Menganalisis... </>
                ) : (
                  <> <Send className="w-5 h-5" /> Cek SMS Sekarang </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {errorSms && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-pulse">
                {errorSms}
              </div>
            )}

            {/* HASIL PREDIKSI (Card Muncul di Bawah Tombol) */}
            {smsResult && (
              <div className={`mt-6 p-6 rounded-xl border-2 text-center animate-fade-in ${getResultStyle(smsResult.label).color}`}>
                <div className="flex justify-center">
                  {getResultStyle(smsResult.label).icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{getResultStyle(smsResult.label).title}</h3>
                <p className="text-sm opacity-90">
                  Kategori: <strong>{smsResult.label}</strong>
                  {smsResult.confidence && <span className="block text-xs mt-1">(Confidence: {smsResult.confidence})</span>}
                </p>

                <div className="mt-4 pt-3 border-t border-black/10 text-xs text-left">
                  <p className="truncate"><strong>Asli:</strong> {smsResult.text}</p>
                  <p className="mt-1 truncate"><strong>Bersih:</strong> {smsResult.cleaned_text}</p>
                </div>
              </div>
            )}
          </div>

          {/* ============================
              KOLOM KANAN: FILE UPLOAD
             ============================ */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Upload Dataset (Batch)</h3>
            </div>

            <label className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors group relative overflow-hidden">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                ) : (
                  <Upload className="w-12 h-12 text-indigo-400 mb-3 group-hover:text-indigo-600 transition" />
                )}
                <p className="mb-1 text-sm text-gray-600 font-semibold group-hover:text-indigo-600 transition-colors">
                  {isProcessing ? 'Sedang Memproses...' : 'Klik atau Drag File CSV / Excel'}
                </p>
                <p className="text-xs text-gray-400">Max size 10MB</p>
              </div>
              <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} />
            </label>

            <div className="mt-4 text-xs text-gray-400 flex justify-between">
              <span>Supported: .csv, .xlsx</span>
              <span>Auto-detect Header</span>
            </div>
          </div>

        </div>

        {/* --- DASHBOARD RESULT (Muncul di bawah jika File di Upload) --- */}
        {showDashboard && (
          <div className="animate-fade-in-up space-y-8 border-t border-gray-200 pt-10">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Hasil Analisis Dataset</h3>
              <button
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition"
                onClick={handleResetDashboard}
              >
                <Trash2 className="w-4 h-4" /> Reset / Hapus Data
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama File</p>
                  <p className="font-bold text-gray-800 truncate max-w-[150px]">{file?.name}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Data</p>
                  <p className="font-bold text-gray-800 text-2xl">{dataStats.rows}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Akurasi Model (Est)</p>
                  <p className="font-bold text-gray-800 text-2xl">92.4%</p>
                </div>
              </div>
            </div>

            {/* VISUALISASI & TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-500" /> Visualisasi Distribusi
                </h4>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">Grafik Distribusi Data Akan Muncul Disini</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-4">Filter & Export</h4>
                <div className="space-y-3">
                  <button className="w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 text-gray-600 transition">Filter: Positif Saja</button>
                  <button className="w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 text-gray-600 transition">Filter: Negatif Saja</button>
                  <button className="w-full bg-indigo-600 py-2 rounded-lg text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Download Report CSV</button>
                </div>
              </div>
            </div>

            {/* TABLE PREVIEW */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm uppercase">Data Preview</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      {tableHeaders.map((h, i) => <th key={i} className="px-6 py-3 whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="bg-white border-b hover:bg-gray-50">
                        {tableHeaders.map((h, j) => (
                          <td key={j} className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                            {row[h] !== undefined ? row[h].toString() : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;