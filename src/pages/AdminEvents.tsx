import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { events } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Edit, Search, Users, Calendar, DollarSign, CheckCircle, Eye, Send } from 'lucide-react';
import { EventDelegate, Delegation, EventStatus } from '@/types/events';

const mockDelegates: EventDelegate[] = [
  { id: 'del1', businessId: 'b1', businessName: 'Lagos Agro Exports Ltd', contactName: 'Emeka Okonkwo', email: 'emeka@lagosagro.ng', phone: '+2348012345678', ticketTier: 'VIP Delegate', status: 'confirmed', registrationDate: '2026-02-15', visaSupport: true },
  { id: 'del2', businessId: 'b2', businessName: 'Napoli Trade Solutions', contactName: 'Maria Conti', email: 'maria@napolitrade.it', phone: '+393912345678', ticketTier: 'Delegate Pass', status: 'confirmed', registrationDate: '2026-02-18', visaSupport: false },
  { id: 'del3', businessId: 'b5', businessName: 'Milano Fashion House', contactName: 'Alessandro Rossi', email: 'alessandro@milanofh.it', phone: '+393923456789', ticketTier: 'VIP Delegate', status: 'confirmed', registrationDate: '2026-02-20', visaSupport: true },
  { id: 'del4', businessId: 'b3', businessName: 'Accra Textiles Co.', contactName: 'Kwame Asante', email: 'kwame@accratextiles.gh', phone: '+233501234567', ticketTier: 'Delegate Pass', status: 'registered', registrationDate: '2026-02-22', visaSupport: false },
  { id: 'del5', businessId: 'b8', businessName: 'Roma Pharma International', contactName: 'Dr. Luca Bianchi', email: 'luca@romapharma.it', phone: '+393933456789', ticketTier: 'VIP Delegate', status: 'confirmed', registrationDate: '2026-02-10', visaSupport: true },
];

const mockDelegations: Delegation[] = [
  {
    id: 'd1',
    eventId: 'e1',
    name: 'Italian Trade Delegation',
    leader: 'Marco Bianchi',
    country: 'Italy',
    members: [
      { id: 'm1', name: 'Giulia Romano', role: 'Trade Attaché', company: 'Italian Embassy', email: 'giulia@embassy.it' },
      { id: 'm2', name: 'Roberto Verdi', role: 'CEO', company: 'AgriChain Italia', email: 'roberto@agrichain.it' },
      { id: 'm3', name: 'Sofia Ferrari', role: 'Export Manager', company: 'Milano Foods', email: 'sofia@milanofoods.it' },
    ],
    status: 'confirmed',
    arrivalDate: '2026-04-14',
    departureDate: '2026-04-18',
    accommodation: 'Transcorp Hilton',
  },
  {
    id: 'd2',
    eventId: 'e1',
    name: 'Nigerian Exporters Delegation',
    leader: 'Chief Ade Ogunleye',
    country: 'Nigeria',
    members: [
      { id: 'm4', name: 'Dr. Amara Osei', role: 'Director', company: 'NEPC', email: 'amara@nepc.gov.ng' },
      { id: 'm5', name: 'Emeka Okonkwo', role: 'CEO', company: 'Lagos Agro Exports', email: 'emeka@lagosagroexports.ng' },
    ],
    status: 'confirmed',
    arrivalDate: '2026-04-14',
    departureDate: '2026-04-18',
    accommodation: 'Transcorp Hilton',
  },
];

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const filteredDelegates = mockDelegates.filter(d => 
    d.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eventStats = {
    totalRegistrations: mockDelegates.length,
    confirmed: mockDelegates.filter(d => d.status === 'confirmed').length,
    revenue: mockDelegates.reduce((sum, d) => sum + (d.ticketTier.includes('VIP') ? 2000 : 500), 0),
    vipCount: mockDelegates.filter(d => d.ticketTier.includes('VIP')).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Events & Delegations</h1>
            <p className="text-muted-foreground">Manage events, delegates, and delegations</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy hover:bg-gold-light">
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Fill in the details to create a new trade event</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="e.g., Nigeria-Italy Trade Summit 2026" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Abuja, Nigeria" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trade-mission">Trade Mission</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="delegation">Delegation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Event description..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsCreateDialogOpen(false); toast({ title: 'Event Created', description: 'New event has been created successfully.' }); }}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="delegates">Delegates</TabsTrigger>
            <TabsTrigger value="delegations">Delegations</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
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
                              <Button size="sm" variant="ghost" className="h-7" onClick={() => toast({ title: 'View Event', description: 'Event details coming soon.' })}>
                                <Eye className="h-4 w-4" />
                              </Button>
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
          </TabsContent>

          <TabsContent value="delegates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{eventStats.totalRegistrations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confirmed</p>
                      <p className="text-xl font-bold">{eventStats.confirmed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold">${eventStats.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">VIP</p>
                      <p className="text-xl font-bold">{eventStats.vipCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Delegate Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." className="pl-8 w-[200px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visa</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDelegates.map((delegate) => (
                      <TableRow key={delegate.id}>
                        <TableCell className="font-medium">{delegate.businessName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{delegate.contactName}</p>
                            <p className="text-xs text-muted-foreground">{delegate.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={delegate.ticketTier.includes('VIP') ? 'default' : 'secondary'}>
                            {delegate.ticketTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={delegate.status === 'confirmed' ? 'default' : 'secondary'}>
                            {delegate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {delegate.visaSupport ? (
                            <Badge variant="outline" className="text-green-600">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(delegate.registrationDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delegations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Delegation Groups</CardTitle>
                  <Button className="bg-gold text-navy hover:bg-gold-light gap-2">
                    <Plus className="h-4 w-4" /> Add Delegation
                  </Button>
                </div>
                <CardDescription>Manage delegation groups for trade events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDelegations.map((delegation) => (
                    <div key={delegation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{delegation.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Leader: {delegation.leader} • {delegation.country}
                          </p>
                        </div>
                        <Badge variant={delegation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {delegation.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Arrival</p>
                          <p className="font-medium">{delegation.arrivalDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Departure</p>
                          <p className="font-medium">{delegation.departureDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hotel</p>
                          <p className="font-medium">{delegation.accommodation}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Members ({delegation.members.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {delegation.members.map((member) => (
                            <Badge key={member.id} variant="outline" className="text-xs">
                              {member.name} - {member.company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
