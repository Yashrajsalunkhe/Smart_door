import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDoorbellContext } from '@/context/DoorbellContext';

const NotificationSettings = () => {
  const { settings, updateSettings } = useDoorbellContext();

  const handleEmailToggle = (checked: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        email: checked
      }
    });
  };

  const handleBrowserToggle = (checked: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        browser: checked
      }
    });
  };

  const handleMobileToggle = (checked: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        mobile: checked
      }
    });
  };

  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h3>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive email alerts when unknown faces are detected</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={handleEmailToggle}
              id="email-toggle"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Browser Notifications</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Show browser notifications when activity is detected</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Switch
              checked={settings.notifications.browser}
              onCheckedChange={handleBrowserToggle}
              id="browser-toggle"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mobile App Notifications</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Push notifications to your mobile device</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Switch
              checked={settings.notifications.mobile}
              onCheckedChange={handleMobileToggle}
              id="mobile-toggle"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
