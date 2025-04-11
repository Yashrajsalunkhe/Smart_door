import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Face API models setup route
  app.post('/api/models/setup', async (req, res) => {
    try {
      const result = await storage.setupFaceApiModels();
      res.json({ success: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set up face models' });
    }
  });
  
  // Face profiles routes
  app.get('/api/faces', async (req, res) => {
    try {
      const faces = await storage.getFaces();
      res.json(faces);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch face profiles' });
    }
  });
  
  app.get('/api/faces/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const face = await storage.getFaceById(id);
      
      if (!face) {
        return res.status(404).json({ error: 'Face profile not found' });
      }
      
      res.json(face);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch face profile' });
    }
  });
  
  app.post('/api/faces', async (req, res) => {
    try {
      const face = req.body;
      const newFace = await storage.createFace(face);
      res.status(201).json(newFace);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create face profile' });
    }
  });
  
  app.patch('/api/faces/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedFace = await storage.updateFace(id, updates);
      
      if (!updatedFace) {
        return res.status(404).json({ error: 'Face profile not found' });
      }
      
      res.json(updatedFace);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update face profile' });
    }
  });
  
  app.delete('/api/faces/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFace(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Face profile not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete face profile' });
    }
  });
  
  // History routes
  app.get('/api/history', async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 9;
      const filter = req.query.filter as string || 'all';
      const date = req.query.date as string || '';
      
      const history = await storage.getHistory({ page, limit, filter, date });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });
  
  app.get('/api/history/latest', async (req, res) => {
    try {
      const latestEntry = await storage.getLatestHistory();
      
      if (!latestEntry) {
        return res.json({ message: 'No history entries found' });
      }
      
      res.json(latestEntry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest history entry' });
    }
  });
  
  app.get('/api/history/today/summary', async (req, res) => {
    try {
      const summary = await storage.getTodaySummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch today\'s summary' });
    }
  });
  
  app.post('/api/history', async (req, res) => {
    try {
      const entry = req.body;
      const newEntry = await storage.createHistory(entry);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create history entry' });
    }
  });
  
  app.delete('/api/history/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHistory(id);
      
      if (!success) {
        return res.status(404).json({ error: 'History entry not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete history entry' });
    }
  });
  
  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      
      // Don't send password
      const { account, ...rest } = settings;
      const cleanedSettings = {
        ...rest,
        account: {
          name: account && typeof account === 'object' && 'name' in account ? account.name : 'Admin User',
          email: account && typeof account === 'object' && 'email' in account ? account.email : 'admin@example.com'
        }
      };
      
      res.json(cleanedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });
  
  app.post('/api/settings', async (req, res) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.saveSettings(settings);
      
      // Don't send password
      const { account, ...rest } = updatedSettings;
      const cleanedSettings = {
        ...rest,
        account: {
          name: account && typeof account === 'object' && 'name' in account ? account.name : 'Admin User',
          email: account && typeof account === 'object' && 'email' in account ? account.email : 'admin@example.com'
        }
      };
      
      res.json(cleanedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });
  
  // Door status routes
  app.get('/api/door/status', async (req, res) => {
    try {
      const status = await storage.getDoorStatus();
      
      if (!status) {
        return res.status(404).json({ error: 'Door status not found' });
      }
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch door status' });
    }
  });
  
  app.post('/api/door/status', async (req, res) => {
    try {
      const status = req.body;
      const updatedStatus = await storage.updateDoorStatus(status);
      res.json(updatedStatus);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update door status' });
    }
  });

  return httpServer;
}
