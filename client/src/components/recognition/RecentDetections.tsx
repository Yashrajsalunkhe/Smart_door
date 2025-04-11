import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '@/components/ui/status-badge';

const RecentDetections = () => {
  const { detections } = useDoorbellContext();
  
  // Get the 3 most recent detections
  const recentDetections = detections
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  if (recentDetections.length === 0) {
    return (
      <>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Detections</h3>
        <div className="flex justify-center items-center h-40 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No recent detections</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Detections</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentDetections.map((detection) => (
          <div 
            key={detection.id} 
            className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="h-40 bg-gray-200 dark:bg-gray-800">
              {detection.imageUrl ? (
                <img 
                  src={detection.imageUrl} 
                  alt="Detection snapshot" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons text-gray-400 text-4xl">broken_image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {detection.personName || 'Unknown Person'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge 
                  status={detection.isKnown ? 'known' : 'unknown'} 
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecentDetections;
