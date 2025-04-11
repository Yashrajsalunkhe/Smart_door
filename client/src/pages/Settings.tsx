import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SwitchWithLabel } from "@/components/ui/switch-with-label";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Settings() {
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("user@example.com");
  
  // Recognition settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [snapshotStoragePolicy, setSnapshotStoragePolicy] = useState("unknown");
  const [autoDeletePolicy, setAutoDeletePolicy] = useState("90");
  const [skipBlurredImages, setSkipBlurredImages] = useState(true);
  const [autoDetectFrequentVisitors, setAutoDetectFrequentVisitors] = useState(true);
  
  // Camera settings
  const [cameraResolution, setCameraResolution] = useState("medium");
  const [trainingImageQuality, setTrainingImageQuality] = useState("enhanced");
  const [cameraFrameRate, setCameraFrameRate] = useState(24);
  
  // Account settings
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("********");
  
  // Get settings from backend
  const { isLoading } = useQuery({
    queryKey: ['/api/settings'],
    onSuccess: (data) => {
      // Set all state variables from retrieved settings
      setEmailNotifications(data.notifications.email);
      setBrowserNotifications(data.notifications.browser);
      setSmsNotifications(data.notifications.sms);
      setNotificationEmail(data.notifications.emailAddress);
      
      setConfidenceThreshold(data.recognition.confidenceThreshold);
      setSnapshotStoragePolicy(data.recognition.snapshotStoragePolicy);
      setAutoDeletePolicy(data.recognition.autoDeletePolicy);
      setSkipBlurredImages(data.recognition.skipBlurredImages);
      setAutoDetectFrequentVisitors(data.recognition.autoDetectFrequentVisitors);
      
      setCameraResolution(data.camera.resolution);
      setTrainingImageQuality(data.camera.trainingImageQuality);
      setCameraFrameRate(data.camera.frameRate);
      
      setName(data.account.name);
      setEmail(data.account.email);
    }
  });
  
  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (settings: any) => {
      await apiRequest('POST', '/api/settings', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      alert("Settings saved successfully!");
    }
  });
  
  // Handle save settings
  const saveSettings = () => {
    const settings = {
      notifications: {
        email: emailNotifications,
        browser: browserNotifications,
        sms: smsNotifications,
        emailAddress: notificationEmail
      },
      recognition: {
        confidenceThreshold,
        snapshotStoragePolicy,
        autoDeletePolicy,
        skipBlurredImages,
        autoDetectFrequentVisitors
      },
      camera: {
        resolution: cameraResolution,
        trainingImageQuality,
        frameRate: cameraFrameRate
      },
      account: {
        name,
        email,
        password: password === "********" ? undefined : password
      }
    };
    
    saveMutation.mutate(settings);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-8">Loading settings...</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your Smart Doorbell System preferences</p>
      </div>
      
      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Notification Settings</h2>
          </div>
          <CardContent className="p-4 space-y-4">
            <SwitchWithLabel
              id="email-notifications"
              label="Email Notifications"
              description="Receive alerts via email when unknown visitors are detected"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
            
            <SwitchWithLabel
              id="browser-notifications"
              label="Browser Notifications"
              description="Show desktop notifications when viewing the dashboard"
              checked={browserNotifications}
              onCheckedChange={setBrowserNotifications}
            />
            
            <SwitchWithLabel
              id="sms-notifications"
              label="SMS Notifications"
              description="Get text alerts for unknown visitors (SMS charges may apply)"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
            
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notification Email Address
              </label>
              <Input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Recognition Settings */}
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Recognition Settings</h2>
          </div>
          <CardContent className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Face Recognition Confidence Threshold
              </label>
              <div className="flex items-center">
                <Slider
                  min={50}
                  max={95}
                  step={1}
                  value={[confidenceThreshold]}
                  onValueChange={(values) => setConfidenceThreshold(values[0])}
                  className="w-full"
                />
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                  {confidenceThreshold}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Higher values reduce false positives but may not recognize faces at unusual angles
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Snapshot Storage Policy
                </label>
                <Select
                  value={snapshotStoragePolicy}
                  onValueChange={setSnapshotStoragePolicy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Store all snapshots</SelectItem>
                    <SelectItem value="unknown">Store unknown visitors only</SelectItem>
                    <SelectItem value="known">Store known visitors only</SelectItem>
                    <SelectItem value="none">Don't store snapshots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-Delete Old Snapshots
                </label>
                <Select
                  value={autoDeletePolicy}
                  onValueChange={setAutoDeletePolicy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select auto-delete policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never auto-delete</SelectItem>
                    <SelectItem value="30">After 30 days</SelectItem>
                    <SelectItem value="90">After 90 days</SelectItem>
                    <SelectItem value="365">After 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Checkbox
                  id="quality-check"
                  checked={skipBlurredImages}
                  onCheckedChange={(checked) => setSkipBlurredImages(checked as boolean)}
                />
                <label htmlFor="quality-check" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Skip blurred or low-quality images during face training
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox
                  id="auto-detect"
                  checked={autoDetectFrequentVisitors}
                  onCheckedChange={(checked) => setAutoDetectFrequentVisitors(checked as boolean)}
                />
                <label htmlFor="auto-detect" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Automatically detect and suggest adding unknown frequent visitors
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Camera Settings */}
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Camera Settings</h2>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera Resolution
                </label>
                <Select
                  value={cameraResolution}
                  onValueChange={setCameraResolution}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (640x480) - Better performance</SelectItem>
                    <SelectItem value="medium">Medium (1280x720) - Balanced</SelectItem>
                    <SelectItem value="high">High (1920x1080) - Better quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Training Image Quality
                </label>
                <Select
                  value={trainingImageQuality}
                  onValueChange={setTrainingImageQuality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (50 images)</SelectItem>
                    <SelectItem value="enhanced">Enhanced (75 images)</SelectItem>
                    <SelectItem value="maximum">Maximum (100+ images)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Camera Frame Rate
              </label>
              <div className="flex items-center">
                <Slider
                  min={15}
                  max={30}
                  step={1}
                  value={[cameraFrameRate]}
                  onValueChange={(values) => setCameraFrameRate(values[0])}
                  className="w-full"
                />
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                  {cameraFrameRate} fps
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lower frame rates improve performance on slower devices
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Account Settings</h2>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave unchanged to keep current password"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={saveSettings}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
