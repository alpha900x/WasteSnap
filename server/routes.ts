import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReportSchema, updateReportStatusSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Reports routes
  app.post('/api/reports', upload.single('photo'), async (req: any, res) => {
    try {
      // Allow anonymous reports or use authenticated user
      const userId = req.user?.claims?.sub || 'anonymous';
      
      // Parse the request body - latitude and longitude are already strings
      const reportData = {
        ...req.body,
      };

      // Validate the data
      const validatedData = insertReportSchema.parse(reportData);

      // Add file URL if photo was uploaded
      let photoUrl = null;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      }

      const report = await storage.createReport({
        ...validatedData,
        userId,
        photoUrl,
      });

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create report" });
      }
    }
  });

  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/reports/my', async (req: any, res) => {
    try {
      // Return empty array if not authenticated
      if (!req.user?.claims?.sub) {
        return res.json([]);
      }
      const userId = req.user.claims.sub;
      const reports = await storage.getReportsByUserId(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ message: "Failed to fetch user reports" });
    }
  });

  app.get('/api/reports/stats', async (req, res) => {
    try {
      const stats = await storage.getReportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching report stats:", error);
      res.status(500).json({ message: "Failed to fetch report stats" });
    }
  });

  app.patch('/api/reports/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const statusData = updateReportStatusSchema.parse(req.body);
      
      const updatedReport = await storage.updateReportStatus(id, statusData);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating report status:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update report status" });
      }
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
