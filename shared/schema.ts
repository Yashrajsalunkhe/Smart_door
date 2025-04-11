import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Face profiles table
export const faces = pgTable("faces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  imageCount: integer("image_count").notNull(),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  descriptor: jsonb("descriptor").notNull()
});

// History entries table
export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  personName: text("person_name").notNull(),
  isKnown: boolean("is_known").notNull(),
  confidence: integer("confidence").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  doorStatus: text("door_status").notNull(),
  snapshot: text("snapshot").notNull()
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  notifications: jsonb("notifications").notNull(),
  recognition: jsonb("recognition").notNull(),
  camera: jsonb("camera").notNull(),
  account: jsonb("account").notNull()
});

// Door status table
export const doorStatus = pgTable("door_status", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

// Insert schemas
export const insertFaceSchema = createInsertSchema(faces).pick({
  name: true,
  relationship: true,
  imageCount: true,
  descriptor: true
});

export const insertHistorySchema = createInsertSchema(history).pick({
  personName: true,
  isKnown: true,
  confidence: true,
  doorStatus: true,
  snapshot: true
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  notifications: true,
  recognition: true,
  camera: true,
  account: true
});

export const insertDoorStatusSchema = createInsertSchema(doorStatus).pick({
  status: true
});

// Types
export type Face = typeof faces.$inferSelect;
export type InsertFace = z.infer<typeof insertFaceSchema>;

export type History = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type DoorStatus = typeof doorStatus.$inferSelect;
export type InsertDoorStatus = z.infer<typeof insertDoorStatusSchema>;
