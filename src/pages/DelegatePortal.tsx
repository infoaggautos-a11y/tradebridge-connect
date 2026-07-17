import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle,
  FileText,
  Loader2,
  Mail,
  Plane,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  TMOS_DEFAULT_DOCUMENT_REQUIREMENTS,
  TMOS_STAGE_LABELS,
  TMOSWorkflowStage,
} from '@/types/tmos';

type RegistrationRow = {
  id: string;
  event_id: string;
  event_title: string;
  full_name: string;
  email: string;
  company: string | null;
  workflow_stage: TMOSWorkflowStage | string;
  qualification_score: number | null;
  created_at: string;
};

type DelegateDocument = {
  id?: string;
  event_registration_id: string;
  document_code: string;
  label: string;
  status: string;
  file_name?: string | null;
  review_notes?: string | null;
  uploaded_at?: string | null;
};

type ItineraryItem = {
  id: string;
  event_registration_id: string;
  title: string;
  description?: string | null;
  item_type: string;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
  status: string;
};

type DelegateMatch = {
  id: string;
  event_registration_id: string;
  partner_company: string;
  partner_contact_name?: string | null;
  partner_country?: string | null;
  partner_sector?: string | null;
  match_score: number;
  meeting_objective?: string | null;
  scheduled_at?: string | null;
  location?: string | null;
  meeting_format: string;
  status: string;
};

type TravelCase = {
  event_registration_id: string;
  visa_status: string;
  invitation_letter_status: string;
  flight_status: string;
  accommodation_status: string;
  passport_valid_until?: string | null;
  visa_appointment_at?: string | null;
  arrival_at?: string | null;
  departure_at?: string | null;
  arrival_airport?: string | null;
  departure_airport?: string | null;
  accommodation_name?: string | null;
};

type MessageLog = {
  event_registration_id: string | null;
  subject?: string | null;
  status: string;
  sent_at?: string | null;
};

type DealFollowup = {
  id: string;
  event_registration_id: string | null;
  status: string;
  deal_value: number;
  deal_currency: string;
  deal_type: string;
  next_action_date?: string | null;
  next_action_type: string;
};

const journeyStages: TMOSWorkflowStage[] = [
  'new_registration',
  'under_review',
  'qualified',
  'accepted',
  'document_collection',
  'visa_support',
  'business_matching',
  'meeting_schedule_confirmed',
  'travel_confirmed',
  'event_attended',
  'deal_follow_up',
];

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const value = String(reader.result || '');
    resolve(value.includes(',') ? value.split(',')[1] : value);
  };
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const statusText = (value?: string | null) => String(value || 'not_started').replace(/_/g, ' ');

