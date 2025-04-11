import {
  Face, InsertFace,
  History, InsertHistory,
  Settings, InsertSettings,
  DoorStatus, InsertDoorStatus
} from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';

export interface IStorage {
  // Face profiles
  getFaces(): Promise<Face[]>;
  getFaceById(id: number): Promise<Face | undefined>;
  createFace(face: InsertFace): Promise<Face>;
  updateFace(id: number, face: Partial<InsertFace>): Promise<Face | undefined>;
  deleteFace(id: number): Promise<boolean>;
  
  // History entries
  getHistory(options?: { page?: number, limit?: number, filter?: string, date?: string }): Promise<{ entries: History[], total: number }>;
  getLatestHistory(): Promise<History | undefined>;
  getTodaySummary(): Promise<{ total: number, known: number, unknown: number }>;
  createHistory(entry: InsertHistory): Promise<History>;
  deleteHistory(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  saveSettings(settings: InsertSettings): Promise<Settings>;
  
  // Door status
  getDoorStatus(): Promise<DoorStatus | undefined>;
  updateDoorStatus(status: InsertDoorStatus): Promise<DoorStatus>;
  
  // Face-api.js model setup
  setupFaceApiModels(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private faces: Map<number, Face>;
  private history: Map<number, History>;
  private settings: Settings | undefined;
  private doorStatus: DoorStatus | undefined;
  private currentFaceId: number;
  private currentHistoryId: number;
  
  constructor() {
    this.faces = new Map();
    this.history = new Map();
    this.currentFaceId = 1;
    this.currentHistoryId = 1;
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      notifications: {
        email: true,
        browser: true,
        sms: false,
        emailAddress: "admin@example.com"
      },
      recognition: {
        confidenceThreshold: 75,
        snapshotStoragePolicy: "unknown",
        autoDeletePolicy: "90",
        skipBlurredImages: true,
        autoDetectFrequentVisitors: true
      },
      camera: {
        resolution: "medium",
        trainingImageQuality: "enhanced",
        frameRate: 24
      },
      account: {
        name: "Admin User",
        email: "admin@example.com",
        password: "password"
      }
    };
    
    // Initialize with default door status
    this.doorStatus = {
      id: 1,
      status: "locked",
      lastUpdated: new Date()
    };
    
    // Add some sample data
    this.addSampleData();
  }
  
  private addSampleData() {
    // Sample faces can be added here if needed
  }
  
  // Face profiles methods
  async getFaces(): Promise<Face[]> {
    return Array.from(this.faces.values());
  }
  
  async getFaceById(id: number): Promise<Face | undefined> {
    return this.faces.get(id);
  }
  
  async createFace(face: InsertFace): Promise<Face> {
    const id = this.currentFaceId++;
    const newFace: Face = {
      ...face,
      id,
      dateAdded: new Date()
    };
    
    this.faces.set(id, newFace);
    return newFace;
  }
  
  async updateFace(id: number, face: Partial<InsertFace>): Promise<Face | undefined> {
    const existingFace = this.faces.get(id);
    if (!existingFace) return undefined;
    
    const updatedFace: Face = {
      ...existingFace,
      ...face
    };
    
    this.faces.set(id, updatedFace);
    return updatedFace;
  }
  
  async deleteFace(id: number): Promise<boolean> {
    return this.faces.delete(id);
  }
  
  // History entries methods
  async getHistory(options: { page?: number, limit?: number, filter?: string, date?: string } = {}): Promise<{ entries: History[], total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 9;
    const filter = options.filter || 'all';
    const date = options.date ? new Date(options.date) : null;
    
    let filteredHistory = Array.from(this.history.values());
    
    // Apply filters
    if (filter === 'known') {
      filteredHistory = filteredHistory.filter(entry => entry.isKnown);
    } else if (filter === 'unknown') {
      filteredHistory = filteredHistory.filter(entry => !entry.isKnown);
    }
    
    // Apply date filter
    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      filteredHistory = filteredHistory.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getFullYear() === year && 
               entryDate.getMonth() === month && 
               entryDate.getDate() === day;
      });
    }
    
    // Sort by timestamp (newest first)
    filteredHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
    
    return {
      entries: paginatedHistory,
      total: filteredHistory.length
    };
  }
  
  async getLatestHistory(): Promise<History | undefined> {
    const entries = Array.from(this.history.values());
    if (entries.length === 0) return undefined;
    
    // Sort by timestamp (newest first)
    entries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return entries[0];
  }
  
  async getTodaySummary(): Promise<{ total: number, known: number, unknown: number }> {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    const todayEntries = Array.from(this.history.values()).filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getFullYear() === year && 
             entryDate.getMonth() === month && 
             entryDate.getDate() === day;
    });
    
    const knownEntries = todayEntries.filter(entry => entry.isKnown);
    
    return {
      total: todayEntries.length,
      known: knownEntries.length,
      unknown: todayEntries.length - knownEntries.length
    };
  }
  
  async createHistory(entry: InsertHistory): Promise<History> {
    const id = this.currentHistoryId++;
    const newEntry: History = {
      ...entry,
      id,
      timestamp: new Date()
    };
    
    this.history.set(id, newEntry);
    return newEntry;
  }
  
  async deleteHistory(id: number): Promise<boolean> {
    return this.history.delete(id);
  }
  
  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }
  
  async saveSettings(settings: InsertSettings): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...settings,
      id: 1
    };
    
    return this.settings;
  }
  
  // Door status methods
  async getDoorStatus(): Promise<DoorStatus | undefined> {
    if (this.doorStatus) {
      this.doorStatus = {
        ...this.doorStatus,
        lastUpdated: new Date()
      };
    }
    
    return this.doorStatus;
  }
  
  async updateDoorStatus(status: InsertDoorStatus): Promise<DoorStatus> {
    this.doorStatus = {
      ...this.doorStatus,
      ...status,
      lastUpdated: new Date(),
      id: 1
    };
    
    return this.doorStatus;
  }
  
  // Setup face-api.js models
  async setupFaceApiModels(): Promise<boolean> {
    try {
      // Create the models directory if it doesn't exist
      await fs.mkdir(path.join(process.cwd(), 'dist/public/models'), { recursive: true });
      
      // Create the subdirectories for face-api.js models
      const modelTypes = [
        'ssd_mobilenetv1', 
        'tiny_face_detector', 
        'face_landmark_68', 
        'face_recognition', 
        'face_expression'
      ];
      
      for (const modelType of modelTypes) {
        await fs.mkdir(path.join(process.cwd(), `dist/public/models/${modelType}`), { recursive: true });
        
        // Create empty model files (would normally be downloaded/copied)
        await fs.writeFile(
          path.join(process.cwd(), `dist/public/models/${modelType}/model.json`), 
          JSON.stringify({ info: "Face API model would be here" })
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up face-api.js models:', error);
      return false;
    }
  }
}

export const storage = new MemStorage();
