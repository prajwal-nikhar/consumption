import { consumptionData, predictions, type Consumption, type InsertConsumption, type Prediction, type InsertPrediction } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // dashboard stats
  getStats(): Promise<{ totalConsumption: number, totalLocations: number, totalAnomalies: number }>;
  getYearlyTrends(): Promise<{ year: string, consumption: number }[]>;
  getMonthlyTrends(): Promise<{ month: string, consumption: number }[]>;
  getTopConsumers(): Promise<{ location: string, totalConsumption: number }[]>;
  getAnomalies(): Promise<Consumption[]>;
  getPredictions(location?: string): Promise<Prediction[]>;
  getLocations(): Promise<string[]>;

  // seeding
  seedConsumptionData(data: InsertConsumption[]): Promise<void>;
  seedPredictionData(data: InsertPrediction[]): Promise<void>;
  hasConsumptionData(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getStats() {
    const totalConsRes = await db.select({ value: sql<number>`sum(${consumptionData.totalReading})` }).from(consumptionData);
    const locationsRes = await db.select({ value: sql<number>`count(distinct ${consumptionData.location})` }).from(consumptionData);
    const anomaliesRes = await db.select({ value: sql<number>`count(*)` }).from(consumptionData).where(eq(consumptionData.isAnomaly, true));

    return {
      totalConsumption: Number(totalConsRes[0]?.value || 0),
      totalLocations: Number(locationsRes[0]?.value || 0),
      totalAnomalies: Number(anomaliesRes[0]?.value || 0),
    };
  }

  async getYearlyTrends() {
    const res = await db.select({
      year: sql<string>`to_char(${consumptionData.date}, 'YYYY')`,
      consumption: sql<number>`sum(${consumptionData.totalReading})`
    })
    .from(consumptionData)
    .groupBy(sql`to_char(${consumptionData.date}, 'YYYY')`)
    .orderBy(sql`to_char(${consumptionData.date}, 'YYYY')`);
    
    return res.map(r => ({ year: r.year, consumption: Number(r.consumption) }));
  }

  async getMonthlyTrends() {
    const res = await db.select({
      month: sql<string>`to_char(${consumptionData.date}, 'MM')`,
      consumption: sql<number>`sum(${consumptionData.totalReading})`
    })
    .from(consumptionData)
    .groupBy(sql`to_char(${consumptionData.date}, 'MM')`)
    .orderBy(sql`to_char(${consumptionData.date}, 'MM')`);
    
    return res.map(r => ({ month: r.month, consumption: Number(r.consumption) }));
  }

  async getTopConsumers() {
    const res = await db.select({
      location: consumptionData.location,
      totalConsumption: sql<number>`sum(${consumptionData.totalReading})`
    })
    .from(consumptionData)
    .groupBy(consumptionData.location)
    .orderBy(desc(sql<number>`sum(${consumptionData.totalReading})`))
    .limit(10);

    return res.map(r => ({ location: r.location, totalConsumption: Number(r.totalConsumption) }));
  }

  async getAnomalies() {
    return await db.select().from(consumptionData).where(eq(consumptionData.isAnomaly, true)).orderBy(desc(consumptionData.date)).limit(100);
  }

  async getPredictions(location?: string) {
    let query = db.select().from(predictions) as any;
    if (location) {
      query = query.where(eq(predictions.location, location));
    }
    return await query.orderBy(asc(predictions.date));
  }
  
  async getLocations() {
    const res = await db.select({ location: consumptionData.location }).from(consumptionData).groupBy(consumptionData.location);
    return res.map(r => r.location);
  }

  async seedConsumptionData(data: InsertConsumption[]) {
    await db.delete(consumptionData);
    await db.delete(predictions);
    // batch insert
    const chunkSize = 500;
    for (let i = 0; i < data.length; i += chunkSize) {
      await db.insert(consumptionData).values(data.slice(i, i + chunkSize));
    }
  }

  async seedPredictionData(data: InsertPrediction[]) {
    // Already cleared in seedConsumptionData to ensure consistency
    const chunkSize = 500;
    for (let i = 0; i < data.length; i += chunkSize) {
      await db.insert(predictions).values(data.slice(i, i + chunkSize));
    }
  }

  async hasConsumptionData() {
    const res = await db.select({ count: sql<number>`count(*)` }).from(consumptionData);
    return Number(res[0]?.count || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
