import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Face, HistoryEntry, Settings, DoorStatus } from '../types';

interface DoorbellContextType {
  faces: Face[];
  history: HistoryEntry[];
  settings: Settings | null;
  doorStatus: DoorStatus | null;
  lastDetection: HistoryEntry | null;
  addFace: (face: Omit<Face, 'id' | 'dateAdded'>) => Promise<Face>;
  updateFace: (id: number, updates: Partial<Face>) => Promise<Face>;
  deleteFace: (id: number) => Promise<void>;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<HistoryEntry>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  setDoorStatus: (status: string) => Promise<DoorStatus>;
  isLoading: boolean;
}

const DoorbellContext = createContext<DoorbellContextType | undefined>(undefined);

export const DoorbellProvider = ({ children }: { children: ReactNode }) => {
  const [faces, setFaces] = useState<Face[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [doorStatus, setDoorStatusState] = useState<DoorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lastDetection = history.length > 0 
    ? history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load faces
        const facesResponse = await fetch('/api/faces');
        if (facesResponse.ok) {
          let facesData = await facesResponse.json();
          // Convert descriptor to Float32Array if needed
          facesData = facesData.map((face: any) => ({
            ...face,
            descriptor: Array.isArray(face.descriptor)
              ? face.descriptor
              : Object.values(face.descriptor)
          }));
          setFaces(facesData);
        }
        // Load history
        const historyResponse = await fetch('/api/history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData.entries || historyData);
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
          setDoorStatusState(doorData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addFace = async (faceData: Omit<Face, 'id' | 'dateAdded'>): Promise<Face> => {
    const response = await fetch('/api/faces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faceData),
    });
    if (!response.ok) throw new Error('Failed to add face');
    const newFace = await response.json();
    setFaces(prev => [...prev, newFace]);
    return newFace;
  };

  const updateFace = async (id: number, updates: Partial<Face>): Promise<Face> => {
    const response = await fetch(`/api/faces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update face');
    const updatedFace = await response.json();
    setFaces(prev => prev.map(f => f.id === id ? updatedFace : f));
    return updatedFace;
  };

  const deleteFace = async (id: number): Promise<void> => {
    const response = await fetch(`/api/faces/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete face');
    setFaces(prev => prev.filter(f => f.id !== id));
  };

  const addHistory = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<HistoryEntry> => {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error('Failed to add history entry');
    const newEntry = await response.json();
    setHistory(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    const updatedSettings = { ...settings, ...newSettings };
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    setSettings(updatedSettings);
  };

  const setDoorStatus = async (status: string): Promise<DoorStatus> => {
    const response = await fetch('/api/door/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update door status');
    const newStatus = await response.json();
    setDoorStatusState(newStatus);
    return newStatus;
  };

  return (
    <DoorbellContext.Provider
      value={{
        faces,
        history,
        settings,
        doorStatus,
        lastDetection,
        addFace,
        updateFace,
        deleteFace,
        addHistory,
        updateSettings,
        setDoorStatus,
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
