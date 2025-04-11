import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useDoorbellContext } from '@/context/DoorbellContext';

const DoorStatus = () => {
  const { doorStatus, toggleDoorLock } = useDoorbellContext();

  const handleToggleDoor = async () => {
    try {
      await toggleDoorLock();
    } catch (error) {
      console.error('Error toggling door lock:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3">
          <span className="material-icons text-red-500 dark:text-red-300">
            {doorStatus.isLocked ? 'lock' : 'lock_open'}
          </span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Door Status</h3>
          <StatusBadge 
            status={doorStatus.isLocked ? 'locked' : 'unlocked'} 
            className="mt-1"
          />
        </div>
      </div>
      <Button 
        onClick={handleToggleDoor} 
        className="mt-4 w-full bg-[#3B82F6] hover:bg-blue-600"
      >
        {doorStatus.isLocked ? 'Unlock Door' : 'Lock Door'}
      </Button>
    </div>
  );
};

export default DoorStatus;
