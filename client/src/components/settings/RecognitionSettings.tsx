import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useDoorbellContext } from '@/context/DoorbellContext';

const RecognitionSettings = () => {
  const { settings, updateSettings } = useDoorbellContext();

  const handleConfidenceChange = (value: number[]) => {
    updateSettings({
      recognition: {
        ...settings.recognition,
        confidenceThreshold: value[0]
      }
    });
  };

  const handleSaveKnownFacesToggle = (checked: boolean) => {
    updateSettings({
      recognition: {
        ...settings.recognition,
        saveKnownFaces: checked
      }
    });
  };

  const handleFilterLowQualityToggle = (checked: boolean) => {
    updateSettings({
      recognition: {
        ...settings.recognition,
        filterLowQuality: checked
      }
    });
  };

  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Face Recognition Settings</h3>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recognition Confidence Threshold</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Minimum confidence level required to identify a known face</p>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Low (60%)</span>
            <Slider
              defaultValue={[settings.recognition.confidenceThreshold]}
              min={60}
              max={95}
              step={1}
              onValueChange={handleConfidenceChange}
              className="w-full"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">High (95%)</span>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Current: {settings.recognition.confidenceThreshold}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Save Images of Known Faces</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Store snapshots of recognized people in history</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Switch
              checked={settings.recognition.saveKnownFaces}
              onCheckedChange={handleSaveKnownFacesToggle}
              id="known-faces-toggle"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filter Low Quality Images</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically discard blurry or low-quality captures</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Switch
              checked={settings.recognition.filterLowQuality}
              onCheckedChange={handleFilterLowQualityToggle}
              id="quality-toggle"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecognitionSettings;
