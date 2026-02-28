import { z } from "zod";
import { consumptionData, predictions } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    stats: {
      method: "GET" as const,
      path: "/api/dashboard/stats" as const,
      responses: {
        200: z.object({
          totalConsumption: z.number(),
          totalLocations: z.number(),
          totalAnomalies: z.number(),
        })
      }
    },
    yearlyTrends: {
      method: "GET" as const,
      path: "/api/dashboard/yearly-trends" as const,
      responses: {
        200: z.array(z.object({ year: z.string(), consumption: z.number() }))
      }
    },
    monthlyTrends: {
      method: "GET" as const,
      path: "/api/dashboard/monthly-trends" as const,
      responses: {
        200: z.array(z.object({ month: z.string(), consumption: z.number() }))
      }
    },
    topConsumers: {
      method: "GET" as const,
      path: "/api/dashboard/top-consumers" as const,
      responses: {
        200: z.array(z.object({ location: z.string(), totalConsumption: z.number() }))
      }
    },
    anomalies: {
      method: "GET" as const,
      path: "/api/dashboard/anomalies" as const,
      responses: {
        200: z.array(z.custom<typeof consumptionData.$inferSelect>())
      }
    }
  },
  predictions: {
    get: {
      method: "GET" as const,
      path: "/api/predictions" as const,
      input: z.object({
        location: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof predictions.$inferSelect>())
      }
    }
  },
  locations: {
    list: {
      method: "GET" as const,
      path: "/api/locations" as const,
      responses: {
        200: z.array(z.string())
      }
    }
  },
  upload: {
    method: "POST" as const,
    path: "/api/upload" as const,
    responses: {
      200: z.object({ message: z.string() }),
      400: z.object({ message: z.string() })
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
