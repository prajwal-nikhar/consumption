import { useTopConsumers } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Consumers() {
  const { data: topConsumers, isLoading } = useTopConsumers();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Top Consumers</h1>
        <p className="text-muted-foreground mt-2">Identify the buildings with the highest energy footprint.</p>
      </div>

      <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50 pb-6">
          <CardTitle className="text-xl font-bold">Highest Consuming Locations</CardTitle>
          <CardDescription>Lifetime total consumption comparison</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <Skeleton className="w-full h-[600px] rounded-xl" />
          ) : (
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topConsumers} 
                  layout="vertical" 
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    dataKey="location" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                    width={180}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.5 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Consumption']}
                  />
                  <Bar dataKey="totalConsumption" radius={[0, 6, 6, 0]} maxBarSize={32}>
                    {topConsumers?.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index < 3 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                        fillOpacity={index < 3 ? 0.8 : 0.9}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
