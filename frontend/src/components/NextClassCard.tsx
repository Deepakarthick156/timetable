import { useEffect, useState, useMemo } from 'react';
import { BookOpen, UserRound, MapPin, Clock3, Hourglass } from 'lucide-react';

type NamedEntity = {
  id: number;
  name?: string;
  code?: string;
  roomNumber?: string;
  type?: string;
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

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Helper to parse HH:mm:ss or HH:mm string to seconds since midnight
function parseTimeSecs(timeStr: string) {
  if (!timeStr) return 0;
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

function formatTime(value: string) {
  if (!value) return '-';
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${minuteText} ${suffix}`;
}

function getCountdownString(diffSecs: number) {
  if (diffSecs < 3600) {
    const m = Math.floor(diffSecs / 60);
    const s = diffSecs % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(diffSecs / 3600);
  const m = Math.floor((diffSecs % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function NextClassCard({ timetable, holidays = [] }: { timetable: TimetableEntry[], holidays?: any[] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Refresh every second for live updates
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const widgetData = useMemo(() => {
    if (!timetable || timetable.length === 0) return null;

    const currentDayName = dayOrder[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Group entries by day
    const grouped = dayOrder.map(day => ({
      day,
      entries: timetable
        .filter(t => t.dayOfWeek?.toUpperCase() === day)
        .sort((a, b) => parseTimeSecs(a.startTime) - parseTimeSecs(b.startTime))
    }));

    const isHoliday = (date: Date) => {
      // Create a local date string YYYY-MM-DD to match holiday dates which might be strings
      const localDateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      return holidays.some(h => {
        if (!h.holidayDate) return false;
        // The API returns strings like "2026-07-05T00:00:00.000+00:00" or "2026-07-05"
        return h.holidayDate.startsWith(localDateStr);
      });
    };

    // Check today's classes
    const todayIndex = dayOrder.indexOf(currentDayName);
    const todayClasses = isHoliday(now) ? [] : (grouped[todayIndex]?.entries || []);

    // 1. Ongoing class
    const ongoing = todayClasses.find(
      t => currentSecs >= parseTimeSecs(t.startTime) && currentSecs < parseTimeSecs(t.endTime)
    );
    if (ongoing) {
      const endsIn = parseTimeSecs(ongoing.endTime) - currentSecs;
      return { type: 'ongoing', class: ongoing, diffText: `Ends in ${getCountdownString(endsIn)}`, dayLabel: 'Today' };
    }

    // 2. Next class today
    const nextToday = todayClasses.find(t => currentSecs < parseTimeSecs(t.startTime));
    if (nextToday) {
      const startsIn = parseTimeSecs(nextToday.startTime) - currentSecs;
      return { type: 'upcoming', class: nextToday, diffText: `Starts in ${getCountdownString(startsIn)}`, dayLabel: 'Today' };
    }

    // 3. First class next available day
    let nextDayIndex = (todayIndex + 1) % 7;
    let daysChecked = 1; // start from tomorrow
    while (daysChecked <= 7) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysChecked);
      
      const nextClasses = isHoliday(targetDate) ? [] : (grouped[nextDayIndex]?.entries || []);
      
      if (nextClasses.length > 0) {
        const nextClass = nextClasses[0];
        const dayLabel = daysChecked === 1 ? 'Tomorrow' : (
            daysChecked < 7 ? dayOrder[nextDayIndex].charAt(0) + dayOrder[nextDayIndex].slice(1).toLowerCase() : 'Next ' + dayOrder[nextDayIndex].charAt(0) + dayOrder[nextDayIndex].slice(1).toLowerCase()
        );
        
        const isWeekend = currentDayName === 'SATURDAY' || currentDayName === 'SUNDAY';
        const msg = isWeekend ? 'No classes today.' : (daysChecked === 1 ? 'No more classes today.' : 'Upcoming class.');
        return { type: 'future', class: nextClass, diffText: `${msg} Starts ${dayLabel}`, dayLabel };
      }
      nextDayIndex = (nextDayIndex + 1) % 7;
      daysChecked++;
    }

    return null;
  }, [now, timetable, holidays]);

  if (!widgetData) return null;

  const entry = widgetData.class;
  const isOngoing = widgetData.type === 'ongoing';

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          {isOngoing ? (
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              Ongoing Now
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <BookOpen size={18} /> Next Class
            </span>
          )}
        </h2>
        {widgetData.type === 'future' && (
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {widgetData.dayLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{entry.subject?.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
              <UserRound size={14} className="text-zinc-500" />
              {entry.faculty?.name || 'Assigned Faculty'}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
              <MapPin size={14} className="text-zinc-500" />
              {entry.classroom?.type || 'Room'} {entry.classroom?.roomNumber}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
              <Clock3 size={14} className="text-zinc-500" />
              {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
            </span>
          </div>
        </div>
        
        <div className={`mt-2 flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold tabular-nums sm:mt-0 ${
          isOngoing 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
        }`}>
          <Hourglass size={16} className={isOngoing ? 'animate-pulse' : ''} />
          <span>{widgetData.diffText}</span>
        </div>
      </div>
    </div>
  );
}
