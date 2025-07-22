'use client';

import React, { useState } from 'react';
import Disclaimer from '@/components/Disclaimer';
import { useGlobalStore } from "@/store/globalStore"; // Zustand
import { Button } from "@/components/ui/button";


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const setAssumptions = useGlobalStore((state) => state.setAssumptions);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/upload-excel`, {
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
      setAssumptions(data);
      setStatus("✅ Data uploaded and assumptions stored.");
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