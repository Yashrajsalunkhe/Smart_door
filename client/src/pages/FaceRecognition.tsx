import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Camera, X, User } from "lucide-react";
import { setupWebcam, stopWebcam, captureSnapshot } from "@/lib/webcam";
import { detectFaces, saveDetectionToHistory, DetectedFace } from "@/lib/face-recognition";

export default function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null);
  const [alertOnUnknown, setAlertOnUnknown] = useState(true);
  const [saveUnknown, setSaveUnknown] = useState(true);
  const [saveKnown, setSaveKnown] = useState(false);
  
  // Set up webcam on component mount
  useEffect(() => {
    async function initWebcam() {
      const newStream = await setupWebcam(videoRef.current, {
        width: 1280,
        height: 720
      });
      
      if (newStream) {
        setStream(newStream);
        setIsDetecting(true);
      }
    }

    initWebcam();
    
    // Clean up on unmount
    return () => {
      stopWebcam(videoRef.current);
      setIsDetecting(false);
    };
  }, []);
  
  // Face detection loop
  useEffect(() => {
    let animationId: number;
    let lastDetectionTime = 0;
    
    async function detectFrame() {
      if (!videoRef.current || !isDetecting || !stream) {
        animationId = requestAnimationFrame(detectFrame);
        return;
      }
      
      const now = Date.now();
      // Only run detection every 500ms to reduce CPU usage
      if (now - lastDetectionTime > 500) {
        lastDetectionTime = now;
        
        try {
          const detectedFaces = await detectFaces(
            videoRef.current,
            confidenceThreshold / 100
          );
          
          if (detectedFaces.length > 0) {
            setDetectedFace(detectedFaces[0]);
            
            // If we detected an unknown face and alertOnUnknown is enabled, save it
            if (!detectedFaces[0].isKnown && alertOnUnknown) {
              const snapshot = captureSnapshot(videoRef.current);
              if (snapshot && saveUnknown) {
                // Save the detection to history
                await saveDetectionToHistory(snapshot, detectedFaces[0], 'locked');
              }
            }
            
            // If we detected a known face and saveKnown is enabled, save it
            if (detectedFaces[0].isKnown && saveKnown) {
              const snapshot = captureSnapshot(videoRef.current);
              if (snapshot) {
                await saveDetectionToHistory(snapshot, detectedFaces[0], 'unlocked');
              }
            }
            
            // Draw detection on canvas
            drawDetections(detectedFaces);
          } else {
            clearCanvas();
            setDetectedFace(null);
          }
        } catch (error) {
          console.error("Error detecting faces:", error);
        }
      }
      
      animationId = requestAnimationFrame(detectFrame);
    }
    
    // Start detection loop
    animationId = requestAnimationFrame(detectFrame);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isDetecting, stream, confidenceThreshold, alertOnUnknown, saveUnknown, saveKnown]);
  
  // Draw detected faces on canvas
  function drawDetections(faces: DetectedFace[]) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const displaySize = { 
      width: video.videoWidth, 
      height: video.videoHeight 
    };
    
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each face box
    faces.forEach(face => {
      const { x, y, width, height } = face.detection.box;
      
      // Draw rectangle
      ctx.strokeStyle = face.isKnown ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      const confidence = (face.confidence * 100).toFixed(0);
      const label = `${face.name} (${confidence}%)`;
      
      ctx.fillStyle = face.isKnown ? '#3b82f6' : '#ef4444';
      ctx.fillRect(x, y - 30, ctx.measureText(label).width + 10, 30);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(label, x + 5, y - 10);
    });
  }
  
  // Clear canvas
  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // Take a manual snapshot
  async function takeSnapshot() {
    if (!videoRef.current) return;
    
    const snapshot = captureSnapshot(videoRef.current);
    if (snapshot) {
      await saveDetectionToHistory(snapshot, detectedFace, 'locked');
    }
  }
  
  // Toggle camera
  async function toggleCamera() {
    if (stream) {
      stopWebcam(videoRef.current);
      setStream(null);
      setIsDetecting(false);
    } else {
      const newStream = await setupWebcam(videoRef.current, {
        width: 1280,
        height: 720
      });
      
      if (newStream) {
        setStream(newStream);
        setIsDetecting(true);
      }
    }
  }
  
  return (
    <div className="p-4 md:p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Face Recognition</h1>
        <p className="text-gray-600 dark:text-gray-400">Live monitoring and visitor identification</p>
      </div>
      
      {/* Live Feed Container */}
      <Card className="mb-6">
        <div className="relative">
          {/* Camera Feed */}
          <div className="bg-gray-900 relative" style={{ height: '450px' }}>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {/* Show a message if no webcam is active */}
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Camera feed will appear here</p>
                  <Button onClick={toggleCamera} className="mt-4">
                    Start Camera
                  </Button>
                </div>
              </div>
            )}
            
            {/* Camera Controls Overlay */}
            {stream && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <Button 
                  onClick={takeSnapshot} 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full w-12 h-12"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={toggleCamera} 
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full w-12 h-12"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            )}
            
            {/* Status Indicator */}
            {stream && (
              <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 rounded-full px-3 py-1 text-sm text-white flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2 pulse"></span>
                <span>Live</span>
              </div>
            )}
          </div>
          
          {/* Recognition Info */}
          <CardContent className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary mr-3">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">
                      {detectedFace 
                        ? detectedFace.name 
                        : "No Faces Detected"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {detectedFace 
                      ? (detectedFace.isKnown ? "Known person" : "Unknown visitor") 
                      : "Waiting for visitors..."}
                  </p>
                </div>
              </div>
              <div>
                {detectedFace && (
                  <span className={`${
                    detectedFace.isKnown ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'
                  } text-xs font-medium py-1 px-2 rounded-md`}>
                    Confidence: {(detectedFace.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      
      {/* Recognition Settings */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-4">Recognition Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confidence Threshold
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
                Minimum confidence level for identification
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Settings
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="alert-unknown" 
                    checked={alertOnUnknown}
                    onCheckedChange={(checked) => setAlertOnUnknown(checked as boolean)}
                  />
                  <label htmlFor="alert-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Alert on unknown visitors
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="save-unknown" 
                    checked={saveUnknown}
                    onCheckedChange={(checked) => setSaveUnknown(checked as boolean)}
                  />
                  <label htmlFor="save-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Save unknown visitor snapshots
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="save-known" 
                    checked={saveKnown}
                    onCheckedChange={(checked) => setSaveKnown(checked as boolean)}
                  />
                  <label htmlFor="save-known" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Save known visitor snapshots
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
