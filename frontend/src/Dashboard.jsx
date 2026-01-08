import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- BAGIAN IKON MANUAL (ANTI-ERROR) ---
// Kita buat komponen ikon sendiri pakai SVG biasa biar tidak crash lagi
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const IconFile = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const IconDatabase = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
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

    // --- LOGIKA UPLOAD (SAMA SEPERTI SEBELUMNYA) ---
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
                    <div className="bg-blue-600 p-2 rounded-lg text-white"><IconDatabase /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">MiningLab</h1>
                        <p className="text-xs text-gray-500">Intelligent Data Analysis System</p>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Kelompok 3 - IF UTY</div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* HERO TITLE */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Analisis Data Mining <span className="text-blue-600">Tanpa Ribet</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload dataset CSV atau Excel kamu, pilih algoritma, dan biarkan sistem kami
                        melakukan klasifikasi otomatis.
                    </p>
                </div>

                {/* --- UPLOAD SECTION --- */}
                {!showDashboard && (
                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all hover:shadow-2xl">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                ) : (
                                    <IconUpload />
                                )}
                                <p className="mb-2 text-sm text-gray-600 font-semibold">
                                    {isProcessing ? 'Sedang Memproses...' : 'Klik untuk Upload CSV / Excel'}
                                </p>
                                <p className="text-xs text-gray-400">Max Size 10MB</p>
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
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><IconFile /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Nama File</p>
                                    <p className="font-bold text-gray-800 truncate max-w-[150px]">{file?.name}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><IconDatabase /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Data</p>
                                    <p className="font-bold text-gray-800">{dataStats.rows} Baris</p>
                                    <p className="text-xs text-gray-400">{dataStats.cols} Kolom</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><IconChart /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-bold text-gray-800">Ready</p>
                                </div>
                            </div>
                        </div>

                        {/* MAIN AREA */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* VIZ PLACEHOLDER */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="font-bold text-lg text-gray-800 mb-4">Visualisasi Data</h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">Grafik akan muncul disini</p>
                                </div>
                            </div>

                            {/* CONFIG */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-4">Konfigurasi</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Algoritma</label>
                                        <select className="w-full border p-2 rounded bg-gray-50">
                                            <option>Naive Bayes</option>
                                            <option>C4.5 Decision Tree</option>
                                            <option>K-NN</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg">
                                    <IconDownload /> Download Hasil
                                </button>
                            </div>
                        </div>

                        {/* TABLE PREVIEW */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                                <h3 className="font-bold text-gray-800">Data Preview (5 Baris)</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Row Count: {dataStats.rows}</span>
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
                                                    <td key={j} className="px-6 py-4 whitespace-nowrap">
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