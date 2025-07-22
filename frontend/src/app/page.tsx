'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white text-black dark:bg-zinc-900 dark:text-white">
      <Image
        src="/logo.png"
        alt="ThinkInvestVal Logo"
        width={80}
        height={80}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold mb-2">ThinkInvestVal 🧠📈</h1>

      <p className="text-lg font-medium mb-1">
        We don’t tell you what to buy — we teach you how to think and value.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-xl">
        Built for Indian stock market investors, ThinkInvestVal turns uploaded Excel data into clear, AI-backed DCF valuations and EPS forecasts — in simple language.
        Users can upload Excel files downloaded from <strong>Screener.in</strong>, and the tool automatically extracts financials like revenue, margin, capex, and debt. These are then used to calculate the fair value of a stock using discounted cash flow (DCF) analysis.
      </p>

      <div className="flex gap-4 mb-10">
        <Link href="/upload">
          <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">📤 Upload Excel</button>
        </Link>
        <Link href="/dcf">
          <button className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">📊 Try DCF</button>
        </Link>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        AI-powered valuation tools for Indian stocks. Analyze fundamentals, project cash flows, and compare fair value in seconds. 
        <br />
        Smart Investing • Transparent Logic • Multilingual Tools
      </div>
      <div className="mt-10 text-[10px] text-gray-400 dark:text-gray-500 max-w-xl text-center">
        ⚠️ Disclaimer: This tool is for informational and educational purposes only. It does not constitute financial advice or stock recommendations. Please consult your advisor before making investment decisions.
      </div>
    </main>
  );
}
