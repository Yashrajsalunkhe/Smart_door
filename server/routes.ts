import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema, insertDetectionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all people
  app.get('/api/people', async (req, res) => {
    try {
      const people = await storage.getAllPeople();
      res.json(people);
    } catch (error) {
      console.error('Error fetching people:', error);
      res.status(500).json({ message: 'Failed to fetch people' });
    }
  });

  // Get person by ID
  app.get('/api/people/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const person = await storage.getPersonById(id);
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }
      
      res.json(person);
    } catch (error) {
      console.error('Error fetching person:', error);
      res.status(500).json({ message: 'Failed to fetch person' });
    }
  });

  // Create new person
  app.post('/api/people', async (req, res) => {
    try {
      const personData = req.body;
      
      // Convert the images array to a stringified JSON if it exists
      if (personData.images && Array.isArray(personData.images)) {
        personData.faceData = JSON.stringify(personData.images);
      }
      
      // Validate the data with our schema
      const validatedData = insertPersonSchema.parse({
        name: personData.name,
        faceData: personData.faceData || JSON.stringify([])
      });
      
      const newPerson = await storage.createPerson(validatedData);
      res.status(201).json(newPerson);
    } catch (error) {
      console.error('Error creating person:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid person data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create person' });
    }
  });

  // Update person
  app.patch('/api/people/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const updates = req.body;
      const updatedPerson = await storage.updatePerson(id, updates);
      
      if (!updatedPerson) {
        return res.status(404).json({ message: 'Person not found' });
      }
      
      res.json(updatedPerson);
    } catch (error) {
      console.error('Error updating person:', error);
      res.status(500).json({ message: 'Failed to update person' });
    }
  });

  // Delete person
  app.delete('/api/people/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      await storage.deletePerson(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting person:', error);
      res.status(500).json({ message: 'Failed to delete person' });
    }
  });

  // Get all detections
  app.get('/api/detections', async (req, res) => {
    try {
      const detections = await storage.getAllDetections();
      res.json(detections);
    } catch (error) {
      console.error('Error fetching detections:', error);
      res.status(500).json({ message: 'Failed to fetch detections' });
    }
  });

  // Create new detection
  app.post('/api/detections', async (req, res) => {
    try {
      const detectionData = req.body;
      
      // Validate the data
      const validatedData = insertDetectionSchema.parse({
        personId: detectionData.personId || null,
        personName: detectionData.personName || null,
        imageUrl: detectionData.imageUrl,
        confidence: detectionData.confidence?.toString() || "0",
        isKnown: detectionData.isKnown || false
      });
      
      const newDetection = await storage.createDetection(validatedData);
      res.status(201).json(newDetection);
    } catch (error) {
      console.error('Error creating detection:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid detection data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create detection' });
    }
  });

  // Get settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      // Format for frontend
      const formattedSettings = {
        notifications: {
          email: settings.notificationEmail,
          browser: settings.notificationBrowser,
          mobile: settings.notificationMobile,
        },
        recognition: {
          confidenceThreshold: settings.confidenceThreshold,
          saveKnownFaces: settings.saveKnownFaces,
          filterLowQuality: settings.filterLowQuality,
        },
        camera: {
          quality: settings.cameraQuality,
          captureDuration: settings.captureDuration,
        },
      };
      
      res.json(formattedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  // Update settings
  app.put('/api/settings', async (req, res) => {
    try {
      const settingsData = req.body;
      
      // Convert from frontend format to database format
      const dbSettings = {
        notificationEmail: settingsData.notifications?.email,
        notificationBrowser: settingsData.notifications?.browser,
        notificationMobile: settingsData.notifications?.mobile,
        confidenceThreshold: settingsData.recognition?.confidenceThreshold,
        saveKnownFaces: settingsData.recognition?.saveKnownFaces,
        filterLowQuality: settingsData.recognition?.filterLowQuality,
        cameraQuality: settingsData.camera?.quality,
        captureDuration: settingsData.camera?.captureDuration,
      };
      
      const updatedSettings = await storage.updateSettings(dbSettings);
      
      // Format for frontend
      const formattedSettings = {
        notifications: {
          email: updatedSettings.notificationEmail,
          browser: updatedSettings.notificationBrowser,
          mobile: updatedSettings.notificationMobile,
        },
        recognition: {
          confidenceThreshold: updatedSettings.confidenceThreshold,
          saveKnownFaces: updatedSettings.saveKnownFaces,
          filterLowQuality: updatedSettings.filterLowQuality,
        },
        camera: {
          quality: updatedSettings.cameraQuality,
          captureDuration: updatedSettings.captureDuration,
        },
      };
      
      res.json(formattedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Get door status
  app.get('/api/door/status', async (req, res) => {
    try {
      const status = await storage.getDoorStatus();
      res.json(status);
    } catch (error) {
      console.error('Error fetching door status:', error);
      res.status(500).json({ message: 'Failed to fetch door status' });
    }
  });

  // Toggle door lock
  app.post('/api/door/toggle', async (req, res) => {
    try {
      const currentStatus = await storage.getDoorStatus();
      const newStatus = await storage.updateDoorStatus({
        isLocked: !currentStatus.isLocked
      });
      
      res.json(newStatus);
    } catch (error) {
      console.error('Error toggling door:', error);
      res.status(500).json({ message: 'Failed to toggle door' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
