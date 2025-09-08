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

  const convertImageToJpeg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Handle EXIF orientation for Android camera photos
          const orientation = getImageOrientation(file);
          let { width, height } = img;
          
          // Apply orientation correction
          if (orientation >= 5 && orientation <= 8) {
            [width, height] = [height, width];
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Apply orientation transformation
          applyOrientation(ctx, orientation, width, height);
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert to JPEG with quality 0.8
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(jpegDataUrl);
        } catch (error) {
          console.error('Canvas conversion error:', error);
          // Fallback: try without orientation correction
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(jpegDataUrl);
          } catch (fallbackError) {
            reject(new Error('Failed to convert image to JPEG'));
          }
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Use a more robust image loading approach
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper function to get image orientation from EXIF data
  const getImageOrientation = (file: File): number => {
    // For now, return 1 (no rotation) - in a real app, you'd parse EXIF data
    // This is a simplified version
    return 1;
  };

  // Helper function to apply orientation transformation
  const applyOrientation = (ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) => {
    switch (orientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        break;
    }
  };

  const handleImageUpload = async (file: File) => {
    setError(null);
    
    if (!file) return;
    
    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
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
    
    // Additional validation for Android camera photos
    if (file.size < 1000) {
      setError('Image file appears to be corrupted or too small. Please try taking a new photo.');
      return;
    }
    
    try {
      // Convert image to JPEG format for better compatibility
      console.log('Starting image conversion...');
      const convertedImage = await convertImageToJpeg(file);
      console.log('Image conversion successful');
      
      // Validate the converted image
      if (!convertedImage || !convertedImage.startsWith('data:image/jpeg')) {
        throw new Error('Image conversion failed - invalid output format');
      }
      
      setImage(convertedImage);
      setError(null);
    } catch (error) {
      console.error('Image conversion error:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to convert image')) {
          setError('Image processing failed. This might be due to the image format. Please try taking a new photo or selecting a different image.');
        } else if (error.message.includes('Failed to load image')) {
          setError('Could not load the image. Please try a different photo.');
        } else {
          setError(`Image processing error: ${error.message}. Please try a different image.`);
        }
      } else {
        setError('Failed to process the image. Please try a different image.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
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
        // Show more specific error messages
        if (data.details) {
          setError(`${data.error}. ${data.details}`);
        } else {
          setError(data.error || 'Failed to analyze food. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('Failed to convert image')) {
          setError('Image processing failed. Please try taking a new photo or selecting a different image.');
        } else if (error.message.includes('Failed to load image')) {
          setError('Could not load the image. Please try a different photo.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
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
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
                style={{ width: '32px', height: '32px' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Add Food Photo
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Drag and drop or click to select from gallery
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  iPhone photos will be automatically converted for better compatibility
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 cursor-pointer text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Choose Photo
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 bg-white"
            style={{ color: '#111827' }}
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeFood}
          disabled={!image || isAnalyzing}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Analyze Food</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
