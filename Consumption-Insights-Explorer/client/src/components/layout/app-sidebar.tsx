import { Link, useLocation } from "wouter";
import { 
  Activity, 
  BarChart3, 
  Building2, 
  AlertTriangle, 
  Zap,
  LayoutDashboard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Trends", url: "/trends", icon: Activity },
  { title: "Top Consumers", url: "/consumers", icon: Building2 },
  { title: "Anomalies", url: "/anomalies", icon: AlertTriangle },
  { title: "Predictions", url: "/predictions", icon: Zap },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="sidebar" className="border-r shadow-xl shadow-black/5 z-20 bg-slate-900 text-white">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">GiveGoa</h2>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Energy Analytics</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-xs font-semibold mb-2">Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        w-full justify-start h-11 px-4 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary hover:text-white font-semibold' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white font-medium'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
