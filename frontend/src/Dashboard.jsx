import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- IKON KHUSUS TEXT MINING (SVG Manual) ---
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const IconText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IconBrain = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
const IconChart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const IconDownload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);

const DataMiningDashboard = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    // State Data
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [dataStats, setDataStats] = useState({ rows: 0, cols: 0 });

    // --- LOGIKA UPLOAD ---
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data;
                    const headers = Object.keys(parsedData[0]);
                    updateDataState(parsedData, headers);
                },
                error: (error) => {
                    console.error("Error CSV:", error);
                    setIsProcessing(false);
                }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const parsedData = XLSX.utils.sheet_to_json(ws);

                if (parsedData.length > 0) {
                    const headers = Object.keys(parsedData[0]);
                    updateDataState(parsedData, headers);
                }
            };
            reader.readAsBinaryString(selectedFile);
        } else {
            alert("Format salah! Pakai CSV atau Excel.");
            setIsProcessing(false);
        }
    };

    const updateDataState = (data, headers) => {
        setTimeout(() => {
            setTableData(data);
            setTableHeaders(headers);
            setDataStats({ rows: data.length, cols: headers.length });
            setIsProcessing(false);
            setShowDashboard(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    {/* Ganti Icon jadi Chat/Text */}
                    <div className="bg-indigo-600 p-2 rounded-lg text-white"><IconText /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">TextMiner</h1>
                        <p className="text-xs text-gray-500">Sentiment Analysis & NLP System</p>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Kelompok 3 - IF UTY</div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* HERO TITLE - Diganti jadi Fokus Teks */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Analisis Teks & Sentimen <span className="text-indigo-600">Otomatis</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload dataset teks (komentar, review, tweet), lakukan preprocessing, dan klasifikasi sentimen dengan mudah.
                    </p>
                </div>

                {/* --- UPLOAD SECTION --- */}
                {!showDashboard && (
                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all hover:shadow-2xl">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                ) : (
                                    <IconUpload />
                                )}
                                <p className="mb-2 text-sm text-gray-600 font-semibold">
                                    {isProcessing ? 'Sedang Membaca Teks...' : 'Upload Dataset (CSV/Excel)'}
                                </p>
                                <p className="text-xs text-gray-400">Pastikan ada kolom teks/review</p>
                            </div>
                            <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} />
                        </label>
                    </div>
                )}

                {/* --- DASHBOARD RESULT --- */}
                {showDashboard && (
                    <div className="animate-fade-in-up space-y-8">

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><IconText /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Nama Dataset</p>
                                    <p className="font-bold text-gray-800 truncate max-w-[150px]">{file?.name}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><IconBrain /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Dokumen</p>
                                    <p className="font-bold text-gray-800">{dataStats.rows} Teks</p>
                                    <p className="text-xs text-gray-400">{dataStats.cols} Kolom Fitur</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><IconChart /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Model Status</p>
                                    <p className="font-bold text-gray-800">Siap Klasifikasi</p>
                                </div>
                            </div>
                        </div>

                        {/* MAIN AREA */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* VIZ PLACEHOLDER - Diganti jadi WordCloud */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="font-bold text-lg text-gray-800 mb-4">Analisis Kata (WordCloud)</h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">Visualisasi kata yang paling sering muncul akan tampil disini</p>
                                </div>
                            </div>

                            {/* CONFIG - Diganti istilah Preprocessing */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-4">Metode & Preprocessing</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Model Klasifikasi</label>
                                        <select className="w-full border p-2 rounded bg-gray-50">
                                            <option>Naive Bayes (Multinomial)</option>
                                            <option>Support Vector Machine (SVM)</option>
                                            <option>Logistic Regression</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Case Folding (Lowercase)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Stopword Removal (Sastrawi)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="checkbox" className="rounded text-indigo-600" /> Stemming
                                        </label>
                                    </div>

                                </div>
                                <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg">
                                    <IconBrain /> Mulai Training Model
                                </button>
                            </div>
                        </div>

                        {/* TABLE PREVIEW */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                                <h3 className="font-bold text-gray-800">Dataset Preview</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Top 5 Rows</span>
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