import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns';
import { clsx } from 'clsx';
import type { MatchBatch, BatchStatus } from '../data/batches';
import { BATCH_STATUS_CONFIG } from '../data/batches';

// Helper function to get premium badge colors
const getStatusBadgeClass = (status: BatchStatus): string => {
  switch (status) {
    case "Draft":
    case "Complete":
      return "bg-slate-50 text-slate-600 border-slate-200/60";
    case "Pending KKF":
      return "bg-amber-50 text-amber-705 border-amber-200/60";
    case "Approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200/60";
    case "Weight-In":
      return "bg-orange-50 text-orange-700 border-orange-200/60";
    case "Ready":
      return "bg-blue-50 text-[#0A3D91] border-blue-200/60";
    case "Live":
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200/60";
  }
};

interface CalendarViewProps {
  batches: MatchBatch[];
}

export function CalendarView({ batches }: CalendarViewProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate starting day offset for calendar grid
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday

  // Group batches by date
  const batchesByDate = batches.reduce((acc, batch) => {
    try {
      const batchDate = parseISO(batch.date);
      const dateKey = format(batchDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(batch);
    } catch (e) {
      console.error('Error parsing batch date:', batch.date);
    }
    return acc;
  }, {} as Record<string, MatchBatch[]>);

  const getBatchesForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return batchesByDate[dateKey] || [];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Days of week
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-primary to-[#1557B0] text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const dayBatches = getBatchesForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={clsx(
                  "aspect-square border rounded-xl p-2 transition-all",
                  isCurrentDay 
                    ? 'border-accent bg-accent/5 shadow-md' 
                    : 'border-border hover:border-primary/35',
                  dayBatches.length > 0 ? 'bg-primary/5' : 'bg-white'
                )}
              >
                {/* Day Number */}
                <div
                  className={clsx(
                    "text-sm font-semibold mb-1",
                    isCurrentDay ? 'text-accent-foreground font-bold' : 'text-foreground/80'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* Batches on this day */}
                {dayBatches.length > 0 && (
                  <div className="space-y-1">
                    {dayBatches.slice(0, 2).map((batch) => {
                      const config = BATCH_STATUS_CONFIG[batch.status] || BATCH_STATUS_CONFIG["Draft"];
                      return (
                        <button
                          key={batch.id}
                          onClick={() => navigate(`/home/batches/${batch.id}`)}
                          className={clsx(
                            "w-full text-left px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wider border transition-opacity hover:opacity-85 flex items-center gap-1",
                            getStatusBadgeClass(batch.status)
                          )}
                          title={`${batch.batchNumber} - ${batch.eventName}`}
                        >
                          <span className="text-[10px]">{config.icon}</span>
                          <span className="truncate flex-1">{batch.batchNumber}</span>
                        </button>
                      );
                    })}
                    
                    {/* Show "+X more" if there are more than 2 batches */}
                    {dayBatches.length > 2 && (
                      <div className="text-[9px] text-primary font-semibold px-1.5 uppercase tracking-wider">
                        +{dayBatches.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border p-6 bg-muted/10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(BATCH_STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={clsx(
                "badge-premium uppercase tracking-wider text-[9px] py-1 px-2.5 font-semibold",
                getStatusBadgeClass(status as BatchStatus)
              )}>
                <span className="text-xs">{config.icon}</span> {config.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t border-border p-6 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tighter text-primary">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate);
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Total Batches</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tighter text-slate-500">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Draft';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Draft</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tighter text-orange-600">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Weight-In';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Weight-In</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tighter text-purple-600">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Live';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Live</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tighter text-slate-500">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Complete';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}