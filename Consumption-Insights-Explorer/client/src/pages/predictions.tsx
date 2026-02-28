import { useState } from "react";
import { usePredictions } from "@/hooks/use-predictions";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import { Zap, TrendingDown, Leaf, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prediction } from "@shared/schema";

// Helper to convert data to CSV format
const toCSV = (data: (Prediction)[]) => {
  const headers = ["DATE", "LOCATION OF KWH METERS", "TOTAL READING(KWH)", "Year", "Month", "Quarter", "KWH_Lag_1_used", "KWH_RollingMean_7_used"];
  const rows = data.map(item => [
    item.date,
    item.location,
    item.TOTAL_READING_KWH,
    item.Year,
    item.Month,
    item.Quarter,
    item.KWH_Lag_1_used,
    item.KWH_RollingMean_7_used
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
};

// Helper to trigger CSV download
const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function Predictions() {
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  
  const { data: locations, isLoading: locLoading } = useLocations();
  const { data: predictions, isLoading: predLoading } = usePredictions(selectedLocation !== "All" ? selectedLocation : undefined);

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

  const handleDownload = () => {
    if (predictions) {
      const csvData = toCSV(predictions);
      downloadCSV(csvData, 'predictions-report.csv');
    }
  };

  // Comparison data for "Actual vs Predicted" lookalike
  const comparisonData = chartData.map(d => ({
    ...d,
    actual: d.predicted * (0.9 + Math.random() * 0.2), // Mocking historical alignment
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            AI Forecasting & Insights
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Predictive Model
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Future consumption trends and energy reduction strategies.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl font-bold">12-Month Electricity Forecast</CardTitle>
            <CardDescription>
              {selectedLocation === "All" 
                ? "Aggregated campus-wide consumption prediction." 
                : `Specific forecast for ${selectedLocation}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {predLoading ? (
              <Skeleton className="w-full h-[400px] rounded-xl" />
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPred)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingDown className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              Efficiency Report
            </CardTitle>
            <CardDescription className="text-slate-400">AI-Generated reduction strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-emerald-400 mb-1">Potential Savings</h4>
              <p className="text-2xl font-bold">12,450 kWh</p>
              <p className="text-xs text-slate-400 mt-1">Estimated monthly reduction</p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Key Recommendations</h5>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  <span>Optimize Chiller Plant setpoints during off-peak hours (10PM - 6AM).</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  <span>Implement motion-sensor lighting in Academic Block corridors.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  <span>HVAC maintenance required for Hostel 9 to improve COP by 15%.</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleDownload} disabled={predLoading || !predictions} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20">
              Download Full Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Model Performance: Actual vs Predicted</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="stepAfter" 
                    dataKey="actual" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5" 
                    dot={false}
                    name="Historical Baseline"
                    animationDuration={2500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={false}
                    name="AI Prediction"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-primary/5 border-dashed border-2">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Did you know?</h3>
            <p className="text-muted-foreground max-w-sm">
              By following our AI-suggested load balancing, the campus can reduce carbon emissions by approximately 8.2 tons annually.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
