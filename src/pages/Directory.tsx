import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { businesses, SECTORS, COUNTRIES } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, CheckCircle, Shield, Star } from 'lucide-react';

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

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

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
      <div className="bg-navy py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Business Directory</h1>
          <p className="text-gray-300">Discover verified businesses across Africa and Europe.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
            <Card key={biz.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/directory/${biz.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{biz.name}</h3>
                    <p className="text-sm text-muted-foreground">{biz.country}</p>
                  </div>
                  <Badge className={`${verificationColors[biz.verificationLevel]} text-xs`}>
                    {verificationIcons[biz.verificationLevel]}
                    <span className="ml-1 capitalize">{biz.verificationLevel}</span>
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {biz.sectors.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{biz.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Trade Readiness</span>
                    <span className="font-medium">{biz.tradeReadinessScore}%</span>
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
