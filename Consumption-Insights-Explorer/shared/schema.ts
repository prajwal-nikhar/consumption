import { pgTable, serial, text, date, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const consumptionData = pgTable("consumption_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  date: date("date").notNull(),
  initialReading: numeric("initial_reading"),
  finalReading: numeric("final_reading"),
  difference: numeric("difference"),
  totalReading: numeric("total_reading").notNull(),
  remark: text("remark"),
  isAnomaly: boolean("is_anomaly").default(false),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  date: date("date").notNull(),
  predictedConsumption: numeric("predicted_consumption").notNull(),
});

export const insertConsumptionSchema = createInsertSchema(consumptionData);
export type InsertConsumption = z.infer<typeof insertConsumptionSchema>;
export type Consumption = typeof consumptionData.$inferSelect;

export const insertPredictionSchema = createInsertSchema(predictions);
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
