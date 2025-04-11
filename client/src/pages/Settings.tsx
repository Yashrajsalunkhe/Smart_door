import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import NotificationSettings from '@/components/settings/NotificationSettings';
import RecognitionSettings from '@/components/settings/RecognitionSettings';
import CameraSettings from '@/components/settings/CameraSettings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { isLoading, updateSettings } = useDoorbellContext();
  const { toast } = useToast();

  const handleSave = async () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure your doorbell system preferences</p>
      </div>
      
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Notification Settings */}
        <NotificationSettings />
        
        {/* Recognition Settings */}
        <RecognitionSettings />
        
        {/* Camera Settings */}
        <CameraSettings />
        
        {/* Save button */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-right sm:px-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={handleSave}
            className="bg-[#3B82F6] hover:bg-blue-600"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
