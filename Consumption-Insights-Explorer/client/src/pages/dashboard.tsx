import { Activity, AlertTriangle, Building2, Zap, Upload, CheckCircle2 } from "lucide-react";
import { useDashboardStats, useMonthlyTrends } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useMonthlyTrends();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      toast({
        title: "Success",
        description: "Data imported successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trends"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-2">Key metrics and overall campus energy consumption.</p>
        </div>
        <div className="flex gap-3">
          <label className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition-all
            ${uploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'}
          `}>
            {uploading ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? "Uploading..." : "Import Excel"}</span>
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Consumption" 
          value={stats?.totalConsumption ? `${(stats.totalConsumption / 1000).toFixed(1)}k kWh` : undefined} 
          icon={Activity} 
          loading={statsLoading} 
          trend="+4.5%" 
          trendUp={true}
        />
        <MetricCard 
          title="Monitored Locations" 
          value={stats?.totalLocations?.toString()} 
          icon={Building2} 
          loading={statsLoading} 
        />
        <MetricCard 
          title="Detected Anomalies" 
          value={stats?.totalAnomalies?.toString()} 
          icon={AlertTriangle} 
          loading={statsLoading} 
          trend="Needs attention" 
          trendUp={false}
          alert
        />
        <MetricCard 
          title="Current Status" 
          value="Online" 
          icon={Zap} 
          loading={false}
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-transparent pb-2">
            <CardTitle className="text-xl font-bold">Campus Consumption (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {trendsLoading ? (
              <Skeleton className="w-full h-[300px] rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Consumption']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConsumption)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl font-bold text-white">Quick Summary</CardTitle>
                <CheckCircle2 className="w-6 h-6 text-white/50" />
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                System is monitoring {stats?.totalLocations} locations. {stats?.totalAnomalies} unusual spikes detected.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-2 border-b border-white/10">
                  <span className="text-white/60">Efficiency</span>
                  <span className="font-bold text-white">94%</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-white/10">
                  <span className="text-white/60">Active Alerts</span>
                  <span className="font-bold text-white">{stats?.totalAnomalies}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl bg-white/80 backdrop-blur-sm border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h4 className="font-bold text-foreground mb-2">Did you know?</h4>
              <p className="text-sm text-muted-foreground italic">
                The Chiller Plant accounts for nearly 35% of the total campus energy consumption. 
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  trend, 
  trendUp, 
  alert, 
  highlight 
}: any) {
  return (
    <Card className={`
      relative overflow-hidden rounded-2xl shadow-md border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${highlight ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-card'}
      ${alert ? 'border-destructive/30' : ''}
    `}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h3 className={`text-3xl font-bold tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>
                {value || '0'}
              </h3>
            )}
          </div>
          <div className={`p-3 rounded-xl ${
            highlight ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 
            alert ? 'bg-destructive/10 text-destructive' : 
            'bg-secondary text-secondary-foreground'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${trendUp ? 'text-emerald-500' : 'text-destructive'}`}>
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
