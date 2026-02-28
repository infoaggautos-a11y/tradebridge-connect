import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function PublicNavbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Directory', href: '/directory' },
    { label: 'Events', href: '/events' },
    { label: 'News', href: '/news' },
    { label: 'Partners', href: '/partners' },
    { label: 'Training', href: '/training' },
    { label: 'Membership', href: '/membership' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--navy))] border-b border-[hsl(var(--navy-light))]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/dil-logo.png" alt="DIL Logo" className="h-10 w-auto" />
          <div>
            <span className="text-lg font-bold text-white">DIL</span>
            <span className="ml-1 text-sm text-[hsl(var(--gold))] hidden sm:inline">Global Trade Platform</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-gray-300 hover:text-[hsl(var(--gold))] transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="text-gray-300 hover:text-[hsl(var(--gold))]" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" className="border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--navy))]" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-[hsl(var(--navy-light))] border-t border-[hsl(var(--navy))] px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-300 hover:text-[hsl(var(--gold))]">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-300 hover:text-[hsl(var(--gold))]">Dashboard</Link>
              <Button variant="outline" size="sm" className="border-[hsl(var(--gold))] text-[hsl(var(--gold))] w-full" onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
            </>
          ) : (
            <Button size="sm" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
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
      <footer className="bg-[hsl(var(--navy))] text-gray-400 py-12 border-t border-[hsl(var(--navy-light))]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/dil-logo.png" alt="DIL Logo" className="h-8 w-auto" />
                <span className="text-white font-bold">DIL Global Trade</span>
              </div>
              <p className="text-sm mb-4">Dauno Integrated Ltd (DIL) — a transnational company incorporated in Abuja, Nigeria. Specializing in Business Re-engineering, Trade Promotion, and international commerce facilitation.</p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=100090199276052" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--gold))] transition-colors text-sm">Facebook</a>
                <a href="https://twitter.com/daunoglobal" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--gold))] transition-colors text-sm">Twitter</a>
                <a href="https://www.linkedin.com/company/daunointegrated-ltd/" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--gold))] transition-colors text-sm">LinkedIn</a>
                <a href="https://www.youtube.com/channel/UCPCfjapurX6wTFQmliOyGCA" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--gold))] transition-colors text-sm">YouTube</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block hover:text-[hsl(var(--gold))] transition-colors">About Us</Link>
                <Link to="/services" className="block hover:text-[hsl(var(--gold))] transition-colors">Our Services</Link>
                <Link to="/partners" className="block hover:text-[hsl(var(--gold))] transition-colors">Partners</Link>
                <Link to="/news" className="block hover:text-[hsl(var(--gold))] transition-colors">News & Events</Link>
                <Link to="/contact" className="block hover:text-[hsl(var(--gold))] transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/directory" className="block hover:text-[hsl(var(--gold))] transition-colors">Business Directory</Link>
                <Link to="/events" className="block hover:text-[hsl(var(--gold))] transition-colors">Events & Delegations</Link>
                <Link to="/membership" className="block hover:text-[hsl(var(--gold))] transition-colors">Membership Plans</Link>
                <Link to="/training" className="block hover:text-[hsl(var(--gold))] transition-colors">Training Programmes</Link>
                <Link to="/login" className="block hover:text-[hsl(var(--gold))] transition-colors">TradeMatch Engine</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>Plot 2626 Mohammed Isma St</p>
                <p>Asokoro, Abuja FCT, Nigeria</p>
                <p>+234 911 741 3918</p>
                <p>+234 909 478 3662</p>
                <p>daunointegrated@gmail.com</p>
                <p className="text-xs mt-4">RC: 1963419</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[hsl(var(--navy-light))] flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <span>© 2026 Dauno Integrated Ltd. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-[hsl(var(--gold))] cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-[hsl(var(--gold))] cursor-pointer transition-colors">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
