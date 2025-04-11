import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import CameraFeed from '@/components/recognition/CameraFeed';
import RecentDetections from '@/components/recognition/RecentDetections';
import { StatusBadge } from '@/components/ui/status-badge';

const FaceRecognition = () => {
  const { isLoading } = useDoorbellContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Face Recognition</h2>
          <p className="text-gray-600 dark:text-gray-400">Live monitoring from your doorbell camera</p>
        </div>
        <div className="mt-4 md:mt-0">
          <StatusBadge 
            status="online" 
            label="Ready" 
            pulseAnimation={true}
          />
        </div>
      </div>
      
      {/* Camera feed container */}
      <CameraFeed />
      
      {/* Recent detections */}
      <RecentDetections />
    </div>
  );
};

export default FaceRecognition;
