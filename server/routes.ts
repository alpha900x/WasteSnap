import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertReportSchema, updateReportStatusSchema } from "@shared/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { reports } from "@shared/schema";
import { db } from "./db";
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
function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}
export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existing = await storage.getUserByEmail(email);

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await storage.createUser({
      email,
      password,
      role: role || "user",
    });

    res.json(newUser);

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});
 app.post("/api/login", async (req: any, res) => {
  try {
    const { email, password } = req.body;

    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Store session
    req.session.user = {
      id: user.id,
      role: user.role,
    };

    // ✅ Send response
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});
app.post("/api/logout", (req: any, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});


  // Auth routes
 app.get('/api/auth/user', (req: any, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json(req.session.user);
});
app.get('/api/reports/stats-by-type', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT waste_type, COUNT(*) as count
      FROM reports
      GROUP BY waste_type
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
});


  // Reports routes
  app.post('/api/reports', upload.single('photo'), async (req: any, res) => {
    try {
      // Allow anonymous reports or use authenticated user
     const userId = req.session?.user?.id || 'anonymous';
      
      console.log('Raw request body:', req.body);
      console.log('Uploaded file:', req.file);
      console.log('Request headers:', req.headers['content-type']);
      
      // Extract data from FormData - multer puts text fields in req.body
      const reportData = {
        title: req.body.title || '',
        description: req.body.description || '',
        wasteType: req.body.wasteType,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address || '',
      };

      console.log('Report data before validation:', reportData);

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

  app.get('/api/reports', requireAdmin, async (req, res) => {
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
     if (!req.session?.user) {
        return res.json([]);
      }
      const userId = req.session.user.id;
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
app.get('/api/reports/export', async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = db.select().from(reports);
    const conditions = [];

    if (status) {
      conditions.push(eq(reports.status, status as string));
    }

    if (type) {
      conditions.push(eq(reports.wasteType, type as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query;

    // Convert to CSV
    const headers = ["Title", "Description", "Status", "Waste Type", "Address", "Created At"];

    const rows = data.map((r) => [
      r.title,
      r.description,
      r.status,
      r.wasteType,
      r.address,
      r.createdAt,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reports.csv");

    res.send(csv);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).send("Failed to export reports");
  }
});
 app.patch('/api/reports/:id/status', async (req: any, res) => {

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
