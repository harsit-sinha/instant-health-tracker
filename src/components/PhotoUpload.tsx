'use client';

import { useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { FoodItem } from '@/types/food';

interface PhotoUploadProps {
  onFoodAnalyzed: (foodItem: FoodItem) => void;
}

export default function PhotoUpload({ onFoodAnalyzed }: PhotoUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setError(null);
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select an image smaller than 10MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImage(result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image,
          description: description,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onFoodAnalyzed({
          id: Date.now().toString(),
          name: data.name,
          description: description || data.name,
          calories: data.calories,
          analysis: data.analysis,
          imageUrl: image,
          timestamp: new Date().toISOString(),
        });
        
        // Reset form
        setImage(null);
        setDescription('');
        setError(null);
      } else {
        setError(data.error || 'Failed to analyze food. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Camera className="w-5 h-5 mr-2" />
        Upload Food Photo
      </h2>
      
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {/* Image Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt="Uploaded food"
                className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Drag and drop your food photo here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer text-sm sm:text-base"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Description (Optional)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'Grilled chicken with rice'"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeFood}
          disabled={!image || isAnalyzing}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-base font-medium"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Analyze Food
            </>
          )}
        </button>
      </div>
    </div>
  );
}
