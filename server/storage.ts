import {
  users,
  reports,
  type User,
  type UpsertUser,
  type Report,
  type InsertReport,
  type UpdateReportStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReportsByUserId(userId: string): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  updateReportStatus(id: string, status: UpdateReportStatus): Promise<Report | undefined>;
  getReportStats(): Promise<{
    new: number;
    in_progress: number;
    resolved: number;
    total: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
async getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

async createUser(user: { email: string; password: string; role?: string }) {
  const result = await db.insert(users).values({
    email: user.email,
    password: user.password,
    role: user.role || "user",
  }).returning();

  return result[0];
}
  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReportById(id: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async updateReportStatus(id: string, statusData: UpdateReportStatus): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ 
        status: statusData.status,
        updatedAt: new Date()
      })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  async getReportStats(): Promise<{
    new: number;
    in_progress: number;
    resolved: number;
    total: number;
  }> {
    const allReports = await db.select().from(reports);
    
    const stats = {
      new: allReports.filter(r => r.status === 'new').length,
      in_progress: allReports.filter(r => r.status === 'in_progress').length,
      resolved: allReports.filter(r => r.status === 'resolved').length,
      total: allReports.length,
    };

    return stats;
  }
}

export const storage = new DatabaseStorage();
