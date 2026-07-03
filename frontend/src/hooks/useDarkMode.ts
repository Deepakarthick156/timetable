import { useEffect, useState } from 'react';

const STORAGE_KEY = 'academic-assistant-dark-mode';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((value) => !value);

  return { darkMode, toggleDarkMode };
}
