'use client';

import { useState } from 'react';
import { Target, Edit3, Check } from 'lucide-react';

interface GoalBarProps {
  current: number;
  goal: number;
  onGoalChange: (newGoal: number) => void;
}

export default function GoalBar({ current, goal, onGoalChange }: GoalBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState(goal.toString());

  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);

  const handleSaveGoal = () => {
    const newGoal = parseInt(editGoal);
    if (newGoal > 0) {
      onGoalChange(newGoal);
      localStorage.setItem('dailyGoal', newGoal.toString());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditGoal(goal.toString());
    setIsEditing(false);
  };

  const getProgressColor = () => {
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 75) return 'bg-yellow-500';
    if (percentage < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (percentage < 50) return 'Keep going!';
    if (percentage < 75) return 'Good progress!';
    if (percentage < 100) return 'Almost there!';
    return 'Goal achieved! 🎉';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Daily Calorie Goal
        </h2>
        
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
            />
            <button
              onClick={handleSaveGoal}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Save goal"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className={`h-6 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {current.toLocaleString()} / {goal.toLocaleString()} cal
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{Math.round(percentage)}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{remaining.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <p className={`text-sm font-medium ${
            percentage >= 100 ? 'text-green-600' : 'text-gray-600'
          }`}>
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
}
