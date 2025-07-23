import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-800 shadow p-4">
      {children}
    </div>
  );
}
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}