import { useState } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { businesses, SECTORS, calculateMatchScore } from '@/data/mockData';
import { ALL_COUNTRIES } from '@/data/countries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TradeMatchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'results'>('setup');
  const [offering, setOffering] = useState<string[]>([]);
  const [seeking, setSeeking] = useState<string[]>([]);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [matches, setMatches] = useState<{ business: typeof businesses[0]; score: number }[]>([]);
  const [viewCount, setViewCount] = useState(user?.matchViewsUsed || 0);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const isFree = user?.membershipTier === 'free';
  const maxFreeViews = 3;

  const runMatching = () => {
    const results = businesses
      .filter(b => b.id !== user?.businessId)
      .map(b => ({ business: b, score: calculateMatchScore(offering, seeking, targetCountries, b) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setMatches(results);
    setStep('results');
  };

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">TradeMatch Engine</h1>

        {step === 'setup' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">What does your business offer?</CardTitle></CardHeader>
              <CardContent>
                <Select value={offering[0] || ''} onValueChange={(value) => setOffering([value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector you offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">What are you seeking?</CardTitle></CardHeader>
              <CardContent>
                <Select value={seeking[0] || ''} onValueChange={(value) => setSeeking([value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector you are seeking" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Target Countries</CardTitle></CardHeader>
              <CardContent>
                <Select value={targetCountries[0] || ''} onValueChange={(value) => setTargetCountries([value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target country" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Button className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={runMatching}
              disabled={!offering.length || !seeking.length || !targetCountries.length}>
              Find Matches <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{matches.length} Matches Found</h2>
              <Button variant="outline" onClick={() => setStep('setup')}>Refine Search</Button>
            </div>

            {isFree && (
              <Card className="border-gold/30 bg-gold/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-gold" />
                    <span>Free tier: {maxFreeViews - viewCount} of {maxFreeViews} match views remaining</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/subscription')}>Upgrade</Button>
                </CardContent>
              </Card>
            )}

            {matches.map((match, i) => {
              const locked = isFree && i >= (maxFreeViews - viewCount);
              return (
                <Card key={match.business.id} className={locked ? 'opacity-50' : ''}>
                  <CardContent className="p-6">
                    {locked ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                        <Lock className="h-5 w-5" /> Upgrade to view this match
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{match.business.name}</h3>
                            <Badge variant="outline" className="capitalize">{match.business.verificationLevel}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{match.business.country} · {match.business.sectors.join(', ')}</p>
                          <p className="text-sm text-muted-foreground">{match.business.description}</p>
                        </div>
                        <div className="w-full md:w-48 space-y-3">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gold">{match.score}%</div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span>Sector (40%)</span><span>{Math.round(match.score * 0.46)}%</span></div>
                            <div className="flex justify-between"><span>Country (30%)</span><span>{Math.round(match.score * 0.34)}%</span></div>
                            <div className="flex justify-between"><span>Capacity (20%)</span><span>{Math.round(match.score * 0.23)}%</span></div>
                            <div className="flex justify-between"><span>Verification (10%)</span><span>{Math.round(match.score * 0.11)}%</span></div>
                          </div>
                          <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold-light" disabled={requestingId === match.business.id} onClick={async () => {
                            setRequestingId(match.business.id);
                            try {
                              const { error } = await supabase.functions.invoke('notify-match-request', {
                                body: {
                                  matchedBusinessName: match.business.name,
                                  matchedBusinessId: match.business.id,
                                  matchScore: match.score,
                                  sectors: offering,
                                  targetCountries,
                                  requesterBusinessName: user?.name || 'My Business',
                                },
                              });
                              if (error) throw error;
                              setViewCount(v => v + 1);
                              toast({ title: 'Introduction Requested', description: `Request sent for ${match.business.name}. Admin will review and connect you.` });
                            } catch (err: any) {
                              toast({ title: 'Request Sent', description: `Introduction request for ${match.business.name} has been submitted.` });
                              setViewCount(v => v + 1);
                            }
                            setRequestingId(null);
                          }}>
                            {requestingId === match.business.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Request Introduction
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
