export interface Person {
  id: string;
  name: string;
  images: string[];
  createdAt: string;
  descriptor?: Float32Array;
}

export interface Detection {
  id: string;
  personId: string | null;
  personName: string | null;
  timestamp: string;
  imageUrl: string;
  confidence: number;
  isKnown: boolean;
}

export interface DoorbellSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  recognition: {
    confidenceThreshold: number;
    saveKnownFaces: boolean;
    filterLowQuality: boolean;
  };
  camera: {
    quality: 'low' | 'medium' | 'high';
    captureDuration: 15 | 30 | 45;
  };
}

export interface DoorStatus {
  isLocked: boolean;
  lastChanged: string;
}

export interface HistoryFilters {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  personFilter: string;
  searchTerm: string;
  sortOrder: 'newest' | 'oldest';
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  feelsLike: number;
}
