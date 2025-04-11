import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User authentication model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Person model - for face recognition
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  faceData: text("face_data"), // JSON stringified face descriptors
  imageCount: integer("image_count").default(0),
});

// Face images model - multiple images per person
export const faceImages = pgTable("face_images", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").references(() => people.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Detection model - history of face detections
export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").references(() => people.id, { onDelete: 'set null' }),
  personName: text("person_name"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  imageUrl: text("image_url").notNull(),
  confidence: text("confidence").default("0"),
  isKnown: boolean("is_known").default(false),
});

// Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  notificationEmail: boolean("notification_email").default(false),
  notificationBrowser: boolean("notification_browser").default(true),
  notificationMobile: boolean("notification_mobile").default(true),
  confidenceThreshold: integer("confidence_threshold").default(75),
  saveKnownFaces: boolean("save_known_faces").default(false),
  filterLowQuality: boolean("filter_low_quality").default(true),
  cameraQuality: text("camera_quality").default("medium"),
  captureDuration: integer("capture_duration").default(30),
});

// Door status model
export const doorStatus = pgTable("door_status", {
  id: serial("id").primaryKey(),
  isLocked: boolean("is_locked").default(true),
  lastChanged: timestamp("last_changed").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPersonSchema = createInsertSchema(people).pick({
  name: true,
  faceData: true,
});

export const insertFaceImageSchema = createInsertSchema(faceImages).pick({
  personId: true,
  imageUrl: true,
});

export const insertDetectionSchema = createInsertSchema(detections).pick({
  personId: true,
  personName: true,
  imageUrl: true,
  confidence: true,
  isKnown: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertDoorStatusSchema = createInsertSchema(doorStatus).pick({
  isLocked: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Person = typeof people.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type FaceImage = typeof faceImages.$inferSelect;
export type InsertFaceImage = z.infer<typeof insertFaceImageSchema>;

export type Detection = typeof detections.$inferSelect;
export type InsertDetection = z.infer<typeof insertDetectionSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type DoorStatus = typeof doorStatus.$inferSelect;
export type InsertDoorStatus = z.infer<typeof insertDoorStatusSchema>;
