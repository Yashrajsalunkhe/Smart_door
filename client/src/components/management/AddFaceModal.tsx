import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWebcam } from '@/hooks/use-webcam';
import { useFaceRecognition } from '@/hooks/use-face-recognition';
import { useDoorbellContext } from '@/context/DoorbellContext';
import * as faceapi from 'face-api.js';
import { extractFaceFromImage } from '@/lib/face-api';

interface AddFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFaceModal: React.FC<AddFaceModalProps> = ({ isOpen, onClose }) => {
  const { settings, addPerson } = useDoorbellContext();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [captureCount, setCaptureCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(settings.camera.captureDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);

  const {
    isReady,
    error,
    startCamera,
    stopCamera,
    attachVideo,
    captureImage
  } = useWebcam({
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    onError: (err) => {
      toast({
        title: "Camera Error",
        description: err,
        variant: "destructive"
      });
    }
  });

  const { isModelLoaded, captureTrainingImages } = useFaceRecognition({
    videoRef,
    enabled: false,
  });

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setName('');
      setCapturedImages([]);
      setCaptureCount(0);
      setTimeRemaining(settings.camera.captureDuration);
      setCaptureInProgress(false);
      setDescriptor(null);
    } else {
      stopCamera();
      // Clean up intervals and timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen, settings.camera.captureDuration]);

  useEffect(() => {
    if (videoRef.current) {
      attachVideo(videoRef.current);
    }
  }, [videoRef.current, attachVideo]);

  const startCapture = async () => {
    if (!isReady || !isModelLoaded || !name.trim()) {
      toast({
        title: "Cannot start capture",
        description: !name.trim() 
          ? "Please enter a name first" 
          : !isModelLoaded 
            ? "Face recognition model is not loaded" 
            : "Camera is not ready",
        variant: "destructive"
      });
      return;
    }

    setCaptureInProgress(true);
    setCapturedImages([]);
    setCaptureCount(0);
    setTimeRemaining(settings.camera.captureDuration);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Capture images at intervals
    const targetCount = Math.floor(settings.camera.captureDuration * (1000 / 500)); // ~2 images per second
    let count = 0;
    const images: string[] = [];

    intervalRef.current = setInterval(() => {
      if (!videoRef.current || count >= targetCount) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Finish the capture process
        if (count > 0) {
          finishCapture(images);
        } else {
          setCaptureInProgress(false);
          toast({
            title: "Capture failed",
            description: "No faces were detected during the capture process.",
            variant: "destructive"
          });
        }
        return;
      }

      // Detect face and capture image
      const image = captureImage();
      if (image) {
        images.push(image);
        count++;
        setCaptureCount(count);
        setCapturedImages(prev => [...prev, image]);
      }
    }, 500);
  };

  const finishCapture = async (images: string[]) => {
    try {
      // Process the first image to get a face descriptor
      if (images.length > 0) {
        const { descriptor: faceDescriptor } = await extractFaceFromImage(images[0]);
        
        if (faceDescriptor) {
          setDescriptor(faceDescriptor);
          
          // At this point we would save the person with the descriptor
          toast({
            title: "Capture complete",
            description: `Successfully captured ${images.length} images for face training.`,
          });
        } else {
          toast({
            title: "Processing Warning",
            description: "Could not extract face features from the captured images.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error processing captured images:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the captured images.",
        variant: "destructive"
      });
    } finally {
      setCaptureInProgress(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for this person.",
        variant: "destructive"
      });
      return;
    }

    if (capturedImages.length === 0) {
      toast({
        title: "No Images",
        description: "Please capture images before saving.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create the new person record
      await addPerson({
        name: name.trim(),
        images: capturedImages,
        descriptor: descriptor || undefined
      });

      toast({
        title: "Person Added",
        description: `${name} has been added successfully.`,
      });

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: "Save Error",
        description: "An error occurred while saving the face data.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Face</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
              disabled={captureInProgress}
            />
          </div>
          
          <div>
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ height: '300px' }}>
              {/* Video element for the webcam feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Face alignment guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-dashed border-white rounded-full opacity-75"></div>
              </div>
              
              {/* Capture progress indicators */}
              {captureInProgress && (
                <>
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    <span>{captureCount}/{Math.floor(settings.camera.captureDuration * (1000 / 500))}</span> images captured
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    <span>{String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:{String(timeRemaining % 60).padStart(2, '0')}</span> remaining
                  </div>
                </>
              )}
              
              {/* Loading state when webcam is not ready */}
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-white text-center">
                    <span className="material-icons text-4xl animate-spin">hourglass_top</span>
                    <p className="mt-2">Initializing camera...</p>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-white text-center max-w-xs px-4">
                    <span className="material-icons text-4xl text-red-500">error</span>
                    <p className="mt-2">{error}</p>
                    <Button onClick={startCamera} className="mt-4 bg-[#3B82F6]">
                      Retry Camera Access
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {capturedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Face Data: {capturedImages.length} {capturedImages.length === 1 ? 'image' : 'images'} captured
              </p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {capturedImages.slice(0, 8).map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Captured face ${index + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                ))}
                {capturedImages.length > 8 && (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-300">+{capturedImages.length - 8} more</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Position face clearly in the center and remain still
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={captureInProgress}>
                Cancel
              </Button>
              {capturedImages.length === 0 ? (
                <Button 
                  onClick={startCapture} 
                  disabled={captureInProgress || !isReady || !isModelLoaded || !name.trim()}
                  className="bg-[#3B82F6]"
                >
                  {captureInProgress ? (
                    <>
                      <span className="material-icons animate-spin mr-2">hourglass_top</span>
                      Capturing...
                    </>
                  ) : 'Start Capture'}
                </Button>
              ) : (
                <Button 
                  onClick={handleSave} 
                  className="bg-[#3B82F6]"
                  disabled={captureInProgress}
                >
                  Save Person
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFaceModal;
