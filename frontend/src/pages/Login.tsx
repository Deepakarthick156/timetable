import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/axiosInstance';
import { useDarkMode } from '../hooks/useDarkMode';
import { LogIn, Moon, Sun } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/authenticate', { username, password });
      setAuth(res.data.token, res.data.role);
      if (res.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      const backendMessage =
        axios.isAxiosError(err) && err.response?.data
          ? typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data.message || err.response.data.error
          : null;
      setError(backendMessage || 'Invalid credentials');
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={toggleDarkMode}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <LogIn className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">AI TimeTable Assistant</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input
                type="text"
                required
                className="relative block w-full appearance-none rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-white dark:bg-zinc-950 placeholder-zinc-500 focus:z-10 focus:border-emerald-600 focus:outline-none focus:ring-emerald-600/20 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full appearance-none rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-white dark:bg-zinc-950 placeholder-zinc-500 focus:z-10 focus:border-emerald-600 focus:outline-none focus:ring-emerald-600/20 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all shadow-md"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}