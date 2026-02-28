import { useYearlyTrends, useMonthlyTrends } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Trends() {
  const { data: yearlyTrends, isLoading: yearlyLoading } = useYearlyTrends();
  const { data: monthlyTrends, isLoading: monthlyLoading } = useMonthlyTrends();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Consumption Trends</h1>
        <p className="text-muted-foreground mt-2">Historical data visualization across years and months.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="text-xl font-bold">Yearly Consumption</CardTitle>
            <CardDescription>Total aggregated energy usage by year</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {yearlyLoading ? (
              <Skeleton className="w-full h-[350px] rounded-xl" />
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyTrends} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                      dy={10}
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
                      formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Total']}
                    />
                    <Bar dataKey="consumption" radius={[6, 6, 0, 0]} maxBarSize={60}>
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

        <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="text-xl font-bold">Monthly Average Consumption</CardTitle>
            <CardDescription>Aggregated seasonal trends</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {monthlyLoading ? (
              <Skeleton className="w-full h-[350px] rounded-xl" />
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
                      dy={10}
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
                      formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Avg Consumption']}
                    />
                    <Bar dataKey="consumption" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
