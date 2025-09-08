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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Food name"
                />
                <input
                  type="text"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editForm.calories || ''}
                    onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calories"
                  />
                  <span className="text-gray-600">cal</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {item.calories} cal
                    </span>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>AI Analysis:</strong> {item.analysis}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                    title="Edit item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-800">Total Calories Today:</span>
          <span className="text-2xl font-bold text-blue-600">
            {todayLog.items.reduce((sum, item) => sum + item.calories, 0)} cal
          </span>
        </div>
      </div>
    </div>
  );
}
