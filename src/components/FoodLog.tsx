'use client';

import { useState } from 'react';
import { Edit3, Trash2, Clock, Utensils } from 'lucide-react';
import { FoodItem, DailyLog } from '@/types/food';

interface FoodLogProps {
  foodLogs: DailyLog[];
  onUpdateItem: (itemId: string, updatedItem: Partial<FoodItem>) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function FoodLog({ foodLogs, onUpdateItem, onDeleteItem }: FoodLogProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FoodItem>>({});

  const today = new Date().toISOString().split('T')[0];
  const todayLog = foodLogs.find(log => log.date === today);

  const startEdit = (item: FoodItem) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      calories: item.calories,
    });
  };

  const saveEdit = () => {
    if (editingItem && editForm.name && editForm.calories) {
      onUpdateItem(editingItem, editForm);
      setEditingItem(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!todayLog || todayLog.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No food logged today</h3>
        <p className="text-gray-500">Upload a photo to start tracking your calories!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Utensils className="w-5 h-5 mr-2" />
        Today&apos;s Food Log
      </h2>
      
      <div className="space-y-4">
        {todayLog.items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {editingItem === item.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Food name"
                />
                <input
                  type="text"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Description"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editForm.calories || ''}
                    onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="Calories"
                  />
                  <span className="text-gray-600 text-base">cal</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-base font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-base font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header with title, time, and actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-base leading-tight">{item.name}</h3>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-3">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      title="Edit item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                )}
                
                {/* Calories and Image Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                      {item.calories} cal
                    </span>
                  </div>
                  
                  {item.imageUrl && (
                    <div className="flex-shrink-0 ml-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* AI Analysis */}
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium text-gray-800">AI Analysis:</span> {item.analysis}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Total Calories */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-800">Total Calories Today:</span>
          <span className="text-xl font-bold text-blue-600">
            {todayLog.items.reduce((sum, item) => sum + item.calories, 0)} cal
          </span>
        </div>
      </div>
    </div>
  );
}
