import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '@/components/ui/status-badge';

const LastDetection = () => {
  const { lastDetection } = useDoorbellContext();

  if (!lastDetection) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
            <span className="material-icons text-blue-500 dark:text-blue-300">person</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Last Detected</h3>
            <p className="text-gray-700 dark:text-gray-300">No detections yet</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedTime = formatDistanceToNow(new Date(lastDetection.timestamp), { addSuffix: true });

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
          <span className="material-icons text-blue-500 dark:text-blue-300">person</span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Last Detected</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {lastDetection.personName || 'Unknown Person'}
          </p>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">{formattedTime}</p>
            <StatusBadge 
              status={lastDetection.isKnown ? 'known' : 'unknown'} 
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastDetection;
