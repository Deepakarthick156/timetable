import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Bot,
  CalendarDays,
  ClipboardList,
  Clock3,
  GraduationCap,
  LogOut,
  MapPin,
  Megaphone,
  Moon,
  Send,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react';
import { api } from '../lib/axiosInstance';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../store/useAuthStore';

type NamedEntity = {
  id: number;
  name?: string;
  code?: string;
  yearName?: string;
  level?: number;
  roomNumber?: string;
  type?: string;
  title?: string;
};

type TimetableEntry = {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: NamedEntity;
  faculty: NamedEntity;
  classroom: NamedEntity;
};

type StudentProfile = {
  registerNumber: string;
  name: string;
  department: NamedEntity;
  year: NamedEntity;
  section: NamedEntity;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

type Holiday = {
  id: number;
  name: string;
  holidayDate: string;
  type: string;
};

type Assessment = {
  id: number;
  title: string;
  assessmentDate: string;
  maxMarks: number;
  subject: NamedEntity;
};

type AttendanceRecord = {
  id: number;
  totalClasses: number;
  attendedClasses: number;
  subject: NamedEntity;
};

type InternalMark = {
  id: number;
  assessmentName: string;
  marks: number;
  maxMarks: number;
  subject: NamedEntity;
};

type ExamSchedule = {
  id: number;
  examName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  subject: NamedEntity;
  classroom: NamedEntity;
};

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const quickPrompts = [
  'What is my timetable today?',
  'Who is taking my first hour today?',
  'Do I have a lab tomorrow?',
  'Do I have any free hours?',
  'What should I bring today?',
];

const tabs = [
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'academic', label: 'Academic', icon: ClipboardList },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function StudentDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [internalMarks, setInternalMarks] = useState<InternalMark[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Hi. I already know your department, year, and section. Ask me about your timetable, labs, rooms, faculty, free hours, or what to bring today.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/student/timetable'),
      api.get('/student/announcements'),
      api.get('/student/holidays'),
      api.get('/student/assessments'),
      api.get('/student/attendance'),
      api.get('/student/internal-marks'),
      api.get('/student/exams'),
    ])
      .then(([profileRes, timetableRes, announcementsRes, holidaysRes, assessmentsRes, attendanceRes, marksRes, examsRes]) => {
        setProfile(profileRes.data);
        setTimetable(sortEntries(timetableRes.data));
        setAnnouncements(announcementsRes.data);
        setHolidays(holidaysRes.data);
        setAssessments(assessmentsRes.data);
        setAttendance(attendanceRes.data);
        setInternalMarks(marksRes.data);
        setExams(examsRes.data);
      })
      .catch(console.error);
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const todayEntries = useMemo(
    () => timetable.filter((entry) => entry.dayOfWeek?.toUpperCase() === todayName),
    [timetable, todayName],
  );

  const grouped = useMemo(
    () =>
      dayOrder.map((day) => ({
        day,
        entries: timetable.filter((entry) => entry.dayOfWeek?.toUpperCase() === day),
      })),
    [timetable],
  );

  const upcomingHolidays = useMemo(
    () =>
      [...holidays]
        .filter((holiday) => new Date(holiday.holidayDate) >= startOfDay(new Date()))
        .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
        .slice(0, 5),
    [holidays],
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/student/chat', { question: trimmed });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'I could not reach the timetable assistant service right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">TimeTable Assistant</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Personal timetable intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
        <section className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Logged in as</p>
                <h2 className="mt-1 text-2xl font-semibold">{profile?.name ?? 'Student'}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <ContextPill label="Register" value={profile?.registerNumber ?? '-'} />
                <ContextPill label="Dept" value={profile?.department?.code || profile?.department?.name || '-'} />
                <ContextPill label="Year" value={profile?.year?.yearName || String(profile?.year?.level ?? '-')} />
                <ContextPill label="Section" value={profile?.section?.name ?? '-'} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'schedule' ? (
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <CalendarDays size={18} /> Today
                  </h2>
                  <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                    {todayName.toLowerCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  {todayEntries.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      No classes scheduled for today.
                    </p>
                  ) : (
                    todayEntries.map((entry) => <ScheduleCard key={entry.id} entry={entry} />)
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Weekly Timetable</h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{timetable.length} entries</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {grouped.map(({ day, entries }) => (
                    <div key={day} className="min-h-28 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{titleCase(day)}</h3>
                        <span className="text-xs text-zinc-500">{entries.length}</span>
                      </div>
                      <div className="space-y-2">
                        {entries.length === 0 ? (
                          <p className="text-xs text-zinc-400">No classes</p>
                        ) : (
                          entries.map((entry) => (
                            <div key={entry.id} className="rounded-md bg-zinc-100 p-2 text-xs dark:bg-zinc-800">
                              <p className="font-medium">{entry.subject?.name}</p>
                              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              <Panel title="Announcements" icon={Megaphone} count={announcements.length}>
                {announcements.length === 0 ? (
                  <EmptyState text="No announcements right now." />
                ) : (
                  announcements.map((item) => (
                    <div key={item.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.content}</p>
                    </div>
                  ))
                )}
              </Panel>

              <Panel title="Upcoming Holidays" icon={Bell} count={upcomingHolidays.length}>
                {upcomingHolidays.length === 0 ? (
                  <EmptyState text="No upcoming holidays." />
                ) : (
                  upcomingHolidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-xs text-zinc-500">{holiday.type}</p>
                      </div>
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 dark:bg-sky-400/15 dark:text-sky-200">
                        {formatDate(holiday.holidayDate)}
                      </span>
                    </div>
                  ))
                )}
              </Panel>

              <Panel title="Exam Schedule" icon={ClipboardList} count={exams.length}>
                {exams.length === 0 ? (
                  <EmptyState text="No exams scheduled." />
                ) : (
                  exams.map((exam) => (
                    <div key={exam.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{exam.examName}</h3>
                          <p className="text-sm text-zinc-500">{exam.subject?.name}</p>
                        </div>
                        <span className="text-xs text-zinc-500">{formatDate(exam.examDate)}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {formatTime(exam.startTime)} - {formatTime(exam.endTime)} in {exam.classroom?.roomNumber}
                      </p>
                    </div>
                  ))
                )}
              </Panel>

              <Panel title="Assessment Schedule" icon={CalendarDays} count={assessments.length}>
                {assessments.length === 0 ? (
                  <EmptyState text="No assessments scheduled." />
                ) : (
                  assessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div>
                        <p className="font-medium">{assessment.title}</p>
                        <p className="text-sm text-zinc-500">{assessment.subject?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">{formatDate(assessment.assessmentDate)}</p>
                        <p className="text-xs font-medium text-emerald-600">{assessment.maxMarks} marks</p>
                      </div>
                    </div>
                  ))
                )}
              </Panel>

              <Panel title="Attendance" icon={UserRound} count={attendance.length}>
                {attendance.length === 0 ? (
                  <EmptyState text="No attendance records yet." />
                ) : (
                  attendance.map((record) => {
                    const percentage = Math.round((record.attendedClasses / record.totalClasses) * 100);
                    return (
                      <div key={record.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{record.subject?.name}</p>
                          <span className={`text-sm font-semibold ${percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          {record.attendedClasses} / {record.totalClasses} classes attended
                        </p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </Panel>

              <Panel title="Internal Marks" icon={ClipboardList} count={internalMarks.length}>
                {internalMarks.length === 0 ? (
                  <EmptyState text="No internal marks uploaded yet." />
                ) : (
                  internalMarks.map((mark) => (
                    <div key={mark.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div>
                        <p className="font-medium">{mark.assessmentName}</p>
                        <p className="text-sm text-zinc-500">{mark.subject?.name}</p>
                      </div>
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
                        {mark.marks}/{mark.maxMarks}
                      </span>
                    </div>
                  ))
                )}
              </Panel>
            </div>
          )}
        </section>

        <section className="flex h-[640px] flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:h-[720px]">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold">AI Chat</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Answers are scoped to your profile timetable</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuestion(prompt)}
                  className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                    {message.sender === 'user' ? <UserRound size={13} /> : <Sparkles size={13} />}
                    {message.sender === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  Thinking over your timetable...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask: What is tomorrow's first hour?"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Icon size={18} /> {title}
        </h2>
        <span className="text-xs text-zinc-500">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{text}</p>;
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800" title={value}>
      <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}

function ScheduleCard({ entry }: { entry: TimetableEntry }) {
  const isLab = entry.subject?.type?.toLowerCase().includes('lab') || entry.classroom?.type?.toLowerCase().includes('lab');
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{entry.subject?.name}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {entry.subject?.code} {isLab ? 'Lab' : 'Class'}
          </p>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            isLab
              ? 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-400/15 dark:text-fuchsia-200'
              : 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200'
          }`}
        >
          {entry.classroom?.type || 'Room'}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <p className="flex items-center gap-2">
          <Clock3 size={15} /> {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
        </p>
        <p className="flex items-center gap-2">
          <UserRound size={15} /> {entry.faculty?.name}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={15} /> {entry.classroom?.roomNumber}
        </p>
      </div>
    </div>
  );
}

function sortEntries(entries: TimetableEntry[]) {
  return [...entries].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.dayOfWeek?.toUpperCase()) - dayOrder.indexOf(b.dayOfWeek?.toUpperCase());
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(value: string) {
  if (!value) return '-';
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${minuteText} ${suffix}`;
}

function formatDate(value: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
