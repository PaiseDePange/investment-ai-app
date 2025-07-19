'use client';

import React, { useState } from 'react';
import Disclaimer from '@/components/Disclaimer';


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/upload_excel', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (title: string, tableData: any[]) => {
    if (!tableData || tableData.length === 0) return null;
    const headers = Object.keys(tableData[0]);

    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="overflow-auto max-h-[400px] border rounded">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="p-2 border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {headers.map((h, j) => (
                    <td key={j} className="p-2 border">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Disclaimer /> {/* ✅ Show disclaimer at the top */}
      <h1 className="text-2xl font-bold mb-4">📥 Upload Financial Excel</h1>
      <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || loading}
      >
        {loading ? 'Uploading...' : 'Upload & Parse'}
      </button>

      {error && <div className="text-red-600 mt-4">{error}</div>}

      {result && (
        <>
          <h2 className="mt-6 text-xl font-semibold text-green-700">
            ✅ Company: {result.company_name}
          </h2>

          {renderTable('Profit & Loss', result.annual_pl)}
          {renderTable('Balance Sheet', result.balance_sheet)}
          {renderTable('Cash Flow', result.cashflow)}
        </>
      )}
    </main>
  );
}
