import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'error' | 'warning' | 'success' | 'known' | 'unknown' | 'locked' | 'unlocked';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  pulseAnimation?: boolean;
}

export function StatusBadge({ 
  status, 
  label, 
  className,
  pulseAnimation = false
}: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'online':
      case 'success':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'offline':
      case 'error':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'warning':
      case 'unknown':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'known':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'locked':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'unlocked':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDefaultLabel = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'success': return 'Success';
      case 'known': return 'Known';
      case 'unknown': return 'Unknown';
      case 'locked': return 'Locked';
      case 'unlocked': return 'Unlocked';
      default: return 'Status';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'online':
      case 'success':
      case 'unlocked':
      case 'known':
        return "bg-green-500";
      case 'offline':
      case 'error':
      case 'locked':
        return "bg-red-500";
      case 'warning':
      case 'unknown':
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        getStatusStyles(),
        className
      )}
    >
      <span 
        className={cn(
          "w-2 h-2 mr-2 rounded-full",
          getDotColor(),
          pulseAnimation && "animate-pulse"
        )}
      ></span>
      {label || getDefaultLabel()}
    </span>
  );
}
