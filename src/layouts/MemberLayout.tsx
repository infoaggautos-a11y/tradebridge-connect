import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { Globe, LayoutDashboard, Building2, Users, CalendarDays, CreditCard, User, LogOut, Bot, BarChart3, Shield, Scale, Package, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipTier } from '@/data/mockData';
import { hasPlanAccess } from '@/lib/planAccess';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';

const memberLinks = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, minTier: 'free' as MembershipTier },
  { title: 'Directory', url: '/directory', icon: Building2, minTier: 'free' as MembershipTier },
  { title: 'My Matches', url: '/matches', icon: Users, minTier: 'free' as MembershipTier },
  { title: 'Events', url: '/events', icon: CalendarDays, minTier: 'free' as MembershipTier },
  { title: 'AI Advisor', url: '/advisor', icon: Bot, minTier: 'growth' as MembershipTier },
  { title: 'Intelligence', url: '/intelligence', icon: BarChart3, minTier: 'starter' as MembershipTier },
  { title: 'My Deals', url: '/deals', icon: Package, minTier: 'starter' as MembershipTier },
  { title: 'Verification', url: '/verification', icon: Shield, minTier: 'free' as MembershipTier },
  { title: 'Disputes', url: '/disputes', icon: Scale, minTier: 'free' as MembershipTier },
  { title: 'Wallet', url: '/wallet', icon: Wallet, minTier: 'free' as MembershipTier },
  { title: 'Subscription', url: '/subscription', icon: CreditCard, minTier: 'free' as MembershipTier },
  { title: 'Profile', url: '/profile', icon: User, minTier: 'free' as MembershipTier },
];

function MemberSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allowedLinks = memberLinks.filter((item) => hasPlanAccess(user?.membershipTier, item.minTier));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-navy text-white">
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-gold shrink-0" />
            <span className="text-sm font-bold truncate">DIL Trade</span>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedLinks.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="text-gray-300 hover:text-gold hover:bg-navy-light" activeClassName="bg-navy-light text-gold">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4 border-t border-navy-light">
          <div className="text-xs text-gray-400 mb-2 truncate">{user?.name}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300 hover:text-gold p-0 h-auto" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MemberSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground">Member Portal</span>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
