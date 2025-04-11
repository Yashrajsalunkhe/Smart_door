/**
 * This file serves as a bridge to face-api.js and handles initialization
 */
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// You need to host these models on your server or use a CDN
const MODEL_URL = '/models';

export const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return;
  
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face API models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    throw error;
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
