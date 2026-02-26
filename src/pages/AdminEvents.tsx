import { AdminLayout } from '@/layouts/AdminLayout';
import { events } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Edit } from 'lucide-react';

export default function AdminEventsPage() {
  const { toast } = useToast();

  const exportCSV = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const csv = 'Name,Email,Ticket Tier,Date\nJohn Doe,john@example.com,Standard,2026-02-20\nJane Smith,jane@example.com,VIP,2026-02-21\nAhmed Hassan,ahmed@example.com,Free,2026-02-22';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event.title.replace(/\s+/g, '_')}_attendees.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV Exported', description: `Attendee list for ${event.title} downloaded.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Event Management</h1>
          <Button className="bg-gold text-navy hover:bg-gold-light" onClick={() => toast({ title: 'Coming Soon', description: 'Event creation form coming soon.' })}>
            <Plus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(event => {
                  const estRevenue = event.ticketTiers.reduce((acc, t) => acc + t.price * Math.floor(event.registrations / event.ticketTiers.length), 0);
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{event.type.replace('-', ' ')}</Badge></TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>{event.registrations}/{event.capacity}</TableCell>
                      <TableCell>${estRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => toast({ title: 'Edit Event', description: 'Event editing coming soon.' })}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => exportCSV(event.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
