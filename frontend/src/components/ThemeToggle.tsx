'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply initial class based on saved preference or default to light
    if (localStorage.theme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    setDarkMode(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="ml-auto px-3 py-1 text-sm border border-gray-400 dark:border-white rounded hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
