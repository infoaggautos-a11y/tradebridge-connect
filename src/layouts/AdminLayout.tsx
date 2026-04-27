import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { Globe, LayoutDashboard, Building2, Users, CalendarDays, CreditCard, Activity, LogOut, Mail, BarChart3, Shield, Scale, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';

const adminLinks = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Businesses', url: '/admin/businesses', icon: Building2 },
  { title: 'Matches', url: '/admin/matches', icon: Users },
  { title: 'Events', url: '/admin/events', icon: CalendarDays },
  { title: 'Subscriptions', url: '/admin/subscriptions', icon: CreditCard },
  { title: 'KYC Queue', url: '/admin/kyc', icon: Shield },
  { title: 'Disputes', url: '/admin/disputes', icon: Scale },
  { title: 'Finance', url: '/admin/finance', icon: DollarSign },
  { title: 'Marketing', url: '/admin/marketing', icon: Mail },
  { title: 'Activity Log', url: '/admin/activity', icon: Activity },
];

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-navy-dark text-white">
        <div className="p-4 border-b border-navy">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-gold shrink-0" />
            <span className="text-sm font-bold truncate">DIL Admin</span>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs">Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminLinks.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/admin'} className="text-gray-300 hover:text-gold hover:bg-navy" activeClassName="bg-navy text-gold">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4 border-t border-navy">
          <div className="text-xs text-gray-400 mb-2 truncate">{user?.name}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300 hover:text-gold p-0 h-auto" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground">Admin Dashboard</span>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
