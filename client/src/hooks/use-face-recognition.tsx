import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { Person, Detection } from '@/types';
import { loadModels } from '@/lib/face-api';

interface UseFaceRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected?: (face: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>, person?: Person) => void;
  onUnknownFace?: (face: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>) => void;
  confidenceThreshold?: number;
  enabled?: boolean;
}

export const useFaceRecognition = ({
  videoRef,
  onFaceDetected,
  onUnknownFace,
  confidenceThreshold = 0.75,
  enabled = true
}: UseFaceRecognitionProps) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const requestRef = useRef<number | null>(null);
  const { people, addDetection } = useDoorbellContext();

  // Load face-api.js models
  useEffect(() => {
    const load = async () => {
      await loadModels();
      setIsModelLoaded(true);
    };
    load();
  }, []);

  // Build face matcher when people change
  useEffect(() => {
    if (!isModelLoaded || people.length === 0) return;

    const buildFaceMatcher = async () => {
      try {
        const labeledDescriptors = await Promise.all(
          people.map(async (person) => {
            // Skip people without descriptors
            if (!person.descriptor) {
              return null;
            }
            
            // Convert string descriptor back to Float32Array if needed
            const descriptor = Array.isArray(person.descriptor) 
              ? new Float32Array(person.descriptor) 
              : person.descriptor;
            
            return new faceapi.LabeledFaceDescriptors(
              person.id,
              [descriptor]
            );
          })
        );

        // Filter out null values
        const validDescriptors = labeledDescriptors.filter(desc => desc !== null) as faceapi.LabeledFaceDescriptors[];
        
        if (validDescriptors.length > 0) {
          const matcher = new faceapi.FaceMatcher(validDescriptors, confidenceThreshold);
          setFaceMatcher(matcher);
        }
      } catch (error) {
        console.error('Error building face matcher:', error);
      }
    };

    buildFaceMatcher();
  }, [isModelLoaded, people, confidenceThreshold]);

  // Start/stop detection loop
  useEffect(() => {
    if (!isModelLoaded || !enabled || !videoRef.current || !videoRef.current.readyState || videoRef.current.readyState < 2) {
      return;
    }

    const detectFaces = async () => {
      if (!videoRef.current || isProcessing) return;

      setIsProcessing(true);

      try {
        await loadModels();
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          const detection = detections[0]; // Use the first detected face

          if (faceMatcher) {
            const match = faceMatcher.findBestMatch(detection.descriptor);
            
            if (match && match.label !== 'unknown') {
              const person = people.find(p => p.id === match.label);
              
              if (person) {
                const detectionData: Omit<Detection, 'id'> = {
                  personId: person.id,
                  personName: person.name,
                  timestamp: new Date().toISOString(),
                  imageUrl: captureDetection(videoRef.current, detection.detection.box),
                  confidence: 1 - match.distance,
                  isKnown: true
                };
                
                const savedDetection = await addDetection(detectionData);
                setDetection(savedDetection);
                
                if (onFaceDetected) {
                  onFaceDetected(detection, person);
                }
              }
            } else {
              const detectionData: Omit<Detection, 'id'> = {
                personId: null,
                personName: null,
                timestamp: new Date().toISOString(),
                imageUrl: captureDetection(videoRef.current, detection.detection.box),
                confidence: 0,
                isKnown: false
              };
              
              const savedDetection = await addDetection(detectionData);
              setDetection(savedDetection);
              
              if (onUnknownFace) {
                onUnknownFace(detection);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during face detection:', error);
      } finally {
        setIsProcessing(false);
        requestRef.current = requestAnimationFrame(detectFaces);
      }
    };

    requestRef.current = requestAnimationFrame(detectFaces);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isModelLoaded, enabled, videoRef, faceMatcher, isProcessing, people, onFaceDetected, onUnknownFace]);

  // Capture the current detection as an image
  const captureDetection = (videoEl: HTMLVideoElement, box: faceapi.Box): string => {
    const canvas = document.createElement('canvas');
    
    // Make canvas slightly larger than the face box to include context
    const padding = Math.max(box.width, box.height) * 0.3;
    const x = Math.max(0, box.x - padding);
    const y = Math.max(0, box.y - padding);
    const width = Math.min(videoEl.videoWidth - x, box.width + padding * 2);
    const height = Math.min(videoEl.videoHeight - y, box.height + padding * 2);
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.drawImage(
      videoEl,
      x, y, width, height,  // Source rectangle
      0, 0, width, height   // Destination rectangle
    );
    
    return canvas.toDataURL('image/jpeg');
  };

  // Extract facial features for training
  const extractFaceDescriptor = async (imageUrl: string): Promise<Float32Array | null> => {
    if (!isModelLoaded) return null;

    try {
      await loadModels();
      const img = await faceapi.fetchImage(imageUrl);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection ? detection.descriptor : null;
    } catch (error) {
      console.error('Error extracting face descriptor:', error);
      return null;
    }
  };

  // Capture multiple face images for training
  const captureTrainingImages = async (
    count: number = 50,
    interval: number = 500
  ): Promise<string[]> => {
    if (!videoRef.current || !isModelLoaded) {
      return [];
    }
    await loadModels();

    const images: string[] = [];
    let capturedCount = 0;

    return new Promise((resolve) => {
      const capture = async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(videoRef.current!)
            .withFaceLandmarks();

          if (detections.length > 0) {
            const detection = detections[0]; // Use the first detected face
            const imageUrl = captureDetection(videoRef.current!, detection.detection.box);
            images.push(imageUrl);
            capturedCount++;
          }

          if (capturedCount < count) {
            setTimeout(capture, interval);
          } else {
            resolve(images);
          }
        } catch (error) {
          console.error('Error during training capture:', error);
          setTimeout(capture, interval);
        }
      };

      capture();
    });
  };

  return {
    isModelLoaded,
    detection,
    captureTrainingImages,
    extractFaceDescriptor
  };
};
