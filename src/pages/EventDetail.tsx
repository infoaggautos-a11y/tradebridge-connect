import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { events } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, CalendarDays, MapPin, Users, Clock, Mail, Phone, CheckCircle, Loader2,
  Sparkles, Target, Trophy, Share2, Copy, Linkedin, Facebook, MessageCircle, Twitter,
} from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const event = events.find(e => e.id === id);
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '', country: '', notes: '' });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = event?.shareTagline || event?.title || '';

  const groupedAgenda = useMemo(() => {
    if (!event) return [] as { day: string; items: typeof event.agenda }[];
    const map = new Map<string, typeof event.agenda>();
    event.agenda.forEach(item => {
      const key = item.day || 'Programme';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
  }, [event]);

  if (!event) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Event not found</h2>
        </div>
      </PublicLayout>
    );
  }

  const eventDate = new Date(event.date);
  const now = new Date();
  const daysUntil = Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const handleRegister = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({ title: 'Missing info', description: 'Full name and email are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('notify-event-registration', {
        body: {
          eventId: event.id, eventTitle: event.title,
          fullName: form.fullName.trim(), email: form.email.trim(),
          phone: form.phone.trim(), company: form.company.trim(),
          country: form.country.trim(), notes: form.notes.trim(),
        },
      });
      if (error) throw error;
      setRegistered(true);
      toast({ title: 'Registration received', description: 'We have sent your registration details to the event team.' });
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const enc = encodeURIComponent;
  const shareLinks = [
    { name: 'X / Twitter', icon: Twitter, color: 'bg-black hover:bg-black/80', url: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}` },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90', url: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
    { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2] hover:bg-[#1877F2]/90', url: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}` },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366] hover:bg-[#25D366]/90', url: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}` },
  ];

  return (
    <PublicLayout>
      {/* Hero — colourful pitch banner */}
      <div className="relative overflow-hidden">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/85 to-[#009A49]/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-transparent to-[#CE2B37]/20" />
        <div className="relative container mx-auto px-4 py-14">
          <Button variant="ghost" className="text-gray-200 hover:text-white mb-6" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-gold text-navy border-0 capitalize">{event.type.replace('-', ' ')}</Badge>
            <Badge className="bg-white/10 text-white border-white/20">🇮🇹 Italy × 🇳🇬 Nigeria</Badge>
            <Badge className="bg-[#009A49]/30 text-white border-[#009A49]/50">6 Days · 1 Mission</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight max-w-4xl">
            {event.title}
          </h1>
          {event.tagline && (
            <p className="text-lg md:text-xl text-gold font-medium mb-4 max-w-3xl">{event.tagline}</p>
          )}
          <div className="flex flex-wrap gap-4 text-gray-200 text-sm mb-6">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" />13 – 19 July 2026</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" />{event.location}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gold" />{event.registrations}/{event.capacity} delegates</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-bold" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
              Reserve My Seat
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' })}>
              <Share2 className="h-4 w-4 mr-2" /> Share This Mission
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pitch */}
            <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold" /> Why this week matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-gold" /> What you walk away with</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {event.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/60">
                        <CheckCircle className="h-5 w-5 text-[#009A49] shrink-0 mt-0.5" />
                        <span className="text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Focus areas */}
            {event.focusAreas && event.focusAreas.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-gold" /> Focus areas</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.focusAreas.map(f => (
                      <Badge key={f} className="bg-navy text-white border-0 px-3 py-1.5 text-sm">{f}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agenda by day */}
            <Card>
              <CardHeader><CardTitle>Full week programme</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {groupedAgenda.map(group => (
                  <div key={group.day}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold font-semibold text-sm mb-3">
                      <CalendarDays className="h-4 w-4" /> {group.day}
                    </div>
                    <div className="space-y-3 pl-2 border-l-2 border-gold/30">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex gap-4 pl-4">
                          <div className="flex items-center gap-1 w-16 shrink-0 text-xs font-mono text-gold">
                            <Clock className="h-3 w-3" />{item.time}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            {item.speaker && <div className="text-xs text-muted-foreground">{item.speaker}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Outcomes */}
            {event.outcomes && event.outcomes.length > 0 && (
              <Card className="bg-gradient-to-br from-[#009A49]/10 to-transparent border-[#009A49]/30">
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-[#009A49]" /> Expected outcomes</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-[#009A49] font-bold">→</span><span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Speakers & convenors</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.speakers.map((speaker, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">{speaker.name[0]}</div>
                        <div>
                          <div className="font-medium text-sm">{speaker.name}</div>
                          <div className="text-xs text-muted-foreground">{speaker.role} · {speaker.company}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share — colourful social */}
            <Card id="share" className="overflow-hidden border-0">
              <div className="relative p-6 bg-gradient-to-br from-[#CE2B37] via-navy to-[#009A49] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-5 w-5" />
                  <h3 className="text-xl font-bold">Spread the mission</h3>
                </div>
                <p className="text-sm text-white/90 mb-4 max-w-xl">
                  Help us fill the room with Nigeria's most ambitious agri-food founders. Share this in one tap:
                </p>
                <p className="text-sm italic bg-white/10 rounded-lg p-3 mb-4 border border-white/20">"{shareText}"</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {shareLinks.map(s => (
                    <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                      className={`${s.color} text-white rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-transform hover:-translate-y-0.5`}>
                      <s.icon className="h-4 w-4" /> {s.name}
                    </a>
                  ))}
                  <button onClick={copyShare}
                    className="bg-white text-navy rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-transform hover:-translate-y-0.5">
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {!event.isPast && (
              <Card className="border-gold/30 bg-gradient-to-br from-navy to-navy/80 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-extrabold text-gold mb-1">{daysUntil}</div>
                  <div className="text-sm text-white/80">days until takeoff ✈️</div>
                </CardContent>
              </Card>
            )}

            <Card id="register">
              <CardHeader>
                <CardTitle className="text-base">Reserve your seat</CardTitle>
                {event.ticketTiers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {event.ticketTiers.map(t => (
                      <div key={t.tier} className="text-xs p-2 rounded bg-secondary">
                        <div className="font-semibold">{t.label} {t.price > 0 ? `· $${t.price}` : '· Free'}</div>
                        <div className="text-muted-foreground mt-0.5">{t.perks.slice(0, 2).join(' · ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {registered ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Registration received.</p>
                    <p className="text-xs text-muted-foreground mt-1">You will receive an email confirmation shortly.</p>
                  </div>
                ) : event.isPast ? (
                  <p className="text-sm text-muted-foreground text-center py-4">This event has ended.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                      <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="company" className="text-xs">Company</Label>
                      <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="country" className="text-xs">Country</Label>
                      <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="notes" className="text-xs">Notes</Label>
                      <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <Button className="w-full bg-gold text-navy hover:bg-gold-light font-semibold" disabled={submitting} onClick={handleRegister}>
                      {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Registration'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {event.organizers && event.organizers.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Organised by</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {event.organizers.map(o => (
                    <div key={o} className="text-sm font-medium">{o}</div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Event enquiries</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">For further information, contact us on:</p>
                <a href="tel:+2347075443656" className="flex items-center gap-2 font-semibold text-foreground hover:text-gold transition-colors">
                  <Phone className="h-4 w-4 text-gold" /> +234 707 544 3656
                </a>
                <a href="mailto:info@daunointegrated.com" className="flex items-center gap-2 font-semibold text-foreground hover:text-gold transition-colors">
                  <Mail className="h-4 w-4 text-gold" /> info@daunointegrated.com
                </a>
              </CardContent>
            </Card>

            {event.sponsors.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Partners</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.sponsors.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
