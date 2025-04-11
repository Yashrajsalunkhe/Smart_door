/**
 * This file serves as a bridge to face-api.js and handles initialization
 */
import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let modelLoadAttempted = false;

// Path to the face-api model files
const MODEL_URL = '/models';

// Handles model loading with proper error handling and retry mechanism
export const loadModels = async (forceReload = false): Promise<boolean> => {
  // If models are already loaded and no force reload, return early
  if (modelsLoaded && !forceReload) return true;
  
  // If we've already tried and failed before, only retry if forceReload
  if (modelLoadAttempted && !forceReload) return false;
  
  modelLoadAttempted = true;
  
  try {
    // Initiate server-side model setup
    try {
      const setupResponse = await fetch('/api/models/setup', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!setupResponse.ok) {
        console.warn('Warning: Server model setup may have failed. Attempting to load models anyway.');
      }
    } catch (setupError) {
      console.warn('Failed to set up models on server:', setupError);
    }
    
    // Try loading the models
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    // Alternative loading method in case the Promise.all approach fails
    try {
      if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
        await faceapi.nets.ssdMobilenetv1.load(MODEL_URL);
      }
      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
      }
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
      }
    } catch (fallbackError) {
      console.error('Fallback model loading failed:', fallbackError);
    }
    
    modelsLoaded = true;
    console.log('Face API models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    modelsLoaded = false;
    return false;
  }
};

export const detectFaces = async (
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]> => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  return faceapi
    .detectAllFaces(input)
    .withFaceLandmarks()
    .withFaceDescriptors();
};

export const createFaceMatcher = (
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  distanceThreshold = 0.6
): faceapi.FaceMatcher => {
  return new faceapi.FaceMatcher(labeledDescriptors, distanceThreshold);
};

export const matchFace = (
  descriptor: Float32Array,
  faceMatcher: faceapi.FaceMatcher
): { label: string; distance: number } => {
  return faceMatcher.findBestMatch(descriptor);
};

export const drawDetections = (
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceDetection<{}>[]
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, detections);
};

export const extractFaceFromImage = async (
  imageUrl: string
): Promise<{ descriptor: Float32Array | null; faceImage: string | null }> => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  try {
    const img = await faceapi.fetchImage(imageUrl);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      return { descriptor: null, faceImage: null };
    }
    
    // Extract face image
    const canvas = document.createElement('canvas');
    const box = detection.detection.box;
    
    // Add padding around face
    const padding = Math.max(box.width, box.height) * 0.2;
    const x = Math.max(0, box.x - padding);
    const y = Math.max(0, box.y - padding);
    const width = Math.min(img.width - x, box.width + padding * 2);
    const height = Math.min(img.height - y, box.height + padding * 2);
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { descriptor: detection.descriptor, faceImage: null };
    }
    
    ctx.drawImage(
      img,
      x, y, width, height,  // Source rectangle
      0, 0, width, height   // Destination rectangle
    );
    
    return {
      descriptor: detection.descriptor,
      faceImage: canvas.toDataURL('image/jpeg')
    };
  } catch (error) {
    console.error('Error extracting face:', error);
    return { descriptor: null, faceImage: null };
  }
};
