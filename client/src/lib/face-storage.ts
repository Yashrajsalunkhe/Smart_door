import { Person, Detection } from '@/types';

const STORAGE_KEYS = {
  PEOPLE: 'doorbell-people',
  DETECTIONS: 'doorbell-detections'
};

export const savePeopleToLocalStorage = (people: Person[]): void => {
  try {
    // Convert Float32Array descriptor to Array before serializing
    const serializable = people.map(person => ({
      ...person,
      descriptor: person.descriptor ? Array.from(person.descriptor) : undefined
    }));
    
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving people to localStorage:', error);
  }
};

export const loadPeopleFromLocalStorage = (): Person[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!data) return [];
    
    const people = JSON.parse(data);
    
    // Convert Array descriptor back to Float32Array
    return people.map((person: any) => ({
      ...person,
      descriptor: person.descriptor ? new Float32Array(person.descriptor) : undefined
    }));
  } catch (error) {
    console.error('Error loading people from localStorage:', error);
    return [];
  }
};

export const saveDetectionsToLocalStorage = (detections: Detection[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(detections));
  } catch (error) {
    console.error('Error saving detections to localStorage:', error);
  }
};

export const loadDetectionsFromLocalStorage = (): Detection[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading detections from localStorage:', error);
    return [];
  }
};

export const clearLocalStorageData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PEOPLE);
    localStorage.removeItem(STORAGE_KEYS.DETECTIONS);
  } catch (error) {
    console.error('Error clearing localStorage data:', error);
  }
};

// Helper functions for base64 image compression
export const compressImage = (base64Image: string, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = base64Image;
  });
};

// Limit the number of images per person to save storage space
export const prunePersonImages = (images: string[], maxImages = 50): Promise<string[]> => {
  if (images.length <= maxImages) {
    return Promise.resolve(images);
  }
  
  // Keep the most recent images up to maxImages
  const prunedImages = images.slice(-maxImages);
  
  // Compress the remaining images
  return Promise.all(
    prunedImages.map(img => compressImage(img, 0.5))
  );
};
