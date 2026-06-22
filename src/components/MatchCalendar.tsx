"use client";
import { useMemo, useState } from "react";
import { Match } from "@/lib/supabase";

const DAYS_OF_WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const formatKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const parseDateStr = (dateStr: string) => {
  const parts = dateStr.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1,
    day: parseInt(parts[2], 10),
  };
};

interface MatchCalendarProps {
  matches: Match[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function MatchCalendar({ matches, selectedDate, onSelectDate }: MatchCalendarProps) {
  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    matches.forEach((m) => {
      if (m.scheduled_date) {
        map[m.scheduled_date] = (map[m.scheduled_date] || 0) + 1;
      }
    });
    return map;
  }, [matches]);

  const initialView = useMemo(() => {
    const sourceDate = selectedDate
      ?? matches.find((m) => m.scheduled_date)?.scheduled_date
      ?? null;
    if (sourceDate) {
      const p = parseDateStr(sourceDate);
      return { year: p.year, month: p.month };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    const result: Array<{ day: number | null; key: string | null }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) result.push({ day: null, key: null });
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, key: formatKey(viewYear, viewMonth, d) });
    }
    while (result.length % 7 !== 0) result.push({ day: null, key: null });
    return result;
  }, [viewYear, viewMonth]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const today = new Date();
  const todayKey = formatKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="box-neo bg-white/5 p-5 mb-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          className="font-mono text-sm font-bold bg-white/10 text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000] hover:bg-white/20 cursor-pointer"
          aria-label="Bulan sebelumnya"
        >
          ←
        </button>
        <div className="font-mono text-sm font-bold text-white uppercase tracking-wider">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button
          onClick={goNext}
          className="font-mono text-sm font-bold bg-white/10 text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000] hover:bg-white/20 cursor-pointer"
          aria-label="Bulan berikutnya"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="font-mono text-[10px] font-bold text-white/50 text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.key) {
            return <div key={i} className="aspect-square" />;
          }
          const matchCount = countByDate[cell.key] || 0;
          const isSelected = selectedDate === cell.key;
          const hasMatches = matchCount > 0;
          const isToday = cell.key === todayKey;

          return (
            <button
              key={i}
              disabled={!hasMatches}
              onClick={() => onSelectDate(isSelected ? null : cell.key)}
              className={`aspect-square flex flex-col items-center justify-center font-mono text-xs border-2 transition-all relative
                ${isSelected
                  ? "bg-yellow text-black border-black shadow-[2px_2px_0_#000] font-bold"
                  : hasMatches
                  ? "bg-pink/20 text-white border-pink/40 hover:bg-pink/40 cursor-pointer font-bold"
                  : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"}
                ${isToday && !isSelected ? "ring-2 ring-yellow ring-inset" : ""}`}
            >
              <span>{cell.day}</span>
              {hasMatches && (
                <span className={`text-[8px] leading-none mt-0.5 ${isSelected ? "text-black" : "text-pink"}`}>
                  {matchCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 font-mono text-[10px] text-white/50 uppercase">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-pink/40 border border-pink/40" />
            ada match
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-yellow border border-black" />
            dipilih
          </span>
        </div>
        {selectedDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="font-mono text-[10px] font-bold uppercase bg-white/10 text-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000] hover:bg-white/20 cursor-pointer"
          >
            ✕ reset
          </button>
        )}
      </div>
    </div>
  );
}
