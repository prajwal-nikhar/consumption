import { Activity, AlertTriangle, Building2, Zap, Upload, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";
import { useDashboardStats, useMonthlyTrends, useTopConsumers } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useMonthlyTrends();
  const { data: topConsumers, isLoading: consumersLoading } = useTopConsumers();
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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-consumers"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-2">Real-time campus energy telemetry and predictive insights.</p>
        </div>
        <div className="flex gap-3">
          <label className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition-all
            ${uploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'}
          `}>
            {uploading ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? "Processing..." : "Import Telemetry"}</span>
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
          title="Facilities Monitored" 
          value={stats?.totalLocations?.toString()} 
          icon={Building2} 
          loading={statsLoading} 
        />
        <MetricCard 
          title="Active Anomalies" 
          value={stats?.totalAnomalies?.toString()} 
          icon={AlertTriangle} 
          loading={statsLoading} 
          trend="Action required" 
          trendUp={false}
          alert
        />
        <MetricCard 
          title="System Status" 
          value="Healthy" 
          icon={Zap} 
          loading={false}
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="bg-transparent pb-2 border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Campus Load Profile (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {trendsLoading ? (
              <Skeleton className="w-full h-[350px] rounded-xl" />
            ) : (
              <div className="h-[350px] w-full">
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
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Load']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConsumption)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="bg-transparent pb-2 border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top 5 Consumers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {consumersLoading ? (
              <Skeleton className="w-full h-[350px] rounded-xl" />
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topConsumers?.slice(0, 5)} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="location" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }} />
                    <Bar dataKey="totalReading" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1800}>
                      {topConsumers?.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-slate-900 text-white p-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-bold text-white">Critical Summary</CardTitle>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Automated audit complete. {stats?.totalLocations} facilities active. {stats?.totalAnomalies} leakage points identified for immediate inspection.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-2 border-b border-white/5">
                <span className="text-slate-500">Grid Efficiency</span>
                <span className="font-bold text-emerald-400 text-lg">94.2%</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-white/5">
                <span className="text-slate-500">Unmanaged Spikes</span>
                <span className="font-bold text-rose-400 text-lg">{stats?.totalAnomalies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-white/50 backdrop-blur-md flex items-center p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Quick Action Required
                </h4>
                <p className="text-sm text-muted-foreground">The Chiller Plant shows a 12% deviation from historical norms. AI suggests cleaning condensers to restore efficiency.</p>
                <button className="text-primary font-bold text-sm hover:underline">View Anomaly Details →</button>
              </div>
              <div className="flex items-center justify-center p-6 bg-primary/5 rounded-2xl border border-dashed border-primary/20">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Carbon Offset</p>
                  <p className="text-3xl font-bold">1.4 Tons</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Saved this month via AI optimization</p>
                </div>
              </div>
           </div>
        </Card>
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
      ${highlight ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-card/50 backdrop-blur-sm'}
      ${alert ? 'border-destructive/30' : ''}
    `}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
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
          <div className="mt-4 flex items-center text-xs">
            <span className={`font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs historical average</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
