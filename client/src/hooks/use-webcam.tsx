import { useState, useEffect, useRef } from 'react';

interface UseWebcamProps {
  videoConstraints?: MediaTrackConstraints;
  onError?: (error: string) => void;
}

export const useWebcam = ({ videoConstraints, onError }: UseWebcamProps = {}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const defaultConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  };

  const constraints = videoConstraints || defaultConstraints;

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false
      });
      
      setStream(newStream);
      setIsReady(true);
      setError(null);
      return newStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return null;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsReady(false);
    }
  };

  const captureImage = (): string | null => {
    if (!videoRef.current || !isReady) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const attachVideo = (video: HTMLVideoElement) => {
    if (!video) return;
    
    videoRef.current = video;
    
    if (stream && video) {
      video.srcObject = stream;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef.current]);

  return {
    stream,
    isReady,
    error,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    attachVideo
  };
};
