import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const consumptionData = sqliteTable("consumption_data", {
  id: integer("id").primaryKey(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  initialReading: real("initial_reading"),
  finalReading: real("final_reading"),
  difference: real("difference"),
  totalReading: real("total_reading").notNull(),
  remark: text("remark"),
  isAnomaly: integer("is_anomaly", { mode: 'boolean' }).default(false),
  KWH_Lag_1_used: real("KWH_Lag_1_used"),
  KWH_RollingMean_7_used: real("KWH_RollingMean_7_used"),
});

export const predictions = sqliteTable("predictions", {
  id: integer("id").primaryKey(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  predictedConsumption: real("predicted_consumption").notNull(),
  Year: integer("Year"),
  Month: integer("Month"),
  Quarter: integer("Quarter"),
  KWH_Lag_1_used: real("KWH_Lag_1_used"),
  KWH_RollingMean_7_used: real("KWH_RollingMean_7_used"),
  TOTAL_READING_KWH: real("TOTAL_READING_KWH"),
});

export const insertConsumptionSchema = createInsertSchema(consumptionData);
export type InsertConsumption = z.infer<typeof insertConsumptionSchema>;
export type Consumption = typeof consumptionData.$inferSelect;

export const insertPredictionSchema = createInsertSchema(predictions);
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;