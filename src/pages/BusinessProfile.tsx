import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { getBusinessById } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Star, Shield, Globe, Mail, Building2, Package, Award, MapPin, Calendar, Users, TrendingUp, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import matchmakingImage from '@/assets/matchmaking-session.jpg';

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
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img src={matchmakingImage} alt="Business profile" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button variant="ghost" className="text-gray-300 hover:text-white mb-4" onClick={() => navigate('/directory')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gold/20 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="h-8 w-8 text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{business.name}</h1>
                  <Badge className="bg-gold/20 text-gold border-gold/30">{vIcon}<span className="ml-1 capitalize">{business.verificationLevel}</span></Badge>
                </div>
                <p className="text-gray-300 flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{business.country}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Est. {business.yearEstablished}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{business.employees} employees</span>
                </p>
              </div>
            </div>
            <Button className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => toast({ title: 'Introduction Requested', description: 'DIL team will review and facilitate the introduction within 48 hours.' })}>
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
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{business.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Country</div>
                    <div className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-gold" />{business.country}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Established</div>
                    <div className="font-medium">{business.yearEstablished}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Team Size</div>
                    <div className="font-medium">{business.employees}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-gold" /> Products & Services</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {business.products.map(p => <Badge key={p} variant="outline" className="text-sm py-1 px-3">{p}</Badge>)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-gold" /> Certifications</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {business.certifications.map(c => (
                    <Badge key={c} className="bg-green-100 text-green-700 text-sm py-1 px-3">
                      <CheckCircle className="h-3 w-3 mr-1" />{c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-gold" /> Trade Capacity</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Export Capacity</div>
                    <div className="font-semibold text-foreground">{business.exportCapacity}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Min Order Qty</div>
                    <div className="font-semibold text-foreground">{business.minOrderQty}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gold" /> Trade Readiness Score</CardTitle></CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gold mb-2">{business.tradeReadinessScore}%</div>
                <Progress value={business.tradeReadinessScore} className="h-3 mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Profile Completeness</span><span>{business.profileCompleteness}%</span></div>
                    <Progress value={business.profileCompleteness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Verification Level</span><span className="capitalize">{business.verificationLevel}</span></div>
                    <Progress value={business.verificationLevel === 'premium' ? 100 : business.verificationLevel === 'verified' ? 66 : 33} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Sectors</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">{business.sectors.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Preferred Markets</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{business.preferredMarkets.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 text-gold" />{business.contactEmail}</div>
                {business.website && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4 text-gold" />{business.website}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
