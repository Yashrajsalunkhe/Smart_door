import React, { useEffect, useRef, useState } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { useFaceRecognition } from '@/hooks/use-face-recognition';
import { Person } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDoorbellContext } from '@/context/DoorbellContext';
import DetectionOverlay from './DetectionOverlay';
import { Button } from '@/components/ui/button';

const CameraFeed = () => {
  const { settings } = useDoorbellContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectionActive, setDetectionActive] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [recognizedPerson, setRecognizedPerson] = useState<Person | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isUnknown, setIsUnknown] = useState(false);
  const activeTimer = useRef<NodeJS.Timeout | null>(null);

  // Setup webcam
  const { isReady, error, startCamera, stopCamera, attachVideo } = useWebcam({
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    onError: (err) => console.error('Webcam error:', err)
  });

  // Setup face recognition
  const { isModelLoaded, detection } = useFaceRecognition({
    videoRef,
    onFaceDetected: (face, person) => {
      if (person) {
        setRecognizedPerson(person);
        // Calculate confidence based on distance (1 - distance)
        const matchConfidence = Math.round(settings.recognition.confidenceThreshold * 100);
        setConfidence(matchConfidence);
        setIsUnknown(false);
      }
    },
    onUnknownFace: () => {
      setRecognizedPerson(null);
      setConfidence(0);
      setIsUnknown(true);
    },
    confidenceThreshold: settings.recognition.confidenceThreshold / 100,
    enabled: detectionActive && isReady
  });

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
      if (activeTimer.current) {
        clearInterval(activeTimer.current);
      }
    };
  }, []);

  // Attach video element reference when it's available
  useEffect(() => {
    if (videoRef.current) {
      attachVideo(videoRef.current);
    }
  }, [videoRef.current, attachVideo]);

  // Handle detection timer
  useEffect(() => {
    if (detectionActive) {
      activeTimer.current = setInterval(() => {
        setActiveSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (activeTimer.current) {
        clearInterval(activeTimer.current);
        activeTimer.current = null;
      }
      setActiveSeconds(0);
    }

    return () => {
      if (activeTimer.current) {
        clearInterval(activeTimer.current);
      }
    };
  }, [detectionActive]);

  const toggleDetection = () => {
    setDetectionActive(prev => !prev);
    if (!detectionActive) {
      setRecognizedPerson(null);
      setConfidence(0);
      setIsUnknown(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const reportSuspiciousActivity = () => {
    // In a real app, this would trigger an alert or notification
    console.log('Suspicious activity reported');
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="relative rounded-lg overflow-hidden" style={{ height: '450px' }}>
        {/* Video element for the webcam feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: isReady ? 'block' : 'none' }}
        />
        
        {/* Loading state when webcam is not ready */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <span className="material-icons text-4xl animate-spin text-[#3B82F6]">hourglass_top</span>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Initializing camera...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-col items-center max-w-md text-center">
              <span className="material-icons text-4xl text-red-500">error</span>
              <p className="mt-4 text-gray-700 dark:text-gray-300">{error}</p>
              <Button
                onClick={() => startCamera()}
                className="mt-4 bg-[#3B82F6]"
              >
                Retry Camera Access
              </Button>
            </div>
          </div>
        )}
        
        {/* Canvas for drawing face detection overlays */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ display: detectionActive ? 'block' : 'none' }}
        />
        
        {/* Detection overlay */}
        {detectionActive && isReady && (
          <DetectionOverlay 
            person={recognizedPerson} 
            isUnknown={isUnknown}
            confidence={confidence}
          />
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
          <StatusBadge 
            status={detectionActive ? 'online' : 'offline'} 
            label={detectionActive ? 'Scanning' : 'Standby'}
            pulseAnimation={detectionActive}
          />
          {detectionActive && (
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              Active for <span className="font-medium">{formatTime(activeSeconds)}</span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleDetection}
            variant={detectionActive ? "destructive" : "default"}
            className={detectionActive ? "" : "bg-[#3B82F6]"}
          >
            <span className="material-icons text-sm mr-1">
              {detectionActive ? 'stop' : 'play_arrow'}
            </span>
            {detectionActive ? 'Stop Detection' : 'Start Detection'}
          </Button>
          {detectionActive && (
            <Button
              onClick={reportSuspiciousActivity}
              variant="destructive"
            >
              <span className="material-icons text-sm mr-1">report</span>
              Report Suspicious Activity
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