export default function DelegatePortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [documentMap, setDocumentMap] = useState<Record<string, DelegateDocument[]>>({});
  const [matchMap, setMatchMap] = useState<Record<string, DelegateMatch[]>>({});
  const [itineraryMap, setItineraryMap] = useState<Record<string, ItineraryItem[]>>({});
  const [travelMap, setTravelMap] = useState<Record<string, TravelCase>>({});
  const [messageMap, setMessageMap] = useState<Record<string, MessageLog[]>>({});
  const [dealMap, setDealMap] = useState<Record<string, DealFollowup[]>>({});

  const selected = registrations.find(item => item.id === selectedId) || registrations[0];
  const selectedDocuments = selected ? documentMap[selected.id] || [] : [];
  const selectedMatches = selected ? matchMap[selected.id] || [] : [];
  const selectedItinerary = selected ? itineraryMap[selected.id] || [] : [];
  const selectedTravel = selected ? travelMap[selected.id] : null;
  const selectedMessages = selected ? messageMap[selected.id] || [] : [];
  const selectedDeals = selected ? dealMap[selected.id] || [] : [];

  const fetchPortal = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data: registrationRows, error } = await supabase
      .from('event_registrations')
      .select('id, event_id, event_title, full_name, email, company, workflow_stage, qualification_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Unable to load portal', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const rows = (registrationRows || []) as RegistrationRow[];
    setRegistrations(rows);
    if (!selectedId && rows.length) setSelectedId(rows[0].id);
    const ids = rows.map(item => item.id);

    if (!ids.length) {
      setDocumentMap({});
      setMatchMap({});
      setItineraryMap({});
      setTravelMap({});
      setMessageMap({});
      setDealMap({});
      setLoading(false);
      return;
    }

    const [documents, matches, itinerary, travel, messages, deals] = await Promise.all([
      supabase.from('tmos_delegate_documents').select('*').in('event_registration_id', ids),
      supabase.from('tmos_delegate_matches').select('*').in('event_registration_id', ids),
      supabase.from('tmos_itinerary_items').select('*').in('event_registration_id', ids).order('start_at', { ascending: true }),
      supabase.from('tmos_travel_cases').select('*').in('event_registration_id', ids),
      supabase.from('tmos_message_logs').select('event_registration_id, subject, status, sent_at').in('event_registration_id', ids).order('created_at', { ascending: false }),
      supabase.from('tmos_deal_followups').select('*').in('event_registration_id', ids),
    ]);

    setDocumentMap(((documents.data || []) as DelegateDocument[]).reduce<Record<string, DelegateDocument[]>>((acc, item) => {
      acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
      return acc;
    }, {}));
    setMatchMap(((matches.data || []) as DelegateMatch[]).reduce<Record<string, DelegateMatch[]>>((acc, item) => {
      acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
      return acc;
    }, {}));
    setItineraryMap(((itinerary.data || []) as ItineraryItem[]).reduce<Record<string, ItineraryItem[]>>((acc, item) => {
      acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
      return acc;
    }, {}));
    setTravelMap(((travel.data || []) as TravelCase[]).reduce<Record<string, TravelCase>>((acc, item) => {
      acc[item.event_registration_id] = item;
      return acc;
    }, {}));
    setMessageMap(((messages.data || []) as MessageLog[]).reduce<Record<string, MessageLog[]>>((acc, item) => {
      if (!item.event_registration_id) return acc;
      acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
      return acc;
    }, {}));
    setDealMap(((deals.data || []) as DealFollowup[]).reduce<Record<string, DealFollowup[]>>((acc, item) => {
      if (!item.event_registration_id) return acc;
      acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
      return acc;
    }, {}));
    setLoading(false);
  };

  useEffect(() => {
    fetchPortal();
  }, [user?.id]);

  const stageProgress = useMemo(() => {
    if (!selected) return 0;
    const index = Math.max(0, journeyStages.indexOf(selected.workflow_stage as TMOSWorkflowStage));
    return Math.round(((index + 1) / journeyStages.length) * 100);
  }, [selected]);

  const uploadDocument = async (requirementCode: string, file: File | null) => {
    if (!selected || !file) return;
    setUploadingCode(requirementCode);
    try {
      const requirement = TMOS_DEFAULT_DOCUMENT_REQUIREMENTS.find(item => item.code === requirementCode);
      const base64Data = await fileToBase64(file);
      const { error } = await supabase.functions.invoke('upload-delegate-document', {
        body: {
          registrationId: selected.id,
          eventId: selected.event_id,
          email: selected.email,
          documentCode: requirementCode,
          label: requirement?.label || requirementCode,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          base64Data,
        },
      });
      if (error) throw error;
      toast({ title: 'Document uploaded', description: `${requirement?.label || 'Document'} has been submitted.` });
      await fetchPortal();
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Unable to upload document.', variant: 'destructive' });
    } finally {
      setUploadingCode(null);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MemberLayout>
    );
  }

  if (!registrations.length) {
    return (
      <MemberLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My TMOS Portal</h1>
            <p className="text-muted-foreground">Your trade mission journey will appear here after registration.</p>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarClock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No TMOS registrations yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Register interest for an event to start your delegate journey.</p>
              <Button asChild className="mt-4"><Link to="/events">View Events</Link></Button>
            </CardContent>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My TMOS Portal</h1>
            <p className="text-muted-foreground">Track your registration, documents, meetings, travel, and post-event follow-up.</p>
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={selected?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {registrations.map(item => (
                <option key={item.id} value={item.id}>{item.event_title}</option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchPortal}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {selected && (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current event</p>
                    <h2 className="text-xl font-semibold">{selected.event_title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.company || selected.full_name}</p>
                  </div>
                  <Badge className="w-fit">
                    {TMOS_STAGE_LABELS[selected.workflow_stage as TMOSWorkflowStage] || statusText(selected.workflow_stage)}
                  </Badge>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Journey progress</span>
                    <span>{stageProgress}%</span>
                  </div>
                  <Progress value={stageProgress} className="h-2" />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {journeyStages.map(stage => {
                    const active = journeyStages.indexOf(stage) <= journeyStages.indexOf(selected.workflow_stage as TMOSWorkflowStage);
                    return (
                      <div key={stage} className={`rounded-md border p-2 text-xs ${active ? 'border-gold/50 bg-gold/10' : 'bg-muted/30'}`}>
                        {active && <CheckCircle className="mb-1 h-3.5 w-3.5 text-gold" />}
                        {TMOS_STAGE_LABELS[stage]}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="flex h-auto flex-wrap justify-start">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
                <TabsTrigger value="travel">Visa & Travel</TabsTrigger>
                <TabsTrigger value="followups">Deal Follow-up</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="documents">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documents</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {TMOS_DEFAULT_DOCUMENT_REQUIREMENTS.map(requirement => {
                      const doc = selectedDocuments.find(item => item.document_code === requirement.code);
                      return (
                        <div key={requirement.code} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{requirement.label}{requirement.required ? ' *' : ''}</p>
                              <Badge variant={doc?.status === 'approved' ? 'default' : doc?.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {statusText(doc?.status || 'not_submitted')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                            {doc?.file_name && <p className="mt-1 text-xs text-muted-foreground">Submitted: {doc.file_name}</p>}
                            {doc?.review_notes && <p className="mt-1 text-xs text-destructive">{doc.review_notes}</p>}
                          </div>
                          <Label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border px-3 text-sm hover:bg-muted">
                            {uploadingCode === requirement.code ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            {doc?.status === 'rejected' ? 'Replace' : 'Upload'}
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={uploadingCode === requirement.code}
                              onChange={(e) => uploadDocument(requirement.code, e.target.files?.[0] || null)}
                            />
                          </Label>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meetings">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5" /> B2B Meetings</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {selectedMatches.length ? selectedMatches.map(match => (
                        <div key={match.id} className="rounded-md border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{match.partner_company}</p>
                              <p className="text-sm text-muted-foreground">{[match.partner_sector, match.partner_country].filter(Boolean).join(' - ')}</p>
                            </div>
                            <Badge variant="outline">{statusText(match.status)}</Badge>
                          </div>
                          {match.meeting_objective && <p className="mt-2 text-sm">{match.meeting_objective}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {match.scheduled_at ? new Date(match.scheduled_at).toLocaleString() : 'Schedule pending'}
                            {match.location ? ` at ${match.location}` : ''}
                          </p>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">No confirmed meetings yet.</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Itinerary</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {selectedItinerary.length ? selectedItinerary.map(item => (
                        <div key={item.id} className="rounded-md border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(item.start_at).toLocaleString()}</p>
                            </div>
                            <Badge variant="secondary">{statusText(item.status)}</Badge>
                          </div>
                          {item.location && <p className="mt-1 text-sm text-muted-foreground">{item.location}</p>}
                          {item.description && <p className="mt-2 text-sm">{item.description}</p>}
                        </div>
                      )) : <p className="text-sm text-muted-foreground">No itinerary items yet.</p>}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="travel">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5" /> Visa & Travel</CardTitle></CardHeader>
                  <CardContent>
                    {selectedTravel ? (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {[
                          ['Visa', selectedTravel.visa_status],
                          ['Invitation Letter', selectedTravel.invitation_letter_status],
                          ['Flight', selectedTravel.flight_status],
                          ['Accommodation', selectedTravel.accommodation_status],
                          ['Passport Valid Until', selectedTravel.passport_valid_until],
                          ['Visa Appointment', selectedTravel.visa_appointment_at ? new Date(selectedTravel.visa_appointment_at).toLocaleString() : null],
                          ['Arrival', selectedTravel.arrival_at ? new Date(selectedTravel.arrival_at).toLocaleString() : null],
                          ['Departure', selectedTravel.departure_at ? new Date(selectedTravel.departure_at).toLocaleString() : null],
                          ['Arrival Airport', selectedTravel.arrival_airport],
                          ['Departure Airport', selectedTravel.departure_airport],
                          ['Accommodation Name', selectedTravel.accommodation_name],
                        ].map(([label, value]) => (
                          <div key={label || ''} className="rounded-md border p-3">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="mt-1 text-sm font-medium capitalize">{value ? statusText(String(value)) : '-'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Travel support details will appear after the operations team opens your case.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="followups">
                <Card>
                  <CardHeader><CardTitle>Deal Follow-up</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {selectedDeals.length ? selectedDeals.map(deal => (
                      <div key={deal.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium capitalize">{statusText(deal.status)}</p>
                            <p className="text-sm text-muted-foreground">{deal.deal_currency} {Number(deal.deal_value || 0).toLocaleString()} - {statusText(deal.deal_type)}</p>
                          </div>
                          <Badge variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'destructive' : 'secondary'}>{statusText(deal.status)}</Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Next action: {statusText(deal.next_action_type)}{deal.next_action_date ? ` on ${deal.next_action_date}` : ''}
                        </p>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">Post-event opportunities will appear here after meetings are reviewed.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Messages</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {selectedMessages.length ? selectedMessages.map((message, index) => (
                      <div key={`${message.subject}-${index}`} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">{message.subject || 'TMOS update'}</p>
                          <Badge variant={message.status === 'sent' ? 'default' : 'secondary'}>{message.status}</Badge>
                        </div>
                        {message.sent_at && <p className="mt-1 text-xs text-muted-foreground">{new Date(message.sent_at).toLocaleString()}</p>}
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No messages logged yet.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MemberLayout>
  );
}
