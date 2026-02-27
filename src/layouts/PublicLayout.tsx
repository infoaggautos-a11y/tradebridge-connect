import { Link, useNavigate } from 'react-router-dom';
import { BrandBar } from '@/branding/BrandBar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function PublicNavbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Directory', href: '/directory' },
    { label: 'Events', href: '/events' },
    { label: 'Membership', href: '/membership' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy border-b border-navy-light">
      <BrandBar />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-gold" />
          <div>
            <span className="text-lg font-bold text-white">DIL</span>
            <span className="ml-1 text-sm text-gold hidden sm:inline">Global Trade Platform</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-gray-300 hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="text-gray-300 hover:text-gold" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-navy" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-light border-t border-navy px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-300 hover:text-gold">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-300 hover:text-gold">Dashboard</Link>
              <Button variant="outline" size="sm" className="border-gold text-gold w-full" onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
            </>
          ) : (
            <Button size="sm" className="bg-gold text-navy w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
          )}
        </div>
      )}
    </header>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-navy text-gray-400 py-12 border-t border-navy-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-gold" />
                <span className="text-white font-bold">DIL Global Trade</span>
              </div>
              <p className="text-sm mb-4">Dauno Integrated Ltd (DIL) — a transnational company incorporated in Abuja, Nigeria. Specializing in Business Re-engineering, Trade Promotion, and international commerce facilitation.</p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=100090199276052" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-sm">Facebook</a>
                <a href="https://twitter.com/daunoglobal" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-sm">Twitter</a>
                <a href="https://www.linkedin.com/company/daunointegrated-ltd/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-sm">LinkedIn</a>
                <a href="https://www.youtube.com/channel/UCPCfjapurX6wTFQmliOyGCA" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-sm">YouTube</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/directory" className="block hover:text-gold transition-colors">Business Directory</Link>
                <Link to="/events" className="block hover:text-gold transition-colors">Events & Delegations</Link>
                <Link to="/membership" className="block hover:text-gold transition-colors">Membership Plans</Link>
                <Link to="/login" className="block hover:text-gold transition-colors">TradeMatch Engine</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="https://www.daunointegrated.com/about-us/" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">About DIL</a>
                <a href="https://www.daunointegrated.com/our-business/" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Our Business</a>
                <a href="https://www.daunointegrated.com/partners/" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Partners</a>
                <a href="https://www.daunointegrated.com/contact-us/" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Contact Us</a>
                <a href="https://dilptp.com/" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">DIL Training Programmes</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>Abuja, Nigeria</p>
                <p>+234 909 478 3662</p>
                <p>info@daunointegrated.com</p>
                <p className="text-xs mt-4">RC: 1963419</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-navy-light flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <span>© 2026 Dauno Integrated Ltd. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-gold cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-gold cursor-pointer transition-colors">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
