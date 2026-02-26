import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { getBusinessById } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Star, Shield, Globe, Mail, Building2, Package, Award, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BusinessProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const business = getBusinessById(id || '');

  if (!business) {
    return <PublicLayout><div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Business not found</h2><Button className="mt-4" onClick={() => navigate('/directory')}>Back to Directory</Button></div></PublicLayout>;
  }

  const vIcon = business.verificationLevel === 'premium' ? <Star className="h-4 w-4" /> : business.verificationLevel === 'verified' ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />;

  return (
    <PublicLayout>
      <div className="bg-navy py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white mb-4" onClick={() => navigate('/directory')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{business.name}</h1>
                <Badge className="bg-gold/20 text-gold border-gold/30">{vIcon}<span className="ml-1 capitalize">{business.verificationLevel}</span></Badge>
              </div>
              <p className="text-gray-300">{business.country} · Est. {business.yearEstablished} · {business.employees} employees</p>
            </div>
            <Button className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => toast({ title: 'Introduction Requested', description: 'DIL team will review and facilitate the introduction.' })}>
              Request Introduction
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-gold" /> About</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{business.description}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-gold" /> Products & Services</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{business.products.map(p => <Badge key={p} variant="outline">{p}</Badge>)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-gold" /> Certifications</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{business.certifications.map(c => <Badge key={c} className="bg-green-100 text-green-700">{c}</Badge>)}</div></CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Trade Readiness Score</CardTitle></CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gold mb-2">{business.tradeReadinessScore}%</div>
                <Progress value={business.tradeReadinessScore} className="h-3 mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Profile Completeness</span><span>{business.profileCompleteness}%</span></div>
                  <Progress value={business.profileCompleteness} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Trade Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Export Capacity:</span><div className="font-medium">{business.exportCapacity}</div></div>
                <div><span className="text-muted-foreground">Min Order Qty:</span><div className="font-medium">{business.minOrderQty}</div></div>
                <div><span className="text-muted-foreground">Sectors:</span><div className="flex flex-wrap gap-1 mt-1">{business.sectors.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Preferred Markets</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{business.preferredMarkets.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}</div></CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{business.contactEmail}</div>
                {business.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{business.website}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
