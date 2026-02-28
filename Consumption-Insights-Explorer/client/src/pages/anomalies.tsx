import { useAnomalies } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

export default function Anomalies() {
  const { data: anomalies, isLoading } = useAnomalies();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Anomaly Detection
            <Badge variant="destructive" className="px-3 py-1 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
              {anomalies?.length || 0} Found
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-2">Historical consumption spikes identified by isolation forest models.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Acknowledge All
        </button>
      </div>

      <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50">
          <CardTitle className="text-xl font-bold">Anomaly Records</CardTitle>
          <CardDescription>Unusual consumption events sorted by severity.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          ) : anomalies?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">No anomalies detected</h3>
              <p className="text-muted-foreground mt-2">Energy consumption is within expected parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Date</TableHead>
                    <TableHead className="font-semibold text-foreground">Location</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Reading (kWh)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Difference</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
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
                          High Spike
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

// Ensure Building2 is imported if missing locally in the same file
import { Building2 } from "lucide-react";
