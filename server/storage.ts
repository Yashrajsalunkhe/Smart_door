import {
  users, people, faceImages, detections, settings, doorStatus,
  type User, type InsertUser, 
  type Person, type InsertPerson, 
  type FaceImage, type InsertFaceImage,
  type Detection, type InsertDetection,
  type Settings, type InsertSettings,
  type DoorStatus, type InsertDoorStatus
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Person methods
  getPersonById(id: number): Promise<Person | undefined>;
  getAllPeople(): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, updates: Partial<Person>): Promise<Person | undefined>;
  deletePerson(id: number): Promise<void>;
  
  // Face image methods
  getFaceImagesByPersonId(personId: number): Promise<FaceImage[]>;
  createFaceImage(faceImage: InsertFaceImage): Promise<FaceImage>;
  
  // Detection methods
  getDetectionById(id: number): Promise<Detection | undefined>;
  getAllDetections(): Promise<Detection[]>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  
  // Settings methods
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;
  
  // Door status methods
  getDoorStatus(): Promise<DoorStatus>;
  updateDoorStatus(updates: InsertDoorStatus): Promise<DoorStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private people: Map<number, Person>;
  private faceImages: Map<number, FaceImage>;
  private detections: Map<number, Detection>;
  private appSettings: Settings;
  private doorStatus: DoorStatus;
  
  private userIdCounter: number;
  private personIdCounter: number;
  private faceImageIdCounter: number;
  private detectionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.people = new Map();
    this.faceImages = new Map();
    this.detections = new Map();
    
    this.userIdCounter = 1;
    this.personIdCounter = 1;
    this.faceImageIdCounter = 1;
    this.detectionIdCounter = 1;
    
    // Initialize settings with defaults
    this.appSettings = {
      id: 1,
      notificationEmail: false,
      notificationBrowser: true,
      notificationMobile: true,
      confidenceThreshold: 75,
      saveKnownFaces: false,
      filterLowQuality: true,
      cameraQuality: "medium",
      captureDuration: 30,
    };
    
    // Initialize door status
    this.doorStatus = {
      id: 1,
      isLocked: true,
      lastChanged: new Date(),
    };
    
    // Add sample data for demo
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample people
    const samplePeople = [
      { name: "Sarah Johnson", faceData: JSON.stringify([]) },
      { name: "John Smith", faceData: JSON.stringify([]) },
      { name: "Michael Chen", faceData: JSON.stringify([]) }
    ];
    
    samplePeople.forEach(person => {
      this.createPerson(person);
    });
    
    // Add sample detections
    const now = new Date();
    const sampleDetections = [
      { 
        personId: 1, 
        personName: "Sarah Johnson", 
        imageUrl: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22232%22%20height%3D%22131%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20232%20131%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_14de1c05ecf%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_14de1c05ecf%22%3E%3Crect%20width%3D%22232%22%20height%3D%22131%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2285.5%22%20y%3D%2270.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E", 
        confidence: "0.98", 
        isKnown: true,
        timestamp: new Date(now.getTime() - 10 * 60000) // 10 minutes ago
      },
      { 
        personId: 2, 
        personName: "John Smith", 
        imageUrl: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22232%22%20height%3D%22131%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20232%20131%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_14de1c05ecf%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_14de1c05ecf%22%3E%3Crect%20width%3D%22232%22%20height%3D%22131%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2285.5%22%20y%3D%2270.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E", 
        confidence: "0.85", 
        isKnown: true,
        timestamp: new Date(now.getTime() - 30 * 60000) // 30 minutes ago
      },
      { 
        personId: null, 
        personName: null, 
        imageUrl: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22232%22%20height%3D%22131%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20232%20131%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_14de1c05ecf%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_14de1c05ecf%22%3E%3Crect%20width%3D%22232%22%20height%3D%22131%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2285.5%22%20y%3D%2270.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E", 
        confidence: "0", 
        isKnown: false,
        timestamp: new Date(now.getTime() - 60 * 60000) // 1 hour ago
      }
    ];
    
    sampleDetections.forEach(detection => {
      this.createDetection(detection);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Person methods
  async getPersonById(id: number): Promise<Person | undefined> {
    return this.people.get(id);
  }
  
  async getAllPeople(): Promise<Person[]> {
    return Array.from(this.people.values());
  }
  
  async createPerson(person: InsertPerson): Promise<Person> {
    const id = this.personIdCounter++;
    const createdAt = new Date();
    const newPerson: Person = { 
      ...person, 
      id, 
      createdAt,
      imageCount: 0
    };
    
    this.people.set(id, newPerson);
    return newPerson;
  }
  
  async updatePerson(id: number, updates: Partial<Person>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;
    
    const updatedPerson = { ...person, ...updates };
    this.people.set(id, updatedPerson);
    return updatedPerson;
  }
  
  async deletePerson(id: number): Promise<void> {
    this.people.delete(id);
    
    // Also delete related face images
    const faceImagesToDelete = Array.from(this.faceImages.values())
      .filter(img => img.personId === id);
    
    faceImagesToDelete.forEach(img => {
      this.faceImages.delete(img.id);
    });
    
    // Update detections to mark as unknown
    const relatedDetections = Array.from(this.detections.values())
      .filter(d => d.personId === id);
    
    relatedDetections.forEach(detection => {
      const updated = {
        ...detection,
        personId: null,
        personName: null,
        isKnown: false
      };
      this.detections.set(detection.id, updated);
    });
  }
  
  // Face image methods
  async getFaceImagesByPersonId(personId: number): Promise<FaceImage[]> {
    return Array.from(this.faceImages.values())
      .filter(img => img.personId === personId);
  }
  
  async createFaceImage(faceImage: InsertFaceImage): Promise<FaceImage> {
    const id = this.faceImageIdCounter++;
    const createdAt = new Date();
    const newFaceImage: FaceImage = { ...faceImage, id, createdAt };
    
    this.faceImages.set(id, newFaceImage);
    
    // Update image count for the person
    const person = this.people.get(faceImage.personId);
    if (person) {
      person.imageCount += 1;
      this.people.set(person.id, person);
    }
    
    return newFaceImage;
  }
  
  // Detection methods
  async getDetectionById(id: number): Promise<Detection | undefined> {
    return this.detections.get(id);
  }
  
  async getAllDetections(): Promise<Detection[]> {
    return Array.from(this.detections.values());
  }
  
  async createDetection(detection: InsertDetection): Promise<Detection> {
    const id = this.detectionIdCounter++;
    const timestamp = new Date();
    const newDetection: Detection = { ...detection, id, timestamp };
    
    this.detections.set(id, newDetection);
    return newDetection;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.appSettings;
  }
  
  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    this.appSettings = { ...this.appSettings, ...updates };
    return this.appSettings;
  }
  
  // Door status methods
  async getDoorStatus(): Promise<DoorStatus> {
    return this.doorStatus;
  }
  
  async updateDoorStatus(updates: InsertDoorStatus): Promise<DoorStatus> {
    this.doorStatus = {
      ...this.doorStatus,
      ...updates,
      lastChanged: new Date()
    };
    return this.doorStatus;
  }
}

export const storage = new MemStorage();
