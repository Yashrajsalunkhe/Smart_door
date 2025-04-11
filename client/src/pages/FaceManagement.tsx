import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Camera, User, Pencil, Trash2, SearchIcon } from "lucide-react";
import { setupWebcam, stopWebcam, captureSnapshot } from "@/lib/webcam";
import { trainFaceProfile } from "@/lib/face-recognition";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function FaceManagement() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [captureAmount, setCaptureAmount] = useState("50");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch face profiles
  const { data: faceProfiles, isLoading } = useQuery({
    queryKey: ['/api/faces'],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/faces/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faces'] });
    }
  });
  
  // Set up webcam when component mounts
  useEffect(() => {
    async function initWebcam() {
      const newStream = await setupWebcam(videoRef.current, {
        width: 640,
        height: 480
      });
      
      if (newStream) {
        setStream(newStream);
      }
    }
    
    initWebcam();
    
    // Clean up on unmount
    return () => {
      stopWebcam(videoRef.current);
      setIsCapturing(false);
    };
  }, []);
  
  // Handle image capture process
  useEffect(() => {
    let captureInterval: ReturnType<typeof setInterval>;
    let timerInterval: ReturnType<typeof setInterval>;
    
    if (isCapturing) {
      const totalImages = parseInt(captureAmount);
      const totalDuration = totalImages === 50 ? 15 : totalImages === 75 ? 20 : 30; // seconds
      const intervalTime = (totalDuration * 1000) / totalImages;
      
      setCapturedImages([]);
      setCaptureProgress(0);
      setTimeRemaining(totalDuration);
      
      // Timer countdown
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Capture images at regular intervals
      captureInterval = setInterval(() => {
        if (!videoRef.current) return;
        
        // Take a snapshot
        const snapshot = captureSnapshot(videoRef.current);
        if (snapshot) {
          setCapturedImages(prev => [...prev, snapshot]);
          setCaptureProgress(prev => {
            const newProgress = prev + (100 / totalImages);
            
            // Stop when we reach 100%
            if (newProgress >= 100) {
              setIsCapturing(false);
              clearInterval(captureInterval);
              clearInterval(timerInterval);
            }
            
            return newProgress;
          });
        }
      }, intervalTime);
    }
    
    return () => {
      clearInterval(captureInterval);
      clearInterval(timerInterval);
    };
  }, [isCapturing, captureAmount]);
  
  // Start face capture process
  const startCapture = () => {
    if (!name) {
      alert("Please enter a name first");
      return;
    }
    
    if (!stream) {
      alert("Camera is not initialized");
      return;
    }
    
    setIsCapturing(true);
  };
  
  // Cancel capture process
  const cancelCapture = () => {
    setIsCapturing(false);
    setCapturedImages([]);
    setCaptureProgress(0);
  };
  
  // Save the captured face profile
  const saveFaceProfile = async () => {
    if (capturedImages.length === 0) {
      alert("No images captured");
      return;
    }
    
    const result = await trainFaceProfile(name, relationship, capturedImages);
    
    if (result) {
      // Reset form
      setName("");
      setRelationship("");
      setCapturedImages([]);
      setCaptureProgress(0);
      alert("Face profile added successfully!");
    } else {
      alert("Failed to add face profile. Please try again.");
    }
  };
  
  // Delete a face profile
  const deleteFaceProfile = async (id: number) => {
    if (confirm("Are you sure you want to delete this face profile?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Filter face profiles based on search query
  const filteredProfiles = faceProfiles
    ? faceProfiles.filter((profile: any) => 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.relationship.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  
  return (
    <div className="p-4 md:p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Face Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Add, edit or remove faces from the recognition database</p>
      </div>
      
      {/* Face Adding Section */}
      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Add New Face</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Capture multiple images for better recognition accuracy</p>
        </div>
        
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Camera Preview */}
            <div className="flex-1">
              <div className="bg-gray-900 rounded-lg overflow-hidden relative" style={{ height: '300px' }}>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Face Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-primary rounded-full opacity-50"></div>
                
                {/* Show placeholder if no webcam stream */}
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4" />
                      <p>Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Capture Form */}
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Person Name
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Enter name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship/Notes
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Family member, friend, etc." 
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capture Settings
                  </label>
                  <div className="flex items-center">
                    <div className="flex-1 mr-4">
                      <Select 
                        value={captureAmount}
                        onValueChange={setCaptureAmount}
                        disabled={isCapturing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select capture amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50 images (15 sec)</SelectItem>
                          <SelectItem value="75">75 images (20 sec)</SelectItem>
                          <SelectItem value="100">100 images (30 sec)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={isCapturing ? cancelCapture : startCapture}
                      variant={isCapturing ? "destructive" : "default"}
                      disabled={!stream}
                    >
                      {isCapturing ? "Cancel" : "Start Capture"}
                    </Button>
                  </div>
                </div>
                
                {/* Capture Progress */}
                {isCapturing && (
                  <div>
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capturing Images...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {capturedImages.length} / {captureAmount}
                      </span>
                    </div>
                    <Progress value={captureProgress} />
                    <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Time remaining: {timeRemaining} seconds</span>
                      <button 
                        className="text-red-500 hover:text-red-600 transition"
                        onClick={cancelCapture}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Save button only appears when images are captured */}
                {capturedImages.length > 0 && !isCapturing && (
                  <Button 
                    className="w-full"
                    onClick={saveFaceProfile}
                  >
                    Save Face Profile ({capturedImages.length} images)
                  </Button>
                )}
                
                <div className="pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-block mr-1 text-primary">ℹ️</span>
                    For best results, capture in good lighting with multiple angles and expressions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Face Database */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Face Database</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search database"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Loading face profiles...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No matching face profiles found" : "No face profiles added yet"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile: any) => (
                <div key={profile.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="p-3 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{profile.relationship}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => deleteFaceProfile(profile.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>Added {new Date(profile.dateAdded).toLocaleDateString()}</span>
                      <span>{profile.imageCount} training images</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
