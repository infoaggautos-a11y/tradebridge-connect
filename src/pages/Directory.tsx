import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { businesses as mockBusinesses, SECTORS, COUNTRIES, type Business } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, CheckCircle, Shield, Star, Building2, MapPin, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import logisticsImage from '@/assets/logistics-port.jpg';

const verificationIcons = {
  basic: <Shield className="h-3 w-3" />,
  verified: <CheckCircle className="h-3 w-3" />,
  premium: <Star className="h-3 w-3" />,
};
const verificationColors = {
  basic: 'bg-muted text-muted-foreground',
  verified: 'bg-blue-100 text-blue-700',
  premium: 'bg-gold/20 text-gold-dark border-gold/30',
};

const OFFICE_DIRECTORY_NAMES = new Set(['hnery', 'taxcode', 'floodgate system']);

const isOfficeDirectoryAccount = (name: string | null | undefined) =>
  OFFICE_DIRECTORY_NAMES.has((name || '').trim().toLowerCase());

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [registered, setRegistered] = useState<Business[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('business_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to load directory registrations', error);
        return;
      }
      const mapped: Business[] = (data || [])
        .filter((r: any) => !isOfficeDirectoryAccount(r.company_name))
        .map((r: any) => ({
        id: `reg-${r.id}`,
        name: r.company_name,
        country: r.country || 'Italy',
        sectors: r.sector ? [r.sector] : [],
        products: r.products_services
          ? r.products_services.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 8)
          : [],
        exportCapacity: r.annual_revenue || 'N/A',
        certifications: r.registration_number ? [r.registration_number] : [],
        minOrderQty: 'N/A',
        preferredMarkets: r.export_markets
          ? r.export_markets.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean)
          : [],
        verificationLevel: 'basic' as const,
        tradeReadinessScore: 50,
        profileCompleteness: 60,
        description: r.additional_notes || `${r.company_name} — registered business${r.city ? ` in ${r.city}` : ''}.`,
        yearEstablished: new Date(r.created_at).getFullYear(),
        employees: r.company_size || 'N/A',
        contactEmail: r.email,
        website: r.website || undefined,
      }));
      setRegistered(mapped);
    })();
  }, []);

  const businesses = [...registered, ...mockBusinesses];

  const filtered = businesses.filter(b => {
    const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.products.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
      b.sectors.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesSector = sectorFilter === 'all' || b.sectors.includes(sectorFilter);
    const matchesCountry = countryFilter === 'all' || b.country === countryFilter;
    const matchesVerification = verificationFilter === 'all' || b.verificationLevel === verificationFilter;
    return matchesSearch && matchesSector && matchesCountry && matchesVerification;
  });

  return (
    <PublicLayout>
      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <img src={logisticsImage} alt="Global Trade" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/85" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Business Directory</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Discover Verified Trade Partners</h1>
          <p className="text-gray-300 max-w-2xl">Browse our network of verified businesses across Africa and Europe. Filter by sector, country, and verification level to find your ideal trade partner.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search businesses, products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger><SelectValue placeholder="Verification" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} businesses found</p>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(biz => (
            <Card key={biz.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/directory/${biz.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                      <Building2 className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">{biz.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.country}</p>
                    </div>
                  </div>
                  <Badge className={`${verificationColors[biz.verificationLevel]} text-xs`}>
                    {verificationIcons[biz.verificationLevel]}
                    <span className="ml-1 capitalize">{biz.verificationLevel}</span>
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {biz.sectors.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{biz.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {biz.products.slice(0, 3).map(p => (
                    <span key={p} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      <Package className="h-3 w-3" /> {p}
                    </span>
                  ))}
                  {biz.products.length > 3 && <span className="text-xs text-muted-foreground">+{biz.products.length - 3} more</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Trade Readiness</span>
                    <span className="font-medium text-gold">{biz.tradeReadinessScore}%</span>
                  </div>
                  <Progress value={biz.tradeReadinessScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
