import { useState, useMemo } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Send, AlertTriangle, CheckCircle, Megaphone, Loader2, MessageSquare,
  Upload, FileText, Activity, BarChart2, Brain, Trash2, RefreshCw, Download, Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

function App() {
  // --- STATE BAGIAN KIRI (API SINGLE) ---
  const [inputText, setInputText] = useState('');
  const [smsResult, setSmsResult] = useState(null);
  const [loadingSms, setLoadingSms] = useState(false);
  const [errorSms, setErrorSms] = useState('');

  // --- STATE BAGIAN KANAN (UPLOAD & BATCH) ---
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [dataStats, setDataStats] = useState({ rows: 0, cols: 0 });
  const [isTraining, setIsTraining] = useState(false);

  // [BARU] State untuk Filter
  const [filterType, setFilterType] = useState('All'); // 'All', 'Normal', 'Fraud', 'Promo'

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- LOGIKA CHART ---
  const chartData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    const labelKey = tableHeaders.find(h => ['prediksi', 'label', 'kategori'].includes(h.toLowerCase()));

    if (labelKey) {
      const counts = {};
      tableData.forEach(row => {
        const val = row[labelKey] || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }
    return [{ name: 'Menunggu Prediksi...', value: 1 }];
  }, [tableData, tableHeaders]);

  // [BARU] LOGIKA FILTER TABEL
  const filteredTableData = useMemo(() => {
    if (filterType === 'All') return tableData;

    // Asumsi nama kolom hasil prediksi adalah "Prediksi"
    return tableData.filter(row => {
      if (filterType === 'Fraud') return row['Prediksi'] === 'Penipuan/Fraud';
      if (filterType === 'Normal') return row['Prediksi'] === 'Normal';
      if (filterType === 'Promo') return row['Prediksi'] === 'Promo';
      return true;
    });
  }, [tableData, filterType]);

  // --- LOGIKA 1: PREDIKSI SATUAN ---
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoadingSms(true); setSmsResult(null); setErrorSms('');
    try {
      // [PERUBAHAN 1] Menggunakan Link Ngrok
      const response = await axios.post('https://dfa81c80d646.ngrok-free.app/predict', { text: inputText });
      setSmsResult(response.data);
    } catch (err) {
      console.error(err); setErrorSms('Gagal koneksi ke backend (Ngrok).');
    } finally { setLoadingSms(false); }
  };

  const getResultStyle = (label) => {
    switch (label) {
      case 'Normal': return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-10 h-10 text-green-600 mb-2" />, title: 'SMS AMAN (Normal)' };
      case 'Penipuan/Fraud': return { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-10 h-10 text-red-600 mb-2" />, title: 'BAHAYA! (Penipuan/Spam)' };
      case 'Promo': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Megaphone className="w-10 h-10 text-yellow-600 mb-2" />, title: 'Iklan / Promo' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <MessageSquare className="w-10 h-10 text-gray-600" />, title: 'Tidak Diketahui' };
    }
  };

  // --- LOGIKA 2: UPLOAD & BATCH ---
  const processBatchPrediction = async (data, originalHeaders) => {
    try {
      const firstHeader = originalHeaders[0];
      const textsToSend = data.map(row => row[firstHeader]);

      // [PERUBAHAN 2] Menggunakan Link Ngrok
      const response = await axios.post('https://dfa81c80d646.ngrok-free.app/predict-batch', { texts: textsToSend });

      const predictedData = response.data;
      const newHeaders = Object.keys(predictedData[0]);

      setTableData(predictedData);
      setTableHeaders(newHeaders);
      setDataStats({ rows: predictedData.length, cols: newHeaders.length });
    } catch (err) {
      console.error("Batch Predict Error:", err);
      alert("Gagal memproses prediksi batch. Pastikan backend Ngrok jalan.");
      setTableData(data); setTableHeaders(originalHeaders); setDataStats({ rows: data.length, cols: originalHeaders.length });
    } finally {
      setIsProcessing(false); setShowDashboard(true);
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setTableData([]); setTableHeaders([]); setDataStats({ rows: 0, cols: 0 }); setFilterType('All');
    setFile(selectedFile); setIsProcessing(true); setShowDashboard(false);

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const fileInputElem = e.target;

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.meta.fields || Object.keys(results.data[0]);
            processBatchPrediction(results.data, headers);
          } else { setIsProcessing(false); alert("File CSV kosong!"); }
          fileInputElem.value = "";
        },
        error: (error) => { console.error(error); setIsProcessing(false); fileInputElem.value = ""; }
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
            processBatchPrediction(parsedData, headers);
          } else { setIsProcessing(false); alert("File Excel kosong!"); }
        } catch (err) { console.error(err); setIsProcessing(false); alert("Gagal Excel."); }
        fileInputElem.value = "";
      };
      reader.readAsBinaryString(selectedFile);
    } else { alert("Format file tidak didukung!"); setIsProcessing(false); fileInputElem.value = ""; }
  };

  // [BARU] Fungsi Download CSV
  const handleDownloadCSV = () => {
    if (tableData.length === 0) return;
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hasil_prediksi_${file?.name || 'data'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDashboard = () => { setShowDashboard(false); setTableData([]); setFile(null); setFilterType('All'); };
  const handleTrainModel = () => { setIsTraining(true); setTimeout(() => { setIsTraining(false); alert("Fitur training belum terhubung."); }, 2000); };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><MessageSquare className="w-6 h-6" /></div>
          <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">SMS Guard & Miner</h1><p className="text-xs text-gray-500">Spam Detection & Data Analysis</p></div>
        </div>
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Kelompok 3 - IF UTY</div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Pilih Metode <span className="text-indigo-600">Analisis</span></h2>
          <p className="text-gray-500">Input manual untuk cek cepat, atau upload file untuk pelabelan otomatis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-16">
          {/* KIRI */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><FileText className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-gray-800">Cek SMS (Live API)</h3>
            </div>
            <form onSubmit={handlePredict} className="flex-1 flex flex-col">
              <textarea className="w-full h-40 p-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-700 mb-4 transition" placeholder="Tempel isi SMS di sini..." value={inputText} onChange={(e) => setInputText(e.target.value)}></textarea>
              <button type="submit" disabled={loadingSms || !inputText} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {loadingSms ? (<><Loader2 className="w-5 h-5 animate-spin" /> Menganalisis...</>) : (<><Send className="w-5 h-5" /> Cek SMS Sekarang</>)}
              </button>
            </form>
            {errorSms && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-pulse">{errorSms}</div>}
            {smsResult && (
              <div className={`mt-6 p-6 rounded-xl border-2 text-center animate-fade-in ${getResultStyle(smsResult.label).color}`}>
                <div className="flex justify-center">{getResultStyle(smsResult.label).icon}</div>
                <h3 className="text-lg font-bold mb-1">{getResultStyle(smsResult.label).title}</h3>
                <p className="text-sm opacity-90">Kategori: <strong>{smsResult.label}</strong></p>
                <div className="mt-4 pt-3 border-t border-black/10 text-xs text-left"><p className="truncate"><strong>Asli:</strong> {smsResult.text}</p></div>
              </div>
            )}
          </div>

          {/* KANAN */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Brain className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-gray-800">Upload Dataset (Auto Label)</h3>
            </div>
            <label className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors group relative overflow-hidden">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                {isProcessing ? (<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>) : (<Upload className="w-12 h-12 text-indigo-400 mb-3 group-hover:text-indigo-600 transition" />)}
                <p className="mb-1 text-sm text-gray-600 font-semibold group-hover:text-indigo-600 transition-colors">{isProcessing ? 'Sedang Melabeli Data...' : 'Klik atau Drag File CSV / Excel'}</p>
                <p className="text-xs text-gray-400">Max size 10MB</p>
              </div>
              <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} />
            </label>
          </div>
        </div>

        {/* --- DASHBOARD RESULT --- */}
        {showDashboard && (
          <div className="animate-fade-in-up space-y-8 border-t border-gray-200 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Hasil Analisis Dataset</h3>
              <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition" onClick={handleResetDashboard}><Trash2 className="w-4 h-4" /> Reset / Hapus Data</button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><FileText className="w-6 h-6" /></div>
                <div><p className="text-sm text-gray-500 mb-1">Nama File</p><p className="font-bold text-gray-800 truncate max-w-[150px]">{file?.name}</p></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full"><Activity className="w-6 h-6" /></div>
                <div><p className="text-sm text-gray-500 mb-1">Total Data</p><p className="font-bold text-gray-800 text-2xl">{dataStats.rows}</p></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Brain className="w-6 h-6" /></div>
                <div><p className="text-sm text-gray-500 mb-1">Status</p><p className="font-bold text-gray-800 text-2xl">Labeled</p></div>
              </div>
            </div>

            {/* VISUALISASI & ACTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> Visualisasi Distribusi Prediksi</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ACTIONS PANEL (SUDAH DIPERBAIKI) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Filter Data Tabel</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button onClick={() => setFilterType('All')} className={`flex-1 py-2 text-xs rounded-lg border ${filterType === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Semua</button>
                      <button onClick={() => setFilterType('Normal')} className={`flex-1 py-2 text-xs rounded-lg border ${filterType === 'Normal' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-50'}`}>Normal</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setFilterType('Fraud')} className={`flex-1 py-2 text-xs rounded-lg border ${filterType === 'Fraud' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-red-50'}`}>Penipuan</button>
                      <button onClick={() => setFilterType('Promo')} className={`flex-1 py-2 text-xs rounded-lg border ${filterType === 'Promo' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-yellow-50'}`}>Promo</button>
                    </div>
                  </div>

                  <button onClick={handleDownloadCSV} className="w-full mt-4 bg-indigo-600 py-2.5 rounded-lg text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download CSV
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm">Model Management</h4>
                  <button onClick={handleTrainModel} disabled={isTraining} className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2 transition">
                    {isTraining ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    {isTraining ? "Training..." : "Retrain Model"}
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE PREVIEW (TERHUBUNG KE FILTER) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex-none flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm uppercase">Data Preview ({filteredTableData.length} Baris)</h4>
                {filterType !== 'All' && <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Filter: {filterType}</span>}
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr>{tableHeaders.map((h, i) => <th key={i} className="px-6 py-3 whitespace-nowrap bg-gray-50">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTableData.map((row, i) => (
                      <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                        {tableHeaders.map((h, j) => (
                          <td key={j} className="px-6 py-3 whitespace-nowrap truncate max-w-xs">
                            {/* Highlight kolom Prediksi */}
                            {h === 'Prediksi' ? (
                              <span className={`px-2 py-1 rounded-md font-bold text-xs border
                                    ${row[h] === 'Normal' ? 'bg-green-50 text-green-700 border-green-200' :
                                  row[h] === 'Penipuan/Fraud' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                {row[h]}
                              </span>
                            ) : (row[h] !== undefined ? row[h].toString() : "-")}
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