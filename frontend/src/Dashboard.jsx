import React, { useState } from 'react';
// KITA MATIKAN SEMUA LIBRARY EKSTERNAL DULU
// import { Upload, FileText, BarChart2, CheckCircle, Download, Database } from 'lucide-react';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';

const DataMiningDashboard = () => {
    const [file, setFile] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-10">
            <div className="max-w-4xl mx-auto">

                {/* JUDUL TESTING */}
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    TESTING MODE: APAKAH TEKS INI MUNCUL?
                </h1>
                <p className="mb-8 text-lg">
                    Jika kamu bisa membaca ini, berarti React & Tailwind berjalan normal. Masalahnya ada di Library Ikon.
                </p>

                {/* KOTAK UPLOAD SIMPEL */}
                <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-500">
                    <h2 className="text-xl font-bold mb-4">Upload File Test</h2>

                    <div className="border-2 border-dashed border-gray-300 p-10 text-center rounded-lg bg-gray-50">
                        {/* GANTI ICON DENGAN TEKS BIASA */}
                        <div className="text-4xl mb-2">📂</div>
                        <p className="font-bold">Drag & Drop File Disini</p>
                        <p className="text-sm text-gray-500">Gunakan file CSV / Excel</p>

                        <input type="file" className="mt-4" />
                    </div>

                    <div className="mt-6 p-4 bg-green-100 rounded text-green-800">
                        <strong>Status:</strong> Siap Mencoba
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DataMiningDashboard;