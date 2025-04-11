import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import DoorStatus from '@/components/dashboard/DoorStatus';
import LastDetection from '@/components/dashboard/LastDetection';
import QuickAccess from '@/components/dashboard/QuickAccess';
import { StatusBadge } from '@/components/ui/status-badge';

const Dashboard = () => {
  const { lastDetection, weatherInfo, isLoading } = useDoorbellContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Home</h2>
          <p className="text-gray-600 dark:text-gray-400">Your doorbell system is active and monitoring</p>
        </div>
        <div className="mt-4 md:mt-0">
          <StatusBadge status="online" label="System Online" />
        </div>
      </div>
      
      {/* Status summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Door Status Card */}
        <DoorStatus />
        
        {/* Last Detected Card */}
        <LastDetection />
        
        {/* Weather Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
              <span className="material-icons text-yellow-500 dark:text-yellow-300">wb_sunny</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Outside</h3>
              <p className="text-gray-700 dark:text-gray-300">{weatherInfo.temperature}°F, {weatherInfo.condition}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Feels like {weatherInfo.feelsLike}°F</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Last Snapshot */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Last Snapshot</h3>
        <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ height: '300px' }}>
          {lastDetection && lastDetection.imageUrl ? (
            <img 
              src={lastDetection.imageUrl} 
              alt="Person at doorstep" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">no_photography</span>
                <p className="text-gray-500 dark:text-gray-400">No snapshots captured yet</p>
              </div>
            </div>
          )}
          
          {lastDetection && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="text-white">
                <p className="font-medium">{lastDetection.personName || 'Unknown Person'}</p>
                {lastDetection.isKnown && lastDetection.confidence > 0 && (
                  <p className="text-sm">Recognized with {Math.round(lastDetection.confidence * 100)}% confidence</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Access Cards */}
      <QuickAccess />
    </div>
  );
};

export default Dashboard;
