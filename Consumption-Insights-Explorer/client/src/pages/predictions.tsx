import { useState } from "react";
import { usePredictions } from "@/hooks/use-predictions";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { Zap } from "lucide-react";

export default function Predictions() {
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  
  const { data: locations, isLoading: locLoading } = useLocations();
  const { data: predictions, isLoading: predLoading } = usePredictions(selectedLocation !== "All" ? selectedLocation : undefined);

  // Group data by date if viewing "All", or just use the flat list if a specific location
  // For "All", we might sum predictions per date. Assuming the backend returns raw predictions.
  // The Recharts LineChart works best with array of objects { date: string, consumption: number }
  
  const chartData = predictions?.reduce((acc: any[], curr) => {
    const dateStr = curr.date ? format(new Date(curr.date), 'MMM yyyy') : 'Unknown';
    const val = Number(curr.predictedConsumption) || 0;
    
    const existing = acc.find(item => item.date === dateStr);
    if (existing) {
      existing.predicted = existing.predicted + val;
    } else {
      acc.push({ date: dateStr, predicted: val });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            AI Forecast
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Model
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Random Forest Regressor predictions for the next 12 months.</p>
        </div>

        <div className="w-full md:w-72">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border/50 shadow-sm">
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Locations Campus-Wide</SelectItem>
              {locations?.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="bg-card/50 backdrop-blur-sm border-b border-border/50 relative z-10">
          <CardTitle className="text-xl font-bold">Predicted Future Consumption</CardTitle>
          <CardDescription>
            {selectedLocation === "All" 
              ? "Aggregated forecast for all campus facilities." 
              : `Specific forecast for ${selectedLocation}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 relative z-10 bg-card/50">
          {predLoading ? (
            <Skeleton className="w-full h-[500px] rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
              <Zap className="w-12 h-12 mb-4 opacity-20" />
              <p>No prediction data available for this selection.</p>
            </div>
          ) : (
            <div className="h-[500px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Predicted']}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    name="Predicted Consumption (kWh)" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
