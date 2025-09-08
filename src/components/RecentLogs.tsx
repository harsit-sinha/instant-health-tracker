'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function RecentLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Listen for custom log events
    const handleLog = (event: CustomEvent) => {
      const { type, message, details } = event.detail;
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type,
        message,
        details
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep only last 10 logs
    };

    window.addEventListener('app-log', handleLog as EventListener);
    return () => window.removeEventListener('app-log', handleLog as EventListener);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Recent Activity ({logs.length})
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border text-sm ${getTypeColor(log.type)}`}
            >
              <div className="flex items-start space-x-2">
                {getIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{log.message}</span>
                    <span className="text-xs opacity-75">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {log.details && (
                    <div className="mt-1 text-xs opacity-75 font-mono">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
