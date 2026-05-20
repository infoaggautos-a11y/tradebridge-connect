import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { events } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarDays, MapPin, Users, Clock, Mail, Phone } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find(e => e.id === id);

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

  return (
    <PublicLayout>
      <div className="bg-navy py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white mb-4" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
          <Badge className="mb-3 bg-gold/20 text-gold border-gold/30 capitalize">{event.type.replace('-', ' ')}</Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{event.registrations}/{event.capacity}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="w-full rounded-lg object-cover max-h-[500px]" />
            )}
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{event.description}</p></CardContent>
            </Card>

            {event.agenda.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Agenda</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex items-center gap-2 w-20 shrink-0 text-sm font-mono text-gold">
                          <Clock className="h-4 w-4" />{item.time}
                        </div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.speaker && <div className="text-sm text-muted-foreground">{item.speaker}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {event.speakers.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Speakers</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.speakers.map((speaker, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                          {speaker.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{speaker.name}</div>
                          <div className="text-xs text-muted-foreground">{speaker.role}, {speaker.company}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {!event.isPast && (
              <Card className="border-gold/30">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-gold mb-1">{daysUntil}</div>
                  <div className="text-sm text-muted-foreground">days until event</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Event Enquiries</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">For further information, contact us on:</p>
                <a href="tel:+2347075443656" className="flex items-center gap-2 font-semibold text-foreground hover:text-gold transition-colors">
                  <Phone className="h-4 w-4 text-gold" />
                  +2347075443656
                </a>
                <a href="mailto:infodauno@gmail.com" className="flex items-center gap-2 font-semibold text-foreground hover:text-gold transition-colors">
                  <Mail className="h-4 w-4 text-gold" />
                  infodauno@gmail.com
                </a>
              </CardContent>
            </Card>

            {event.sponsors.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Sponsors</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.sponsors.map(sponsor => <Badge key={sponsor} variant="secondary">{sponsor}</Badge>)}
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
