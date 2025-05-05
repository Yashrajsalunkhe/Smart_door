import * as faceapi from 'face-api.js';
import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

// Types for the face recognition system
import { Face } from '@/types';

export interface FaceData extends Face {
  descriptor: number[];
}

export interface DetectedFace {
  detection: faceapi.FaceDetection;
  name: string;
  confidence: number;
  isKnown: boolean;
}

let facesMatcher: faceapi.FaceMatcher | null = null;
let initialized = false;
let initializingPromise: Promise<boolean> | null = null;

// Initialize face-api.js and load models
export async function initFaceRecognition(): Promise<boolean> {
  if (initialized) return true;
  if (initializingPromise) return initializingPromise;
  initializingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1')
      ]);
      
      // Load saved face data
      await loadFaceProfiles();
      
      initialized = true;
      initializingPromise = null;
      return true;
    } catch (error) {
      console.error('Failed to initialize face recognition:', error);
      initializingPromise = null;
      return false;
    }
  })();
  return initializingPromise;
}

// Load saved face profiles from the backend
export async function loadFaceProfiles(): Promise<FaceData[]> {
  try {
    const response = await apiRequest('GET', '/api/faces', undefined);
    const faceProfiles: FaceData[] = await response.json();
    
    if (faceProfiles.length > 0) {
      const labeledDescriptors = faceProfiles.map(face => {
        // Convert descriptor array to Float32Array for face-api.js
        const descriptorArr = Array.isArray(face.descriptor)
          ? new Float32Array(face.descriptor)
          : new Float32Array(Object.values(face.descriptor));
        return new faceapi.LabeledFaceDescriptors(
          face.name, 
          [descriptorArr]
        );
      });
      
      facesMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    }
    
    return faceProfiles;
  } catch (error) {
    console.error('Failed to load face profiles:', error);
    return [];
  }
}

// Detect faces in the given image/video element
export async function detectFaces(
  element: HTMLVideoElement | HTMLImageElement,
  confidenceThreshold: number = 0.75
): Promise<DetectedFace[]> {
  if (!initialized) await initFaceRecognition();
  
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const detections = await faceapi.detectAllFaces(element, options)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (!detections.length) return [];
    
    // If we have no saved faces, return unknown faces
    if (!facesMatcher) {
      return detections.map(d => ({
        detection: d.detection,
        name: 'Unknown',
        confidence: 0,
        isKnown: false
      }));
    }
    
    // Match detected faces with known faces
    return detections.map(d => {
      const match = facesMatcher!.findBestMatch(d.descriptor);
      const isKnown = match.label !== 'unknown' && match.distance < (1 - confidenceThreshold);
      
      return {
        detection: d.detection,
        name: isKnown ? match.label : 'Unknown',
        confidence: 1 - match.distance,
        isKnown
      };
    });
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
}

// Add a new face profile with multiple sample images
export async function trainFaceProfile(
  name: string,
  relationship: string,
  faceImages: string[]
): Promise<boolean> {
  if (!initialized) await initFaceRecognition();
  
  try {
    // Create descriptors for all sample images
    const descriptors: Float32Array[] = [];
    
    for (const imageData of faceImages) {
      const img = await createImageElement(imageData);
      
      const detections = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detections) {
        descriptors.push(detections.descriptor);
      }
      
      // Clean up
      img.remove();
    }
    
    if (descriptors.length === 0) {
      throw new Error('No valid face found in the provided images');
    }
    
    // Average the descriptors for more robust recognition
    const averageDescriptor = averageDescriptors(descriptors);
    
    // Send face data to backend
    const faceData = {
      name,
      relationship,
      descriptor: Array.from(averageDescriptor),
      imageCount: faceImages.length,
      dateAdded: new Date().toISOString()
    };
    
    await apiRequest('POST', '/api/faces', faceData);
    
    // Reload face profiles
    await loadFaceProfiles();
    queryClient.invalidateQueries({ queryKey: ['/api/faces'] });
    
    return true;
  } catch (error) {
    console.error('Error training face profile:', error);
    return false;
  }
}

// Helper to create an image element from data URL
function createImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
    document.body.appendChild(img);
    img.style.display = 'none';
  });
}

// Average multiple face descriptors for better recognition
function averageDescriptors(descriptors: Float32Array[]): Float32Array {
  const result = new Float32Array(128);
  
  for (let i = 0; i < result.length; i++) {
    let sum = 0;
    for (const descriptor of descriptors) {
      sum += descriptor[i];
    }
    result[i] = sum / descriptors.length;
  }
  
  return result;
}

// Save a detection event to history
export async function saveDetectionToHistory(
  imageData: string,
  detectedFace: DetectedFace | null,
  doorStatus: 'locked' | 'unlocked'
): Promise<void> {
  try {
    const historyEntry = {
      snapshot: imageData,
      personName: detectedFace?.name || 'Unknown',
      isKnown: detectedFace?.isKnown || false,
      confidence: detectedFace?.confidence || 0,
      timestamp: new Date().toISOString(),
      doorStatus
    };
    
    await apiRequest('POST', '/api/history', historyEntry);
    queryClient.invalidateQueries({ queryKey: ['/api/history'] });
  } catch (error) {
    console.error('Error saving detection to history:', error);
  }
}
