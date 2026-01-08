import React, { useState } from 'react';
import { Upload, FileText, BarChart2, CheckCircle, Download, Database, AlertCircle } from 'lucide-react';

// --- IMPORT LIBRARY BARU ---
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const DataMiningDashboard = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    // --- STATE BARU UNTUK MENYIMPAN DATA ---
    const [tableData, setTableData] = useState([]);     // Isi data (baris)
    const [tableHeaders, setTableHeaders] = useState([]); // Nama kolom (header)
    const [dataStats, setDataStats] = useState({ rows: 0, cols: 0 }); // Statistik data

    // --- FUNGSI PROSES FILE (LOGIKA UTAMA) ---
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);

        // Cek tipe file (CSV atau Excel)
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            // PROSES CSV
            Papa.parse(selectedFile, {
                header: true, // Baris pertama dianggap header
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data;
                    const headers = Object.keys(parsedData[0]);

                    updateDataState(parsedData, headers);
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                    setIsProcessing(false);
                }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            // PROSES EXCEL
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });

                // Ambil sheet pertama saja
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Convert ke JSON
                const parsedData = XLSX.utils.sheet_to_json(ws);

                if (parsedData.length > 0) {
                    const headers = Object.keys(parsedData[0]);
                    updateDataState(parsedData, headers);
                }
            };
            reader.readAsBinaryString(selectedFile);
        } else {
            alert("Format file tidak didukung! Gunakan CSV atau Excel.");
            setIsProcessing(false);
        }
    };

    // Fungsi Helper untuk Update State & Animasi Loading
    const updateDataState = (data, headers) => {
        // Simulasi delay sedikit biar terlihat 'mikir' (UX)
        setTimeout(() => {
            setTableData(data);
            setTableHeaders(headers);
            setDataStats({
                rows: data.length,
                cols: headers.length
            });
            setIsProcessing(false);
            setShowDashboard(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* ... (NAVBAR SAMA SEPERTI SEBELUMNYA) ... */}

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* ... (HERO SECTION SAMA SEPERTI SEBELUMNYA) ... */}

                {/* --- UPLOAD SECTION (SAMA, TAPI INPUT SUDAH TERHUBUNG) --- */}
                {!showDashboard && (
                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all hover:shadow-2xl">
                        {/* ... (UI UPLOAD SAMA) ... */}
                        <input id="file-upload" type="file" className="hidden"
                            accept=".csv, .xlsx, .xls" // Batasi tipe file di sistem
                            onChange={handleFileUpload}
                        />
                        {/* ... */}
                    </div>
                )}

                {showDashboard && (
                    <div className="animate-fade-in-up space-y-8">

                        {/* --- 1. STATS CARDS (DINAMIS) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card Nama File */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FileText size={24} /></div>
                                    <div>
                                        <p className="text-sm text-gray-500">Nama File</p>
                                        <p className="font-bold text-gray-800 truncate max-w-[150px]">{file?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Total Data (NYATA) */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Database size={24} /></div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Data</p>
                                        <p className="font-bold text-gray-800">{dataStats.rows} Baris</p>
                                        <p className="text-xs text-gray-400">{dataStats.cols} Kolom Terdeteksi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Placeholder Akurasi */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                {/* ... (Sama seperti sebelumnya atau biarkan dummy dulu sampai proses mining berjalan) ... */}
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><BarChart2 size={24} /></div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status Data</p>
                                        <p className="font-bold text-gray-800">Ready to Process</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ... (SECTION TENGAH: CHART & CONFIG BISA DIBIARKAN SAMA DULU) ... */}

                        {/* --- 3. DATA PREVIEW TABLE (DINAMIS - INI YG PENTING) --- */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Data Preview (5 Baris Pertama)</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Menampilkan 5 dari {dataStats.rows} data
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            {/* Render Header Secara Dinamis */}
                                            {tableHeaders.map((header, index) => (
                                                <th key={index} className="px-6 py-3 whitespace-nowrap">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Render 5 Baris Data Pertama Saja */}
                                        {tableData.slice(0, 5).map((row, rowIndex) => (
                                            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                                                {tableHeaders.map((header, colIndex) => (
                                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                                        {/* Tampilkan isi data, jika kosong beri tanda strip */}
                                                        {row[header] !== undefined && row[header] !== null ? row[header].toString() : "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Fallback jika data kosong */}
                                {tableData.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">
                                        Tidak ada data yang dapat ditampilkan.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default DataMiningDashboard;