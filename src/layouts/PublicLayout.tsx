import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const navGroups: MenuGroup[] = [
  {
    label: 'Platform',
    items: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'TradeMatch Portal', href: '/matches' },
      { label: 'Deal Room', href: '/deals' },
      { label: 'Escrow & Payments', href: '/wallet' },
      { label: 'AI Trade Advisor', href: '/advisor' },
    ],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Browse Businesses', href: '/directory' },
      { label: 'Nigerian Companies', href: '/directory?country=Nigeria' },
      { label: 'International Partners', href: '/partners' },
      { label: 'Post Your Profile', href: '/login' },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'Upcoming Events', href: '/events' },
      { label: 'Trade Delegations', href: '/events?type=delegation' },
      { label: 'Past Events & Gallery', href: '/news' },
      { label: 'Host an Event', href: '/contact' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'About DIL', href: '/about' },
      { label: 'Our Team', href: '/about#team' },
      { label: 'Partners', href: '/partners' },
      { label: 'News & Updates', href: '/news' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Trade Intelligence', href: '/intelligence' },
      { label: 'Membership Plans', href: '/membership' },
      { label: 'Training Academy', href: '/training' },
      { label: 'Blog & Insights', href: '/news' },
    ],
  },
];

function Logo() {
  return (
    <Link to="/" className="flex min-w-[140px] items-center">
      <img src="/images/dil-logo.png" alt="DIL Logo" className="h-10 w-auto object-contain" />
    </Link>
  );
}

function DesktopNavItem({ label, items }: MenuGroup) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="group relative flex h-full items-center gap-1 text-sm font-medium text-[#CBD5E0] transition-colors duration-200 hover:text-white"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#D4A843] transition-transform duration-200 group-hover:scale-x-100" />
      </button>

      {/* Invisible bridge to prevent gap between trigger and dropdown */}
      {open && <div className="absolute left-0 top-full z-40 h-4 w-full" />}
      <div
        className={`absolute left-1/2 top-full z-50 pt-1 mt-0 w-[220px] -translate-x-1/2 transition-all duration-150 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
      <div className="rounded-[10px] border border-[rgba(212,168,67,0.2)] bg-[#111827] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group flex min-h-9 items-center border-l-0 border-transparent pl-3 text-sm text-[#9CA3AF] transition-all duration-200 hover:border-l-[3px] hover:border-[#D4A843] hover:pl-4 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden h-full items-center gap-7 md:flex">
      {navGroups.map((group) => (
        <DesktopNavItem key={group.label} label={group.label} items={group.items} />
      ))}
    </nav>
  );
}

export function PublicNavbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((current) => (current === label ? null : label));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-[rgba(212,168,67,0.15)] transition-all duration-200 ${
        isScrolled ? 'bg-[rgba(10,15,30,0.92)] backdrop-blur-[12px]' : 'bg-[#0A0F1E]'
      }`}
    >
      <div className="container mx-auto flex h-[70px] items-center justify-between px-4">
        <Logo />

        <div className="hidden h-full items-center md:flex">
          <DesktopNav />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="h-auto border border-[rgba(212,168,67,0.4)] bg-transparent px-5 py-[9px] text-sm text-[#D4A843] hover:bg-[rgba(212,168,67,0.1)] hover:text-[#D4A843]"
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                className="h-auto rounded-md bg-[#D4A843] px-[22px] py-[9px] text-sm font-semibold text-[#0A0F1E] hover:bg-[#E8C97A]"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-auto border border-[rgba(212,168,67,0.4)] bg-transparent px-5 py-[9px] text-sm text-[#D4A843] hover:bg-[rgba(212,168,67,0.1)] hover:text-[#D4A843]"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                className="h-auto rounded-md bg-[#D4A843] px-[22px] py-[9px] text-sm font-semibold text-[#0A0F1E] hover:bg-[#E8C97A]"
                onClick={() => navigate('/login')}
              >
                Join Free →
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-[#D4A843] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-[rgba(212,168,67,0.15)] bg-[#0A0F1E] transition-all duration-300 md:hidden ${
          mobileOpen ? 'max-h-[85vh]' : 'max-h-0 border-t-0'
        }`}
      >
        <div className="space-y-2 px-4 py-4">
          {navGroups.map((group) => {
            const isExpanded = mobileExpanded === group.label;
            return (
              <div key={group.label} className="rounded-md border border-[rgba(212,168,67,0.2)] bg-[#111827]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#CBD5E0]"
                  onClick={() => toggleMobileSection(group.label)}
                >
                  {group.label}
                  <ChevronDown className={`h-4 w-4 text-[#D4A843] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-64 pb-2' : 'max-h-0'}`}>
                  <div className="space-y-1 px-4">
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={closeMobile}
                        className="block border-l-2 border-transparent py-2 pl-2 text-sm text-[#9CA3AF] transition-all hover:border-[#D4A843] hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="space-y-3 pt-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="h-auto w-full border border-[rgba(212,168,67,0.4)] bg-transparent px-5 py-[9px] text-sm text-[#D4A843] hover:bg-[rgba(212,168,67,0.1)] hover:text-[#D4A843]"
                  onClick={() => {
                    closeMobile();
                    navigate(isAdmin ? '/admin' : '/dashboard');
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  className="h-auto w-full rounded-md bg-[#D4A843] px-[22px] py-[9px] text-sm font-semibold text-[#0A0F1E] hover:bg-[#E8C97A]"
                  onClick={() => {
                    closeMobile();
                    logout();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-auto w-full border border-[rgba(212,168,67,0.4)] bg-transparent px-5 py-[9px] text-sm text-[#D4A843] hover:bg-[rgba(212,168,67,0.1)] hover:text-[#D4A843]"
                  onClick={() => {
                    closeMobile();
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="h-auto w-full rounded-md bg-[#D4A843] px-[22px] py-[9px] text-sm font-semibold text-[#0A0F1E] hover:bg-[#E8C97A]"
                  onClick={() => {
                    closeMobile();
                    navigate('/login');
                  }}
                >
                  Join Free →
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-[70px]">{children}</main>
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
