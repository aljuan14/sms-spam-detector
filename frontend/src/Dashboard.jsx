import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- IKON SVG MANUAL (Tetap kita pakai biar aman) ---
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const IconText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IconPlay = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconBrain = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
const IconChart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);

const DataMiningDashboard = () => {
    // State untuk File Upload
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [dataStats, setDataStats] = useState({ rows: 0, cols: 0 });

    // State untuk Manual Text Input
    const [manualText, setManualText] = useState("");
    const [manualResult, setManualResult] = useState(null);

    // --- LOGIKA 1: MANUAL TEXT ANALYSIS ---
    const handleManualAnalyze = () => {
        if (!manualText.trim()) return;

        // Simulasi pemrosesan (bisa diganti API nanti)
        const sentiment = manualText.length > 20 ? "Positif" : "Negatif"; // Logika dummy
        setManualResult(sentiment);
    };

    // --- LOGIKA 2: FILE UPLOAD ---
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);
        setManualResult(null); // Reset hasil manual jika upload file

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    updateDataState(results.data, Object.keys(results.data[0]));
                },
                error: (error) => { console.error(error); setIsProcessing(false); }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const parsedData = XLSX.utils.sheet_to_json(ws);
                if (parsedData.length > 0) {
                    updateDataState(parsedData, Object.keys(parsedData[0]));
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const updateDataState = (data, headers) => {
        setTimeout(() => {
            setTableData(data);
            setTableHeaders(headers);
            setDataStats({ rows: data.length, cols: headers.length });
            setIsProcessing(false);
            setShowDashboard(true);
            // Scroll ke bawah otomatis nanti
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">

            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white"><IconText /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">TextMiner</h1>
                        <p className="text-xs text-gray-500">Sentiment & NLP Analysis</p>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Kelompok 3 - IF UTY
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* HEADER TEXT */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        Pilih Metode <span className="text-indigo-600">Analisis</span>
                    </h2>
                    <p className="text-gray-500">Gunakan input manual untuk cek cepat, atau upload file untuk data besar.</p>
                </div>

                {/* --- DUAL INPUT SECTION (KIRI vs KANAN) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-16">

                    {/* KIRI: MANUAL INPUT */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                                <IconText />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Cek Sentimen Instan</h3>
                        </div>

                        <textarea
                            className="w-full h-40 p-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-700 mb-4"
                            placeholder="Ketik kalimat di sini... (Contoh: Pelayanan hari ini sangat memuaskan!)"
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                        ></textarea>

                        <div className="flex justify-between items-center mt-auto">
                            {manualResult && (
                                <div className={`px-4 py-2 rounded-lg font-bold ${manualResult === 'Positif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Hasil: {manualResult}
                                </div>
                            )}
                            <button
                                onClick={handleManualAnalyze}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md ml-auto"
                            >
                                <IconPlay /> Analisis Teks
                            </button>
                        </div>
                    </div>

                    {/* KANAN: FILE UPLOAD */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <IconBrain />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Upload Dataset (Batch)</h3>
                        </div>

                        <label className="flex-1 flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors group relative overflow-hidden">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                                ) : (
                                    <IconUpload />
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
                            <button className="text-sm text-red-500 hover:text-red-700 font-medium" onClick={() => setShowDashboard(false)}>
                                Reset / Hapus Data
                            </button>
                        </div>

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Nama File</p>
                                <p className="font-bold text-gray-800 truncate">{file?.name}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Total Data</p>
                                <p className="font-bold text-indigo-600 text-2xl">{dataStats.rows}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Akurasi Model (Est)</p>
                                <p className="font-bold text-green-600 text-2xl">92.4%</p>
                            </div>
                        </div>

                        {/* VISUALISASI & CONFIG */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h4 className="font-bold text-gray-800 mb-4">Word Cloud & Visualisasi</h4>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">Grafik Distribusi Sentimen Akan Muncul Disini</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h4 className="font-bold text-gray-800 mb-4">Filter & Export</h4>
                                <div className="space-y-3">
                                    <button className="w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 text-gray-600">Filter: Positif Saja</button>
                                    <button className="w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 text-gray-600">Filter: Negatif Saja</button>
                                    <button className="w-full bg-indigo-600 py-2 rounded-lg text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">Download Report CSV</button>
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
};

export default DataMiningDashboard;