import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { events } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, Users } from 'lucide-react';

export default function EventsPage() {
  const navigate = useNavigate();
  const upcoming = events.filter(e => !e.isPast);
  const past = events.filter(e => e.isPast);

  const EventCard = ({ event }: { event: typeof events[0] }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
      <CardContent className="p-6">
        <Badge className="mb-3 bg-gold/10 text-gold-dark border-0 capitalize">{event.type.replace('-', ' ')}</Badge>
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — {new Date(event.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4" />{event.registrations}/{event.capacity} registered</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PublicLayout>
      <div className="bg-navy py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Events & Delegations</h1>
          <p className="text-gray-300">Trade missions, conferences, workshops, and delegation programs.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming">
          <TabsList><TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger><TabsTrigger value="past">Past ({past.length})</TabsTrigger></TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{upcoming.map(e => <EventCard key={e.id} event={e} />)}</div>
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{past.map(e => <EventCard key={e.id} event={e} />)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
