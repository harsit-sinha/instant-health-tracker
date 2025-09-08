'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { DailyLog } from '@/types/food';

interface CalendarViewProps {
  foodLogs: DailyLog[];
}

export default function CalendarView({ foodLogs }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getCaloriesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayLog = foodLogs.find(log => log.date === dateString);
    return dayLog ? dayLog.items.reduce((sum, item) => sum + item.calories, 0) : 0;
  };

  const getCalorieColor = (calories: number) => {
    if (calories === 0) return 'bg-gray-100';
    if (calories < 1000) return 'bg-red-100';
    if (calories < 1500) return 'bg-yellow-100';
    if (calories < 2000) return 'bg-green-100';
    return 'bg-blue-100';
  };

  const getCalorieIntensity = (calories: number) => {
    if (calories === 0) return 'opacity-30';
    if (calories < 1000) return 'opacity-60';
    if (calories < 1500) return 'opacity-80';
    if (calories < 2000) return 'opacity-100';
    return 'opacity-100';
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Generate calendar days manually
  const generateCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Calendar View
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-700">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square"></div>;
          }
          
          const calories = getCaloriesForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all cursor-pointer
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday ? 'border-blue-500' : 'border-transparent'}
                ${getCalorieColor(calories)}
                ${getCalorieIntensity(calories)}
                hover:shadow-md
              `}
            >
              <div className="text-sm font-medium text-gray-700 mb-1">
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-600">
                {calories > 0 && `${calories} cal`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span>No data</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span>&lt; 1000 cal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
            <span>1000-1500 cal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span>1500-2000 cal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span>&gt; 2000 cal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
