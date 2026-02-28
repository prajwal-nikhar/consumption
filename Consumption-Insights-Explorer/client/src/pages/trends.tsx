import { useYearlyTrends, useMonthlyTrends, useTopConsumers } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, Calendar, Building2 } from "lucide-react";

export default function Trends() {
  const { data: yearlyTrends, isLoading: yearlyLoading } = useYearlyTrends();
  const { data: monthlyTrends, isLoading: monthlyLoading } = useMonthlyTrends();
  const { data: topConsumers } = useTopConsumers();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Consumption Intelligence
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Historical
          </span>
        </h1>
        <p className="text-muted-foreground mt-2">Deep dive into campus energy patterns and seasonal behavior.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="bg-card/50 border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Year-over-Year Growth
            </CardTitle>
            <CardDescription>Total aggregated energy usage by fiscal year</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {yearlyLoading ? (
              <Skeleton className="w-full h-[300px] rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyTrends} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.5 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="consumption" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1500}>
                      {yearlyTrends?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
          <CardHeader className="bg-card/50 border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Seasonal Variance
            </CardTitle>
            <CardDescription>Monthly consumption intensity across campus</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {monthlyLoading ? (
              <Skeleton className="w-full h-[300px] rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
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
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTrend)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl shadow-black/5 border-border/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Top Facility Consumers
          </CardTitle>
          <CardDescription>Facilities with highest energy intensity</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumers} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="location" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                />
                <Tooltip cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }} />
                <Bar dataKey="totalReading" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={1800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
