import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  selectedRange?: { start: Date; end: Date | null } | null;
  onSelectRange?: (range: { start: Date; end: Date | null } | null) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const defaultBookedDates: Date[] = [
  // A range in current month-ish area (late Feb / early March 2026)
  new Date(2026, 1, 24),
  new Date(2026, 1, 25),
  new Date(2026, 1, 26),
  new Date(2026, 1, 27),
  new Date(2026, 1, 28),
  // Another range in March
  new Date(2026, 2, 5),
  new Date(2026, 2, 6),
  new Date(2026, 2, 7),
  new Date(2026, 2, 14),
  new Date(2026, 2, 15),
  new Date(2026, 2, 20),
  new Date(2026, 2, 21),
  new Date(2026, 2, 22),
];

const AvailabilityCalendar = ({
  bookedDates = defaultBookedDates,
  selectedRange = null,
  onSelectRange,
}: AvailabilityCalendarProps) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const isBooked = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    return bookedDates.some((b) => isSameDay(b, date));
  };

  const isPast = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date < todayStart;
  };

  const isToday = (day: number) => {
    return (
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  const handleSelect = (day: number) => {
    if (isPast(day) || isBooked(day) || !onSelectRange) return;
    const date = new Date(viewYear, viewMonth, day);

    if (!selectedRange || (selectedRange.start && selectedRange.end)) {
      // Start a new selection
      onSelectRange({ start: date, end: null });
    } else {
      // Complete the range
      const start = selectedRange.start;
      if (date < start) {
        onSelectRange({ start: date, end: start });
      } else if (isSameDay(date, start)) {
        onSelectRange({ start: date, end: date });
      } else {
        // Check no booked dates fall within range
        const hasBookedInRange = bookedDates.some((b) => b > start && b < date);
        if (hasBookedInRange) {
          // Restart selection at clicked date
          onSelectRange({ start: date, end: null });
        } else {
          onSelectRange({ start, end: date });
        }
      }
    }
  };

  const isInRange = (day: number) => {
    if (!selectedRange || !selectedRange.end) return false;
    const date = new Date(viewYear, viewMonth, day);
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isRangeStart = (day: number) => {
    if (!selectedRange) return false;
    return isSameDay(new Date(viewYear, viewMonth, day), selectedRange.start);
  };

  const isRangeEnd = (day: number) => {
    if (!selectedRange?.end) return false;
    return isSameDay(new Date(viewYear, viewMonth, day), selectedRange.end);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {monthLabel}
        </span>
        <button
          onClick={goNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const booked = isBooked(day);
          const past = isPast(day);
          const todayMark = isToday(day);
          const inRange = isInRange(day);
          const rangeStart = isRangeStart(day);
          const rangeEnd = isRangeEnd(day);
          const selectable = !past && !booked && !!onSelectRange;

          return (
            <button
              key={day}
              type="button"
              disabled={!selectable}
              onClick={() => handleSelect(day)}
              className={`flex h-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                rangeStart || rangeEnd
                  ? "bg-primary text-primary-foreground"
                  : inRange
                  ? "bg-primary/15 text-primary"
                  : past
                  ? "text-muted-foreground/40"
                  : booked
                  ? "bg-destructive/15 text-destructive"
                  : "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]"
              } ${todayMark && !rangeStart && !rangeEnd ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""} ${
                selectable ? "cursor-pointer active:scale-95" : "cursor-default"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success)/0.3)]" />
          <span className="text-[11px] text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/30" />
          <span className="text-[11px] text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
