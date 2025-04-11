import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Person, Detection, DoorbellSettings, DoorStatus, WeatherInfo } from '../types';

interface DoorbellContextType {
  people: Person[];
  detections: Detection[];
  settings: DoorbellSettings;
  doorStatus: DoorStatus;
  weatherInfo: WeatherInfo;
  lastDetection: Detection | null;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<Person>;
  deletePerson: (id: string) => Promise<void>;
  addDetection: (detection: Omit<Detection, 'id'>) => Promise<Detection>;
  updateSettings: (newSettings: Partial<DoorbellSettings>) => void;
  toggleDoorLock: () => Promise<DoorStatus>;
  isLoading: boolean;
}

const defaultSettings: DoorbellSettings = {
  notifications: {
    email: false,
    browser: true,
    mobile: true,
  },
  recognition: {
    confidenceThreshold: 75,
    saveKnownFaces: false,
    filterLowQuality: true,
  },
  camera: {
    quality: 'medium',
    captureDuration: 30,
  },
};

const defaultDoorStatus: DoorStatus = {
  isLocked: true,
  lastChanged: new Date().toISOString(),
};

const defaultWeatherInfo: WeatherInfo = {
  temperature: 72,
  condition: 'Sunny',
  feelsLike: 75,
};

const DoorbellContext = createContext<DoorbellContextType | undefined>(undefined);

export const DoorbellProvider = ({ children }: { children: ReactNode }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [settings, setSettings] = useState<DoorbellSettings>(defaultSettings);
  const [doorStatus, setDoorStatus] = useState<DoorStatus>(defaultDoorStatus);
  const [weatherInfo] = useState<WeatherInfo>(defaultWeatherInfo);
  const [isLoading, setIsLoading] = useState(true);
  
  const lastDetection = detections.length > 0 
    ? detections.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load people
        const peopleResponse = await fetch('/api/people');
        if (peopleResponse.ok) {
          const peopleData = await peopleResponse.json();
          setPeople(peopleData);
        }

        // Load detections
        const detectionsResponse = await fetch('/api/detections');
        if (detectionsResponse.ok) {
          const detectionsData = await detectionsResponse.json();
          setDetections(detectionsData);
        }

        // Load settings
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }

        // Load door status
        const doorResponse = await fetch('/api/door/status');
        if (doorResponse.ok) {
          const doorData = await doorResponse.json();
          setDoorStatus(doorData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addPerson = async (personData: Omit<Person, 'id' | 'createdAt'>): Promise<Person> => {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      });
      
      if (!response.ok) throw new Error('Failed to add person');
      
      const newPerson = await response.json();
      setPeople(prev => [...prev, newPerson]);
      return newPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>): Promise<Person> => {
    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update person');
      
      const updatedPerson = await response.json();
      setPeople(prev => prev.map(p => p.id === id ? updatedPerson : p));
      return updatedPerson;
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  };

  const deletePerson = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete person');
      
      setPeople(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  };

  const addDetection = async (detectionData: Omit<Detection, 'id'>): Promise<Detection> => {
    try {
      const response = await fetch('/api/detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detectionData),
      });
      
      if (!response.ok) throw new Error('Failed to add detection');
      
      const newDetection = await response.json();
      setDetections(prev => [newDetection, ...prev]);
      return newDetection;
    } catch (error) {
      console.error('Error adding detection:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<DoorbellSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const toggleDoorLock = async (): Promise<DoorStatus> => {
    try {
      const response = await fetch('/api/door/toggle', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to toggle door');
      
      const newStatus = await response.json();
      setDoorStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Error toggling door:', error);
      throw error;
    }
  };

  return (
    <DoorbellContext.Provider
      value={{
        people,
        detections,
        settings,
        doorStatus,
        weatherInfo,
        lastDetection,
        addPerson,
        updatePerson,
        deletePerson,
        addDetection,
        updateSettings,
        toggleDoorLock,
        isLoading
      }}
    >
      {children}
    </DoorbellContext.Provider>
  );
};

export const useDoorbellContext = () => {
  const context = useContext(DoorbellContext);
  if (context === undefined) {
    throw new Error('useDoorbellContext must be used within a DoorbellProvider');
  }
  return context;
};
