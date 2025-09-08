'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import FoodLog from '@/components/FoodLog';
import CalendarView from '@/components/CalendarView';
import GoalBar from '@/components/GoalBar';
import InstallPrompt from '@/components/InstallPrompt';
import { FoodItem, DailyLog } from '@/types/food';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'log' | 'calendar'>('log');
  const [foodLogs, setFoodLogs] = useState<DailyLog[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);

  useEffect(() => {
    // Load data from localStorage
    const savedLogs = localStorage.getItem('foodLogs');
    const savedGoal = localStorage.getItem('dailyGoal');
    
    if (savedLogs) {
      setFoodLogs(JSON.parse(savedLogs));
    }
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal));
    }
  }, []);

  const addFoodItem = (foodItem: FoodItem) => {
    const today = new Date().toISOString().split('T')[0];
    const existingDayIndex = foodLogs.findIndex(log => log.date === today);
    
    const newFoodItem = {
      ...foodItem,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    let updatedLogs: DailyLog[];

    if (existingDayIndex >= 0) {
      updatedLogs = foodLogs.map((log, index) => 
        index === existingDayIndex 
          ? { ...log, items: [...log.items, newFoodItem] }
          : log
      );
    } else {
      const newLog: DailyLog = {
        date: today,
        items: [newFoodItem],
        totalCalories: 0
      };
      updatedLogs = [...foodLogs, newLog];
    }
    
    setFoodLogs(updatedLogs);
    localStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
  };

  const updateFoodItem = (itemId: string, updatedItem: Partial<FoodItem>) => {
    const updatedLogs = foodLogs.map(log => ({
      ...log,
      items: log.items.map(item => 
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    }));
    setFoodLogs(updatedLogs);
    localStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
  };

  const deleteFoodItem = (itemId: string) => {
    const updatedLogs = foodLogs.map(log => ({
      ...log,
      items: log.items.filter(item => item.id !== itemId)
    }));
    setFoodLogs(updatedLogs);
    localStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
  };

  const getTodayCalories = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = foodLogs.find(log => log.date === today);
    return todayLog ? todayLog.items.reduce((sum, item) => sum + item.calories, 0) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
            🍎 Instant Health Tracker
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Track your calories with AI-powered food analysis
          </p>
        </header>

        {/* Goal Bar */}
        <div className="mb-4 sm:mb-8">
          <GoalBar 
            current={getTodayCalories()} 
            goal={dailyGoal} 
            onGoalChange={setDailyGoal}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md w-full max-w-sm">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab('log')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-md transition-colors text-sm font-medium flex items-center justify-center ${
                  activeTab === 'log'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Add Food</span>
                <span className="xs:hidden">Add</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-md transition-colors text-sm font-medium flex items-center justify-center ${
                  activeTab === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Calendar</span>
                <span className="xs:hidden">Cal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'log' ? (
            <div className="space-y-3 sm:space-y-6">
              <PhotoUpload onFoodAnalyzed={addFoodItem} />
              <FoodLog 
                foodLogs={foodLogs}
                onUpdateItem={updateFoodItem}
                onDeleteItem={deleteFoodItem}
              />
            </div>
          ) : (
            <CalendarView foodLogs={foodLogs} />
          )}
        </div>
      </div>
      
      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
