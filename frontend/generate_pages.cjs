const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const componentsPath = path.join(srcPath, 'components');
const pagesPath = path.join(srcPath, 'pages');

[componentsPath, pagesPath].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
    [path.join(pagesPath, 'Login.tsx')]: `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/axiosInstance';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

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
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">AI Academic Assistant</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input
                type="text"
                required
                className="relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`,
    [path.join(pagesPath, 'AdminDashboard.tsx')]: `import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axiosInstance';
import { LogOut, BookOpen, Users, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/admin/departments').then(res => setDepartments(res.data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Admin Portal</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </nav>
      
      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl text-blue-600 dark:text-blue-300">
               <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Departments</p>
              <h2 className="text-2xl font-bold">{departments.length}</h2>
            </div>
          </div>
          {/* Add more stat cards here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <h2 className="text-lg font-semibold mb-4">Manage Departments</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b dark:border-gray-700">
                   <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ID</th>
                   <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                   <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                 </tr>
               </thead>
               <tbody>
                 {departments.map((dept: any) => (
                   <tr key={dept.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                     <td className="py-3 px-4">{dept.id}</td>
                     <td className="py-3 px-4 font-medium">{dept.name}</td>
                     <td className="py-3 px-4 text-gray-500">{dept.code}</td>
                   </tr>
                 ))}
                 {departments.length === 0 && (
                   <tr>
                     <td colSpan={3} className="py-8 text-center text-gray-500">No departments found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </main>
    </div>
  );
}`,
    [path.join(pagesPath, 'StudentDashboard.tsx')]: `import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axiosInstance';
import { LogOut, Send, Bot, User as UserIcon } from 'lucide-react';

export default function StudentDashboard() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [messages, setMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: 'Hello! I am your AI Academic Assistant. Ask me anything about your timetable!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/student/timetable').then(res => setTimetable(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/student/chat', { question: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar / Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
               <Bot size={24} />
             </div>
             <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full font-medium text-sm">
            <LogOut size={16} /> Logout
          </button>
        </nav>
        
        <main className="flex-1 overflow-y-auto p-6 flex gap-6">
           {/* Timetable Section */}
           <div className="w-1/2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col overflow-hidden">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarIcon /> My Timetable</h2>
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {timetable.length === 0 ? (
                   <p className="text-gray-500 text-center mt-10">No classes scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {timetable.map((t: any) => (
                      <div key={t.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{t.subject.name}</span>
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full">{t.dayOfWeek}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                          <span>{t.startTime} - {t.endTime}</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">Room: {t.classroom.roomNumber}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Prof. {t.faculty.name}</div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </div>

           {/* Chat Section */}
           <div className="w-1/2 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden relative">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
                     <Bot size={20} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">AI Assistant</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-5">
                {messages.map((m, i) => (
                  <div key={i} className={\`flex \${m.sender === 'user' ? 'justify-end' : 'justify-start'}\`}>
                    <div className={\`max-w-[80%] rounded-2xl p-4 \${m.sender === 'user' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'} shadow-md\`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 flex gap-1 items-center">
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
             </div>

             <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
               <form onSubmit={handleSend} className="relative flex items-center">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your schedule..." 
                    className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-gray-800 dark:text-white placeholder-gray-500"
                 />
                 <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-600/30"
                 >
                   <Send size={18} />
                 </button>
               </form>
             </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar text-blue-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  );
}`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(filePath, content);
    console.log('Created ' + path.basename(filePath));
}
