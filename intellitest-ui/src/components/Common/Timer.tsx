import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function Timer({ durationMinutes, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // seconds

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / (durationMinutes * 60)) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage > 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border font-mono font-bold ${getTimerColor()}`}>
      <Clock className="h-4 w-4" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}