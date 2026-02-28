import { useAnomalies, useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Building2, TrendingUp, Search, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

export default function Anomalies() {
  const { data: anomalies, isLoading } = useAnomalies();
  const { data: stats } = useDashboardStats();

  // Prepare chart data: Anomalies per location
  const locationCounts = anomalies?.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.location);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.location, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 10) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Anomaly Intelligence
            <Badge variant="destructive" className="px-3 py-1 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
              {anomalies?.length || 0} Spikes
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-2">Isolation Forest detected unusual consumption patterns.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Scan for New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl font-bold">Top 10 Locations with Detected Anomalies</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationCounts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    width={120}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25} animationDuration={2000}>
                    {locationCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-white/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-destructive" />
              Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 text-center">
              <p className="text-sm text-muted-foreground mb-1 font-medium">Excess Consumption</p>
              <h3 className="text-3xl font-bold text-destructive">
                +{stats?.totalAnomalies ? (stats.totalAnomalies * 240).toLocaleString() : '0'} kWh
              </h3>
              <p className="text-xs text-muted-foreground mt-2 italic">Estimated waste from unmanaged spikes</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Chiller Plant Spike</p>
                  <p className="text-xs text-muted-foreground">Highest frequency location</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Unusual Night Load</p>
                  <p className="text-xs text-muted-foreground">3 detections in Academic Block</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50">
          <CardTitle className="text-xl font-bold">Detailed Anomaly Log</CardTitle>
          <CardDescription>Comprehensive list of all triggered alerts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Occurrence</TableHead>
                    <TableHead className="font-semibold text-foreground">Facility</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Reading (kWh)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Deviation</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {item.date ? format(new Date(item.date), 'MMM dd, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.totalReading ? Number(item.totalReading).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-destructive font-medium">
                        +{item.difference ? Number(item.difference).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/5">
                          Review
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
