// Types matching backend schema (shared/schema.ts)
export interface Face {
  id: number;
  name: string;
  relationship: string;
  imageCount: number;
  dateAdded: string;
  descriptor: number[]; // always array for JSON, convert to Float32Array in memory
}

export interface HistoryEntry {
  id: number;
  personName: string;
  isKnown: boolean;
  confidence: number;
  timestamp: string;
  doorStatus: string;
  snapshot: string;
}

export interface Settings {
  id: number;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
    emailAddress: string;
  };
  recognition: {
    confidenceThreshold: number; // 0-1 float for face-api.js, UI can use 60-95 and convert
    snapshotStoragePolicy?: string;
    autoDeletePolicy?: string;
    skipBlurredImages?: boolean;
    autoDetectFrequentVisitors?: boolean;
  };
  camera: {
    resolution: string;
    trainingImageQuality?: string;
    frameRate?: number;
  };
  account: {
    name: string;
    email: string;
    // password: string; // never expose password in frontend
  };
}

export interface DoorStatus {
  id: number;
  status: string;
  lastUpdated: string;
}
