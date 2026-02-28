import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Utility to catch and log Zod schema mismatch errors gracefully
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // Try to return data casted as T as a fallback so the app doesn't crash entirely 
    // on minor backend mismatches, but the error is logged.
    return data as T;
  }
  return result.data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return parseWithLogging(api.dashboard.stats.responses[200], data, "dashboard.stats");
    }
  });
}

export function useYearlyTrends() {
  return useQuery({
    queryKey: [api.dashboard.yearlyTrends.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.yearlyTrends.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch yearly trends");
      const data = await res.json();
      return parseWithLogging(api.dashboard.yearlyTrends.responses[200], data, "dashboard.yearlyTrends");
    }
  });
}

export function useMonthlyTrends() {
  return useQuery({
    queryKey: [api.dashboard.monthlyTrends.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.monthlyTrends.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch monthly trends");
      const data = await res.json();
      return parseWithLogging(api.dashboard.monthlyTrends.responses[200], data, "dashboard.monthlyTrends");
    }
  });
}

export function useTopConsumers() {
  return useQuery({
    queryKey: [api.dashboard.topConsumers.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.topConsumers.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch top consumers");
      const data = await res.json();
      return parseWithLogging(api.dashboard.topConsumers.responses[200], data, "dashboard.topConsumers");
    }
  });
}

export function useAnomalies() {
  return useQuery({
    queryKey: [api.dashboard.anomalies.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.anomalies.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch anomalies");
      const data = await res.json();
      return parseWithLogging(api.dashboard.anomalies.responses[200], data, "dashboard.anomalies");
    }
  });
}
