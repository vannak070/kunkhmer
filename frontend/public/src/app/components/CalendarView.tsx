import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns';
import type { MatchBatch } from '../data/batches';
import { BATCH_STATUS_CONFIG } from '../data/batches';

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
    <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#1557B0] text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">
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
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
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
              className="text-center text-sm font-bold text-[#707070] py-2"
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
                className={`
                  aspect-square border rounded-lg p-2 transition-all
                  ${isCurrentDay 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md' 
                    : 'border-[#E0E0E0] hover:border-[#0A3D91]/30'
                  }
                  ${dayBatches.length > 0 ? 'bg-blue-50/50' : 'bg-white'}
                `}
              >
                {/* Day Number */}
                <div
                  className={`
                    text-sm font-bold mb-1
                    ${isCurrentDay ? 'text-[#D4AF37]' : 'text-[#404040]'}
                  `}
                >
                  {format(day, 'd')}
                </div>

                {/* Batches on this day */}
                {dayBatches.length > 0 && (
                  <div className="space-y-1">
                    {dayBatches.slice(0, 2).map((batch) => {
                      const statusConfig = BATCH_STATUS_CONFIG[batch.status];
                      return (
                        <button
                          key={batch.id}
                          onClick={() => navigate(`/matches/batch/${batch.id}`)}
                          className={`
                            w-full text-left px-1.5 py-1 rounded text-[10px] font-medium
                            ${statusConfig.bgColor} ${statusConfig.color}
                            hover:opacity-80 transition-opacity
                            flex items-center gap-1
                          `}
                          title={`${batch.batchNumber} - ${batch.eventName}`}
                        >
                          <span className="text-[8px]">{statusConfig.icon}</span>
                          <span className="truncate flex-1">{batch.batchNumber}</span>
                        </button>
                      );
                    })}
                    
                    {/* Show "+X more" if there are more than 2 batches */}
                    {dayBatches.length > 2 && (
                      <div className="text-[10px] text-[#0A3D91] font-bold px-1.5">
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
      <div className="border-t border-[#E0E0E0] p-6 bg-gray-50">
        <h3 className="text-sm font-bold text-[#404040] mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(BATCH_STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                {config.icon} {config.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t border-[#E0E0E0] p-6 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0A3D91]">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate);
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-sm text-[#707070] font-medium">Total Batches</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Approved';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-sm text-[#707070] font-medium">Approved</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Pending KKF';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-sm text-[#707070] font-medium">Pending</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {batches.filter(b => {
                try {
                  const batchDate = parseISO(b.date);
                  return isSameMonth(batchDate, currentDate) && b.status === 'Draft';
                } catch {
                  return false;
                }
              }).length}
            </div>
            <div className="text-sm text-[#707070] font-medium">Drafts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
