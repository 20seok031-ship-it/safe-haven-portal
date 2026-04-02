import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const events: Record<string, { label: string; color: string }> = {
  "2026-04-01": { label: "노동절", color: "bg-portal-calendar-red text-primary-foreground" },
  "2026-05-05": { label: "어린이날", color: "bg-portal-calendar-green text-primary-foreground" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarWidget() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April = 3

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevDays = getDaysInMonth(year, month - 1);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };
  const goToday = () => { setYear(2026); setMonth(3); };

  const cells: { day: number; current: boolean; dateKey: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, current: false, dateKey: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, dateKey: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      cells.push({ day: d, current: false, dateKey: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
    }
  }

  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-accent rounded cursor-pointer"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-accent rounded cursor-pointer"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={goToday} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">오늘</button>
        </div>
        <span className="text-sm font-bold text-foreground">{String(year).slice(2)}년 {String(month + 1).padStart(2, "0")}월</span>
        <select className="text-xs border border-border rounded px-2 py-0.5 bg-card text-foreground cursor-pointer">
          <option>SafetyPortal</option>
        </select>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground mb-1">
        {DAYS.map((d) => (<div key={d} className={d === "일" ? "text-portal-calendar-red" : d === "토" ? "text-primary" : ""}>{d}</div>))}
      </div>

      <div className="grid grid-cols-7 text-center text-xs">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.current && cell.day === today.getDate();
          const evt = events[cell.dateKey];
          return (
            <div
              key={i}
              className={`py-1.5 relative cursor-pointer hover:bg-accent/50 rounded-sm transition-colors ${
                !cell.current ? "text-muted-foreground/40" : "text-foreground"
              }`}
            >
              <span className={isToday ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-portal-calendar-today text-primary-foreground text-[10px] font-bold" : ""}>
                {cell.day}
              </span>
              {evt && (
                <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] px-1 rounded ${evt.color} whitespace-nowrap`}>
                  {evt.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
