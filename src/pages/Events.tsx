import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { events } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, Users } from 'lucide-react';

import heroImage from '@/assets/hero-trade-summit.jpg';
import eventConferenceImage from '@/assets/event-conference.jpg';
import delegationImage from '@/assets/delegation-group.jpg';
import agricultureImage from '@/assets/agriculture-trade.jpg';

const eventImages = [heroImage, agricultureImage, delegationImage, eventConferenceImage];

export default function EventsPage() {
  const navigate = useNavigate();
  const upcoming = events.filter(e => !e.isPast);
  const past = events.filter(e => e.isPast);

  const EventCard = ({ event, index }: { event: typeof events[0]; index: number }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || eventImages[index % eventImages.length]}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
        <Badge className="absolute top-3 left-3 bg-gold text-navy border-0 capitalize">{event.type.replace('-', ' ')}</Badge>
        {event.isPast && <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground border-0">Past Event</Badge>}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-gold transition-colors">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — {new Date(event.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{event.location}</div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" />{event.registrations}/{event.capacity} registered</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PublicLayout>
      <div className="relative overflow-hidden">
        <img src={eventConferenceImage} alt="Trade Events" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/85" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Events Hub</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Events & Delegations</h1>
          <p className="text-gray-300 max-w-2xl">Trade missions, conferences, workshops, and delegation programs connecting Nigerian businesses with global markets.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming">
          <TabsList><TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger><TabsTrigger value="past">Past ({past.length})</TabsTrigger></TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{upcoming.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}</div>
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{past.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
