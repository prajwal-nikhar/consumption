import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    return data as T;
  }
  return result.data;
}

export function usePredictions(location?: string) {
  return useQuery({
    queryKey: [api.predictions.get.path, location],
    queryFn: async () => {
      const url = new URL(api.predictions.get.path, window.location.origin);
      if (location && location !== "All") {
        url.searchParams.append("location", location);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch predictions");
      const data = await res.json();
      return parseWithLogging(api.predictions.get.responses[200], data, "predictions.get");
    }
  });
}
