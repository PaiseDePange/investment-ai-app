'use client';

import React, { useState } from 'react';
import Disclaimer from '@/components/Disclaimer';
import { useGlobalStore } from "@/store/globalStore"; // Zustand
import { Button } from "@/components/ui/button";
//#import { useDCFStore } from "@/store/globalStore"; // or your actual path

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const setAssumptions = useGlobalStore((state) => state.setAssumptions);
  const setMetrics = useGlobalStore((state) => state.setMetrics); // ← NEW

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Upload error:", errorText);
        setStatus("❌ Upload failed: " + errorText);
        return;
      }

      const data = await res.json();
      console.log("✅ Upload result:", data);

      if (data.assumptions) {
        setAssumptions(data.assumptions); // ✅ CORRECT
        setStatus("✅ Data uploaded and assumptions stored.");
      } else {
        setStatus("⚠️ Upload succeeded but assumptions missing.");
      }
      if (data.calculated_metrics) {
        setMetrics(data.calculated_metrics); // ✅ Store for /health
      }

    } catch (err) {
      console.error("❌ Fetch/network error:", err);
      setStatus("❌ Upload failed. See console.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">📥 Upload Screener Excel File</h1>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload & Import
      </Button>
      <p>{status}</p>
    </div>
  );
}