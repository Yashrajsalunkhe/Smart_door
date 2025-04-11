import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoorbellContext } from '@/context/DoorbellContext';

const CameraSettings = () => {
  const { settings, updateSettings } = useDoorbellContext();

  const handleQualityChange = (value: string) => {
    updateSettings({
      camera: {
        ...settings.camera,
        quality: value as 'low' | 'medium' | 'high'
      }
    });
  };

  const handleDurationChange = (value: string) => {
    updateSettings({
      camera: {
        ...settings.camera,
        captureDuration: parseInt(value) as 15 | 30 | 45
      }
    });
  };

  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Camera Settings</h3>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Camera Quality</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Adjust camera resolution (higher quality requires more bandwidth)</p>
          <Select 
            value={settings.camera.quality} 
            onValueChange={handleQualityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select camera quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (480p)</SelectItem>
              <SelectItem value="medium">Medium (720p)</SelectItem>
              <SelectItem value="high">High (1080p)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Face Capture Duration</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Time spent capturing images for new face profiles</p>
          <Select 
            value={settings.camera.captureDuration.toString()} 
            onValueChange={handleDurationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select capture duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 seconds (50+ images)</SelectItem>
              <SelectItem value="30">30 seconds (100+ images)</SelectItem>
              <SelectItem value="45">45 seconds (150+ images)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default CameraSettings;
