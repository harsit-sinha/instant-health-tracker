'use client';

import { useState, useEffect } from 'react';

export default function AppFooter() {
  const [buildNumber, setBuildNumber] = useState('');

  useEffect(() => {
    // Generate a simple build number based on timestamp
    const build = process.env.NODE_ENV === 'production' 
      ? `v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}.${Date.now().toString().slice(-4)}`
      : `dev-${Date.now().toString().slice(-6)}`;
    setBuildNumber(build);
  }, []);

  return (
    <footer className="mt-8 py-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span>Made with ❤️ by</span>
            <span className="font-semibold text-gray-800">Harsit Sinha</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-mono">
              {buildNumber}
            </span>
            <span className="text-xs text-gray-500">
              © 2024 Instant Health Tracker
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
