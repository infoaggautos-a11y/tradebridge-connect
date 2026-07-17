import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { events } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Edit, Search, Users, Calendar, DollarSign, CheckCircle, Eye, Send, RefreshCw, Loader2, Mail, FileText, ExternalLink, XCircle, CalendarPlus, Handshake } from 'lucide-react';
import { EventDelegate, Delegation, EventStatus } from '@/types/events';
import { TMOS_ADMIN_STAGES, TMOS_STAGE_LABELS, TMOSAccommodationStatus, TMOSBusinessPartner, TMOSDelegateDocument, TMOSDelegateMatch, TMOSDocumentStatus, TMOSInvitationLetterStatus, TMOSItineraryItem, TMOSMessageLog, TMOSTravelCase, TMOSTravelTaskStatus, TMOSVisaStatus, TMOSWorkflowStage } from '@/types/tmos';
import { stageToLegacyStatus } from '@/services/tmosService';

const mockDelegates: EventDelegate[] = [
  { id: 'del1', businessId: 'b1', businessName: 'Lagos Agro Exports Ltd', contactName: 'Emeka Okonkwo', email: 'emeka@lagosagro.ng', phone: '+2348012345678', journeyTrack: 'Executive Track', status: 'confirmed', registrationDate: '2026-02-15', visaSupport: true },
  { id: 'del2', businessId: 'b2', businessName: 'Napoli Trade Solutions', contactName: 'Maria Conti', email: 'maria@napolitrade.it', phone: '+393912345678', journeyTrack: 'Business Track', status: 'confirmed', registrationDate: '2026-02-18', visaSupport: false },
  { id: 'del3', businessId: 'b5', businessName: 'Milano Fashion House', contactName: 'Alessandro Rossi', email: 'alessandro@milanofh.it', phone: '+393923456789', journeyTrack: 'Executive Track', status: 'confirmed', registrationDate: '2026-02-20', visaSupport: true },
  { id: 'del4', businessId: 'b3', businessName: 'Accra Textiles Co.', contactName: 'Kwame Asante', email: 'kwame@accratextiles.gh', phone: '+233501234567', journeyTrack: 'Business Track', status: 'registered', registrationDate: '2026-02-22', visaSupport: false },
  { id: 'del5', businessId: 'b8', businessName: 'Roma Pharma International', contactName: 'Dr. Luca Bianchi', email: 'luca@romapharma.it', phone: '+393933456789', journeyTrack: 'Executive Track', status: 'confirmed', registrationDate: '2026-02-10', visaSupport: true },
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

type EventRegistrationRow = {
  id: string;
  event_id: string;
  event_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  notes: string | null;
  status: string;
  workflow_stage: TMOSWorkflowStage | string;
  qualification_score: number | null;
  score_breakdown: any;
  application_payload: any;
  created_at: string;
};

type MatchForm = {
  partnerId: string;
  partnerCompany: string;
  partnerContactName: string;
  partnerEmail: string;
  partnerCountry: string;
  partnerSector: string;
  matchScore: string;
  matchRationale: string;
  meetingObjective: string;
  scheduledAt: string;
  location: string;
  meetingFormat: 'in_person' | 'virtual' | 'hybrid';
  notes: string;
};

type TravelForm = {
  visaStatus: TMOSVisaStatus;
  invitationLetterStatus: TMOSInvitationLetterStatus;
  flightStatus: TMOSTravelTaskStatus;
  accommodationStatus: TMOSAccommodationStatus;
  passportValidUntil: string;
  visaAppointmentAt: string;
  arrivalAt: string;
  departureAt: string;
  arrivalAirport: string;
  departureAirport: string;
  accommodationName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
};

const defaultMatchForm: MatchForm = {
  partnerId: 'custom',
  partnerCompany: '',
  partnerContactName: '',
  partnerEmail: '',
  partnerCountry: '',
  partnerSector: '',
  matchScore: '75',
  matchRationale: '',
  meetingObjective: '',
  scheduledAt: '',
  location: '',
  meetingFormat: 'in_person',
  notes: '',
};

const defaultTravelForm: TravelForm = {
  visaStatus: 'not_started',
  invitationLetterStatus: 'not_started',
  flightStatus: 'not_started',
  accommodationStatus: 'not_started',
  passportValidUntil: '',
  visaAppointmentAt: '',
  arrivalAt: '',
  departureAt: '',
  arrivalAirport: '',
  departureAirport: '',
  accommodationName: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: '',
};

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistrationRow[]>([]);
  const [documentMap, setDocumentMap] = useState<Record<string, TMOSDelegateDocument[]>>({});
  const [messageMap, setMessageMap] = useState<Record<string, TMOSMessageLog[]>>({});
  const [partners, setPartners] = useState<TMOSBusinessPartner[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, TMOSDelegateMatch[]>>({});
  const [itineraryMap, setItineraryMap] = useState<Record<string, TMOSItineraryItem[]>>({});
  const [travelMap, setTravelMap] = useState<Record<string, TMOSTravelCase>>({});
  const [regLoading, setRegLoading] = useState(true);
  const [regSearch, setRegSearch] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistrationRow | null>(null);
  const [sendingUpdateId, setSendingUpdateId] = useState<string | null>(null);
  const [matchForm, setMatchForm] = useState<MatchForm>(defaultMatchForm);
  const [travelForm, setTravelForm] = useState<TravelForm>(defaultTravelForm);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [savingTravel, setSavingTravel] = useState(false);

  const fetchRegistrations = async () => {
    setRegLoading(true);
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load registrations', description: error.message, variant: 'destructive' });
    } else {
      const rows = (data || []) as EventRegistrationRow[];
      setRegistrations(rows);
      const registrationIds = rows.map(r => r.id);
      if (registrationIds.length) {
        const [{ data: documents }, { data: messages }, { data: matches }, { data: itineraryItems }, { data: travelCases }, { data: partnerRows }] = await Promise.all([
          supabase
            .from('tmos_delegate_documents')
            .select('id, event_registration_id, document_code, label, status, file_url, file_name, review_notes, reviewed_at')
            .in('event_registration_id', registrationIds),
          supabase
            .from('tmos_message_logs')
            .select('event_registration_id, channel, recipient, subject, workflow_stage, status, error_message, sent_at')
            .in('event_registration_id', registrationIds)
            .order('created_at', { ascending: false }),
          supabase
            .from('tmos_delegate_matches')
            .select('*')
            .in('event_registration_id', registrationIds)
            .order('scheduled_at', { ascending: true, nullsFirst: false }),
          supabase
            .from('tmos_itinerary_items')
            .select('*')
            .in('event_registration_id', registrationIds)
            .order('start_at', { ascending: true }),
          supabase
            .from('tmos_travel_cases')
            .select('*')
            .in('event_registration_id', registrationIds),
          supabase
            .from('tmos_business_partners')
            .select('*')
            .in('event_id', Array.from(new Set(rows.map(r => r.event_id))))
            .eq('status', 'active')
            .order('company_name', { ascending: true }),
        ]);
        setDocumentMap((documents || []).reduce<Record<string, TMOSDelegateDocument[]>>((acc, doc: any) => {
          acc[doc.event_registration_id] = [...(acc[doc.event_registration_id] || []), doc];
          return acc;
        }, {}));
        setMessageMap((messages || []).reduce<Record<string, TMOSMessageLog[]>>((acc, message: any) => {
          acc[message.event_registration_id] = [...(acc[message.event_registration_id] || []), message];
          return acc;
        }, {}));
        setMatchMap((matches || []).reduce<Record<string, TMOSDelegateMatch[]>>((acc, match: any) => {
          acc[match.event_registration_id] = [...(acc[match.event_registration_id] || []), match];
          return acc;
        }, {}));
        setItineraryMap((itineraryItems || []).reduce<Record<string, TMOSItineraryItem[]>>((acc, item: any) => {
          acc[item.event_registration_id] = [...(acc[item.event_registration_id] || []), item];
          return acc;
        }, {}));
        setTravelMap((travelCases || []).reduce<Record<string, TMOSTravelCase>((acc, travelCase: any) => {
          acc[travelCase.event_registration_id] = travelCase;
          return acc;
        }, {}));
        setPartners((partnerRows || []) as TMOSBusinessPartner[]);
      } else {
        setDocumentMap({});
        setMessageMap({});
        setMatchMap({});
        setItineraryMap({});
        setTravelMap({});
        setPartners([]);
      }
    }
    setRegLoading(false);
  };

  useEffect(() => { fetchRegistrations(); }, []);

  useEffect(() => {
    if (!selectedRegistration) return;
    setMatchForm(defaultMatchForm);
    const travelCase = travelMap[selectedRegistration.id];
    setTravelForm(travelCase ? {
      visaStatus: travelCase.visa_status,
      invitationLetterStatus: travelCase.invitation_letter_status,
      flightStatus: travelCase.flight_status,
      accommodationStatus: travelCase.accommodation_status,
      passportValidUntil: travelCase.passport_valid_until || '',
      visaAppointmentAt: travelCase.visa_appointment_at ? travelCase.visa_appointment_at.slice(0, 16) : '',
      arrivalAt: travelCase.arrival_at ? travelCase.arrival_at.slice(0, 16) : '',
      departureAt: travelCase.departure_at ? travelCase.departure_at.slice(0, 16) : '',
      arrivalAirport: travelCase.arrival_airport || '',
      departureAirport: travelCase.departure_airport || '',
      accommodationName: travelCase.accommodation_name || '',
      emergencyContactName: travelCase.emergency_contact_name || '',
      emergencyContactPhone: travelCase.emergency_contact_phone || '',
      notes: travelCase.notes || '',
    } : defaultTravelForm);
  }, [selectedRegistration?.id, travelMap]);

  const updateRegistrationStage = async (id: string, workflow_stage: TMOSWorkflowStage) => {
    const { error } = await supabase
      .from('event_registrations')
      .update({ workflow_stage, status: stageToLegacyStatus(workflow_stage) })
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, workflow_stage, status: stageToLegacyStatus(workflow_stage) } : r));
    toast({ title: 'Workflow updated', description: `Application moved to ${TMOS_STAGE_LABELS[workflow_stage]}.` });
  };

  const updateDocumentStatus = async (document: TMOSDelegateDocument, status: TMOSDocumentStatus) => {
    if (!document.id || !document.event_registration_id) return;
    const { error } = await supabase
      .from('tmos_delegate_documents')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', document.id);
    if (error) {
      toast({ title: 'Document update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setDocumentMap(prev => ({
      ...prev,
      [document.event_registration_id!]: (prev[document.event_registration_id!] || []).map(item =>
        item.id === document.id ? { ...item, status, reviewed_at: new Date().toISOString() } : item
      ),
    }));
    toast({ title: 'Document updated', description: `${document.label} marked as ${status.replace('_', ' ')}.` });
  };

  const openDocument = async (document: TMOSDelegateDocument) => {
    if (!document.file_url) {
      toast({ title: 'No file available', variant: 'destructive' });
      return;
    }
    if (document.file_url.startsWith('http')) {
      window.open(document.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    const { data, error } = await supabase.storage
      .from('tmos-documents')
      .createSignedUrl(document.file_url, 600);
    if (error || !data?.signedUrl) {
      toast({ title: 'Unable to open document', description: error?.message, variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const sendRegistrationUpdate = async (registration: EventRegistrationRow) => {
    setSendingUpdateId(registration.id);
    const { error } = await supabase.functions.invoke('send-registration-update', {
      body: {
        registrationId: registration.id,
        workflowStage: registration.workflow_stage,
      },
    });
    setSendingUpdateId(null);
    if (error) {
      toast({ title: 'Update email failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Update email sent', description: `${registration.full_name} has been notified.` });
    fetchRegistrations();
  };

  const handlePartnerSelect = (partnerId: string) => {
    if (partnerId === 'custom') {
      setMatchForm(defaultMatchForm);
      return;
    }
    const partner = partners.find(item => item.id === partnerId);
    setMatchForm(prev => ({
      ...prev,
      partnerId,
      partnerCompany: partner?.company_name || '',
      partnerContactName: partner?.contact_name || '',
      partnerEmail: partner?.email || '',
      partnerCountry: partner?.country || '',
      partnerSector: partner?.sector || '',
    }));
  };

  const createDelegateMatch = async () => {
    if (!selectedRegistration || !matchForm.partnerCompany.trim()) {
      toast({ title: 'Partner required', description: 'Add or select a partner company before creating the match.', variant: 'destructive' });
      return;
    }
    setCreatingMatch(true);
    const score = Math.max(0, Math.min(100, Number(matchForm.matchScore) || 50));
    const { data: match, error } = await supabase
      .from('tmos_delegate_matches')
      .insert({
        event_registration_id: selectedRegistration.id,
        event_id: selectedRegistration.event_id,
        partner_id: matchForm.partnerId === 'custom' ? null : matchForm.partnerId,
        partner_company: matchForm.partnerCompany.trim(),
        partner_contact_name: matchForm.partnerContactName.trim() || null,
        partner_email: matchForm.partnerEmail.trim() || null,
        partner_country: matchForm.partnerCountry.trim() || null,
        partner_sector: matchForm.partnerSector.trim() || null,
        match_score: score,
        match_rationale: matchForm.matchRationale.trim() || null,
        meeting_objective: matchForm.meetingObjective.trim() || null,
        scheduled_at: matchForm.scheduledAt ? new Date(matchForm.scheduledAt).toISOString() : null,
        location: matchForm.location.trim() || null,
        meeting_format: matchForm.meetingFormat,
        status: matchForm.scheduledAt ? 'confirmed' : 'proposed',
        notes: matchForm.notes.trim() || null,
      })
      .select()
      .single();

    if (error || !match) {
      setCreatingMatch(false);
      toast({ title: 'Match creation failed', description: error?.message, variant: 'destructive' });
      return;
    }

    if (matchForm.scheduledAt) {
      const start = new Date(matchForm.scheduledAt);
      const end = new Date(start.getTime() + 45 * 60 * 1000);
      const { error: itineraryError } = await supabase
        .from('tmos_itinerary_items')
        .insert({
          event_registration_id: selectedRegistration.id,
          event_id: selectedRegistration.event_id,
          match_id: match.id,
          title: `B2B Meeting: ${matchForm.partnerCompany.trim()}`,
          description: matchForm.meetingObjective.trim() || matchForm.matchRationale.trim() || null,
          item_type: 'meeting',
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          location: matchForm.location.trim() || null,
          visibility: 'delegate',
          status: 'confirmed',
        });
      if (itineraryError) {
        toast({ title: 'Match created', description: 'The itinerary item could not be created automatically.', variant: 'destructive' });
      }
    }

    setCreatingMatch(false);
    setMatchForm(defaultMatchForm);
    toast({ title: 'Match created', description: `${matchForm.partnerCompany.trim()} has been added to the delegate journey.` });
    fetchRegistrations();
  };

  const updateMatchStatus = async (match: TMOSDelegateMatch, status: TMOSDelegateMatch['status']) => {
    const { error } = await supabase
      .from('tmos_delegate_matches')
      .update({ status })
      .eq('id', match.id);
    if (error) {
      toast({ title: 'Match update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setMatchMap(prev => ({
      ...prev,
      [match.event_registration_id]: (prev[match.event_registration_id] || []).map(item =>
        item.id === match.id ? { ...item, status } : item
      ),
    }));
    toast({ title: 'Match updated', description: `${match.partner_company} marked as ${status}.` });
  };

  const saveTravelCase = async () => {
    if (!selectedRegistration) return;
    setSavingTravel(true);
    const payload = {
      event_registration_id: selectedRegistration.id,
      event_id: selectedRegistration.event_id,
      visa_status: travelForm.visaStatus,
      invitation_letter_status: travelForm.invitationLetterStatus,
      flight_status: travelForm.flightStatus,
      accommodation_status: travelForm.accommodationStatus,
      passport_valid_until: travelForm.passportValidUntil || null,
      visa_appointment_at: travelForm.visaAppointmentAt ? new Date(travelForm.visaAppointmentAt).toISOString() : null,
      arrival_at: travelForm.arrivalAt ? new Date(travelForm.arrivalAt).toISOString() : null,
      departure_at: travelForm.departureAt ? new Date(travelForm.departureAt).toISOString() : null,
      arrival_airport: travelForm.arrivalAirport.trim() || null,
      departure_airport: travelForm.departureAirport.trim() || null,
      accommodation_name: travelForm.accommodationName.trim() || null,
      emergency_contact_name: travelForm.emergencyContactName.trim() || null,
      emergency_contact_phone: travelForm.emergencyContactPhone.trim() || null,
      notes: travelForm.notes.trim() || null,
    };
    const { data, error } = await supabase
      .from('tmos_travel_cases')
      .upsert(payload, { onConflict: 'event_registration_id' })
      .select()
      .single();

    if (error || !data) {
      setSavingTravel(false);
      toast({ title: 'Travel update failed', description: error?.message, variant: 'destructive' });
      return;
    }

    const nextStage: TMOSWorkflowStage | null =
      travelForm.flightStatus === 'confirmed' && travelForm.accommodationStatus === 'confirmed'
        ? 'travel_confirmed'
        : travelForm.visaStatus !== 'not_started' || travelForm.invitationLetterStatus !== 'not_started'
          ? 'visa_support'
          : null;
    if (nextStage && selectedRegistration.workflow_stage !== nextStage) {
      await updateRegistrationStage(selectedRegistration.id, nextStage);
      setSelectedRegistration(prev => prev ? { ...prev, workflow_stage: nextStage, status: stageToLegacyStatus(nextStage) } : prev);
    }

    setTravelMap(prev => ({ ...prev, [selectedRegistration.id]: data as TMOSTravelCase }));
    setSavingTravel(false);
    toast({ title: 'Travel case saved', description: 'Visa and travel operations have been updated.' });
  };

  const exportRegistrationsCSV = () => {
    const rows = [
      ['Event', 'Name', 'Email', 'Phone', 'Company', 'Country', 'Stage', 'Score', 'Outcome', 'Date'],
      ...registrations.map(r => [
        r.event_title, r.full_name, r.email, r.phone || '', r.company || '',
        r.country || '', TMOS_STAGE_LABELS[r.workflow_stage as TMOSWorkflowStage] || r.workflow_stage,
        r.qualification_score ?? '', r.score_breakdown?.outcome || '', new Date(r.created_at).toLocaleString()
      ])
    ];
    const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `event_registrations_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter(r => {
    const q = regSearch.toLowerCase();
    return !q || r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
      || r.event_title?.toLowerCase().includes(q) || r.company?.toLowerCase().includes(q);
  });

  const regStats = {
    total: registrations.length,
    pending: registrations.filter(r => r.workflow_stage === 'new_registration' || r.workflow_stage === 'under_review').length,
    qualified: registrations.filter(r => r.workflow_stage === 'qualified' || r.workflow_stage === 'accepted').length,
    rejected: registrations.filter(r => r.workflow_stage === 'rejected').length,
    avgScore: registrations.length
      ? Math.round(registrations.reduce((sum, r) => sum + (r.qualification_score || 0), 0) / registrations.length)
      : 0,
  };


  const exportCSV = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const csv = 'Name,Email,Workflow Stage,Date\nJohn Doe,john@example.com,Accepted,2026-02-20\nJane Smith,jane@example.com,Under Review,2026-02-21\nAhmed Hassan,ahmed@example.com,New Registration,2026-02-22';
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
    visaSupport: mockDelegates.filter(d => d.visaSupport).length,
    activeCases: mockDelegates.filter(d => d.status !== 'cancelled').length,
  };

  const getDocumentSummary = (registrationId: string) => {
    const documents = documentMap[registrationId] || [];
    const requiredCodes = ['passport', 'company_profile'];
    const readyRequired = documents.filter(doc => requiredCodes.includes(doc.document_code) && ['submitted', 'approved'].includes(doc.status)).length;
    const submitted = documents.filter(doc => ['submitted', 'approved'].includes(doc.status)).length;
    return {
      submitted,
      total: documents.length || 4,
      requiredReady: readyRequired,
      requiredTotal: requiredCodes.length,
      complete: readyRequired === requiredCodes.length,
    };
  };

  const getLatestMessage = (registrationId: string) => {
    return (messageMap[registrationId] || [])[0];
  };

  const selectedDocuments = selectedRegistration ? documentMap[selectedRegistration.id] || [] : [];
  const selectedMessages = selectedRegistration ? messageMap[selectedRegistration.id] || [] : [];
  const selectedMatches = selectedRegistration ? matchMap[selectedRegistration.id] || [] : [];
  const selectedItinerary = selectedRegistration ? itineraryMap[selectedRegistration.id] || [] : [];
  const selectedTravelCase = selectedRegistration ? travelMap[selectedRegistration.id] : null;
  const selectedPayload = selectedRegistration?.application_payload || {};
  const selectedScoreBreakdown = selectedRegistration?.score_breakdown || {};

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

        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="delegates">Delegates</TabsTrigger>
            <TabsTrigger value="delegations">Delegations</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{regStats.total}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Review Queue</p><p className="text-2xl font-bold text-orange-600">{regStats.pending}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Qualified / Accepted</p><p className="text-2xl font-bold text-green-600">{regStats.qualified}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-2xl font-bold text-gold">{regStats.avgScore}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle>TMOS Registration Inbox</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search name, email, event..." className="pl-8 w-[260px]" value={regSearch} onChange={(e) => setRegSearch(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={regLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${regLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportRegistrationsCSV} disabled={!registrations.length}>
                      <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {regLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : filteredRegistrations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No event registrations yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Objective</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Comms</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map(r => {
                        const documentSummary = getDocumentSummary(r.id);
                        const latestMessage = getLatestMessage(r.id);
                        return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium max-w-[220px] truncate">{r.event_title}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{r.full_name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</p>
                              {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{r.company || '—'}<div className="text-xs text-muted-foreground">{r.country || ''}</div></TableCell>
                          <TableCell>
                            <Badge variant={r.workflow_stage === 'accepted' || r.workflow_stage === 'qualified' ? 'default' : r.workflow_stage === 'rejected' ? 'destructive' : 'secondary'}>
                              {TMOS_STAGE_LABELS[r.workflow_stage as TMOSWorkflowStage] || r.workflow_stage}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{r.qualification_score ?? '—'}</div>
                            {r.score_breakdown?.outcome && <div className="text-xs text-muted-foreground capitalize">{String(r.score_breakdown.outcome).replace('_', ' ')}</div>}
                          </TableCell>
                          <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                            <div className="line-clamp-2">{r.application_payload?.businessObjective || r.notes || '—'}</div>
                            {r.application_payload?.sector && <Badge variant="outline" className="mt-1 text-[10px]">{r.application_payload.sector}</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={documentSummary.complete ? 'default' : 'secondary'}>
                              {documentSummary.requiredReady}/{documentSummary.requiredTotal} required
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">{documentSummary.submitted}/{documentSummary.total} submitted</div>
                          </TableCell>
                          <TableCell>
                            {latestMessage ? (
                              <div>
                                <Badge variant={latestMessage.status === 'sent' ? 'default' : latestMessage.status === 'failed' ? 'destructive' : 'secondary'}>
                                  {latestMessage.status}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">{latestMessage.channel}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No log</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedRegistration(r)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select value={r.workflow_stage} onValueChange={(value) => updateRegistrationStage(r.id, value as TMOSWorkflowStage)}>
                                <SelectTrigger className="h-8 w-[170px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TMOS_ADMIN_STAGES.map(stage => (
                                    <SelectItem key={stage} value={stage}>{TMOS_STAGE_LABELS[stage]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Dialog open={Boolean(selectedRegistration)} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                {selectedRegistration && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{selectedRegistration.full_name}</DialogTitle>
                      <DialogDescription>
                        {selectedRegistration.company || 'No company provided'} - {selectedRegistration.event_title}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-4">
                        <div className="rounded-md border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold">Application Profile</h3>
                              <p className="text-xs text-muted-foreground">{selectedRegistration.email}</p>
                              {selectedRegistration.phone && <p className="text-xs text-muted-foreground">{selectedRegistration.phone}</p>}
                            </div>
                            <Badge variant={selectedRegistration.workflow_stage === 'accepted' || selectedRegistration.workflow_stage === 'qualified' ? 'default' : selectedRegistration.workflow_stage === 'rejected' ? 'destructive' : 'secondary'}>
                              {TMOS_STAGE_LABELS[selectedRegistration.workflow_stage as TMOSWorkflowStage] || selectedRegistration.workflow_stage}
                            </Badge>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Sector</p>
                              <p className="text-sm font-medium">{selectedPayload.sector || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Product / Service</p>
                              <p className="text-sm font-medium">{selectedPayload.productService || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Employees</p>
                              <p className="text-sm font-medium">{selectedPayload.employeeCount || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Annual Turnover</p>
                              <p className="text-sm font-medium">{selectedPayload.annualTurnover || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Export Readiness</p>
                              <p className="text-sm font-medium">{selectedPayload.exportExperience || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Target Countries</p>
                              <p className="text-sm font-medium">{selectedPayload.targetCountries || '-'}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Mission Objective</p>
                              <p className="text-sm">{selectedPayload.businessObjective || selectedRegistration.notes || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Looking For</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(selectedPayload.lookingFor || []).length ? selectedPayload.lookingFor.map((item: string) => (
                                  <Badge key={item} variant="outline">{item}</Badge>
                                )) : <span className="text-sm">-</span>}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Certifications</p>
                              <p className="text-sm">{selectedPayload.certifications || '-'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold">Documents</h3>
                            <Badge variant={getDocumentSummary(selectedRegistration.id).complete ? 'default' : 'secondary'}>
                              {getDocumentSummary(selectedRegistration.id).requiredReady}/{getDocumentSummary(selectedRegistration.id).requiredTotal} required ready
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-2">
                            {selectedDocuments.length ? selectedDocuments.map(document => (
                              <div key={document.document_code} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {document.label}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">{document.file_name || 'No file uploaded'}</p>
                                  {document.review_notes && <p className="text-xs text-muted-foreground">{document.review_notes}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={document.status === 'approved' ? 'default' : document.status === 'rejected' ? 'destructive' : 'secondary'}>
                                    {document.status.replace('_', ' ')}
                                  </Badge>
                                  {document.file_url && (
                                    <Button size="sm" variant="outline" onClick={() => openDocument(document)}>
                                      <ExternalLink className="h-4 w-4 mr-1" /> Open
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => updateDocumentStatus(document, 'approved')} disabled={document.status === 'approved'}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => updateDocumentStatus(document, 'rejected')} disabled={document.status === 'rejected'}>
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-muted-foreground">No document records yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <Handshake className="h-4 w-4 text-muted-foreground" />
                              Business Matching
                            </h3>
                            <Badge variant="outline">{selectedMatches.length} matches</Badge>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Partner</Label>
                              <Select value={matchForm.partnerId} onValueChange={handlePartnerSelect}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select partner" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="custom">Custom partner</SelectItem>
                                  {partners.filter(partner => partner.event_id === selectedRegistration.event_id).map(partner => (
                                    <SelectItem key={partner.id} value={partner.id}>{partner.company_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Partner Company *</Label>
                              <Input value={matchForm.partnerCompany} onChange={(e) => setMatchForm(prev => ({ ...prev, partnerCompany: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Contact Name</Label>
                              <Input value={matchForm.partnerContactName} onChange={(e) => setMatchForm(prev => ({ ...prev, partnerContactName: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Contact Email</Label>
                              <Input type="email" value={matchForm.partnerEmail} onChange={(e) => setMatchForm(prev => ({ ...prev, partnerEmail: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Country</Label>
                              <Input value={matchForm.partnerCountry} onChange={(e) => setMatchForm(prev => ({ ...prev, partnerCountry: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Sector</Label>
                              <Input value={matchForm.partnerSector} onChange={(e) => setMatchForm(prev => ({ ...prev, partnerSector: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Match Score</Label>
                              <Input type="number" min="0" max="100" value={matchForm.matchScore} onChange={(e) => setMatchForm(prev => ({ ...prev, matchScore: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Meeting Format</Label>
                              <Select value={matchForm.meetingFormat} onValueChange={(value) => setMatchForm(prev => ({ ...prev, meetingFormat: value as MatchForm['meetingFormat'] }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_person">In person</SelectItem>
                                  <SelectItem value="virtual">Virtual</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Schedule</Label>
                              <Input type="datetime-local" value={matchForm.scheduledAt} onChange={(e) => setMatchForm(prev => ({ ...prev, scheduledAt: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Location</Label>
                              <Input value={matchForm.location} onChange={(e) => setMatchForm(prev => ({ ...prev, location: e.target.value }))} />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-xs">Meeting Objective</Label>
                              <Input value={matchForm.meetingObjective} onChange={(e) => setMatchForm(prev => ({ ...prev, meetingObjective: e.target.value }))} placeholder="e.g. distributor discussion, technology transfer, buyer introduction" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-xs">Match Rationale</Label>
                              <Textarea rows={2} value={matchForm.matchRationale} onChange={(e) => setMatchForm(prev => ({ ...prev, matchRationale: e.target.value }))} />
                            </div>
                          </div>
                          <Button className="mt-3" onClick={createDelegateMatch} disabled={creatingMatch}>
                            {creatingMatch ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarPlus className="h-4 w-4 mr-2" />}
                            Add Match
                          </Button>
                          <div className="mt-4 space-y-2">
                            {selectedMatches.length ? selectedMatches.map(match => (
                              <div key={match.id} className="rounded-md border p-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{match.partner_company}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {[match.partner_sector, match.partner_country].filter(Boolean).join(' - ') || 'No sector or country set'}
                                    </p>
                                    {match.meeting_objective && <p className="mt-1 text-xs">{match.meeting_objective}</p>}
                                    {match.scheduled_at && (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {new Date(match.scheduled_at).toLocaleString()} {match.location ? `at ${match.location}` : ''}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{match.match_score}%</Badge>
                                    <Select value={match.status} onValueChange={(value) => updateMatchStatus(match, value as TMOSDelegateMatch['status'])}>
                                      <SelectTrigger className="h-8 w-[130px] text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="proposed">Proposed</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="declined">Declined</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-muted-foreground">No matches scheduled yet.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-md border p-4">
                          <h3 className="text-sm font-semibold">Qualification</h3>
                          <div className="mt-3">
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-muted-foreground">Score</span>
                              <span className="text-2xl font-bold text-gold">{selectedRegistration.qualification_score ?? 0}</span>
                            </div>
                            <Progress value={selectedRegistration.qualification_score || 0} className="mt-2 h-2" />
                          </div>
                          <div className="mt-4 space-y-2 text-sm">
                            {[
                              ['Export readiness', selectedScoreBreakdown.exportReadiness],
                              ['Company capacity', selectedScoreBreakdown.companyCapacity],
                              ['Financial capacity', selectedScoreBreakdown.financialCapacity],
                              ['Intent clarity', selectedScoreBreakdown.intentClarity],
                              ['Product quality', selectedScoreBreakdown.productQuality],
                            ].map(([label, value]) => (
                              <div key={label} className="flex justify-between gap-3">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value ?? '-'}</span>
                              </div>
                            ))}
                            <div className="flex justify-between gap-3 pt-2">
                              <span className="text-muted-foreground">Outcome</span>
                              <Badge variant="outline">{String(selectedScoreBreakdown.outcome || 'needs_review').replace('_', ' ')}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <Label className="text-sm font-semibold">Workflow Stage</Label>
                          <Select
                            value={selectedRegistration.workflow_stage}
                            onValueChange={(value) => {
                              updateRegistrationStage(selectedRegistration.id, value as TMOSWorkflowStage);
                              setSelectedRegistration(prev => prev ? { ...prev, workflow_stage: value as TMOSWorkflowStage, status: stageToLegacyStatus(value as TMOSWorkflowStage) } : prev);
                            }}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TMOS_ADMIN_STAGES.map(stage => (
                                <SelectItem key={stage} value={stage}>{TMOS_STAGE_LABELS[stage]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            className="mt-3 w-full"
                            variant="outline"
                            onClick={() => sendRegistrationUpdate(selectedRegistration)}
                            disabled={sendingUpdateId === selectedRegistration.id}
                          >
                            {sendingUpdateId === selectedRegistration.id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                            ) : (
                              <><Send className="h-4 w-4 mr-2" /> Send Status Email</>
                            )}
                          </Button>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold">Visa & Travel</h3>
                            <Badge variant={selectedTravelCase ? 'default' : 'secondary'}>
                              {selectedTravelCase ? 'Open case' : 'No case'}
                            </Badge>
                          </div>
                          <div className="mt-3 grid gap-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Visa Status</Label>
                                <Select value={travelForm.visaStatus} onValueChange={(value) => setTravelForm(prev => ({ ...prev, visaStatus: value as TMOSVisaStatus }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not started</SelectItem>
                                    <SelectItem value="invitation_requested">Invitation requested</SelectItem>
                                    <SelectItem value="appointment_booked">Appointment booked</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="not_required">Not required</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Invitation Letter</Label>
                                <Select value={travelForm.invitationLetterStatus} onValueChange={(value) => setTravelForm(prev => ({ ...prev, invitationLetterStatus: value as TMOSInvitationLetterStatus }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not started</SelectItem>
                                    <SelectItem value="drafting">Drafting</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Flight Status</Label>
                                <Select value={travelForm.flightStatus} onValueChange={(value) => setTravelForm(prev => ({ ...prev, flightStatus: value as TMOSTravelTaskStatus }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not started</SelectItem>
                                    <SelectItem value="requested">Requested</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="changed">Changed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Accommodation</Label>
                                <Select value={travelForm.accommodationStatus} onValueChange={(value) => setTravelForm(prev => ({ ...prev, accommodationStatus: value as TMOSAccommodationStatus }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_started">Not started</SelectItem>
                                    <SelectItem value="requested">Requested</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="changed">Changed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Passport Valid Until</Label>
                                <Input type="date" value={travelForm.passportValidUntil} onChange={(e) => setTravelForm(prev => ({ ...prev, passportValidUntil: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Visa Appointment</Label>
                                <Input type="datetime-local" value={travelForm.visaAppointmentAt} onChange={(e) => setTravelForm(prev => ({ ...prev, visaAppointmentAt: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Arrival</Label>
                                <Input type="datetime-local" value={travelForm.arrivalAt} onChange={(e) => setTravelForm(prev => ({ ...prev, arrivalAt: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Departure</Label>
                                <Input type="datetime-local" value={travelForm.departureAt} onChange={(e) => setTravelForm(prev => ({ ...prev, departureAt: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Arrival Airport</Label>
                                <Input value={travelForm.arrivalAirport} onChange={(e) => setTravelForm(prev => ({ ...prev, arrivalAirport: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Departure Airport</Label>
                                <Input value={travelForm.departureAirport} onChange={(e) => setTravelForm(prev => ({ ...prev, departureAirport: e.target.value }))} />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Accommodation Name</Label>
                                <Input value={travelForm.accommodationName} onChange={(e) => setTravelForm(prev => ({ ...prev, accommodationName: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Emergency Contact</Label>
                                <Input value={travelForm.emergencyContactName} onChange={(e) => setTravelForm(prev => ({ ...prev, emergencyContactName: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Emergency Phone</Label>
                                <Input value={travelForm.emergencyContactPhone} onChange={(e) => setTravelForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Operations Notes</Label>
                                <Textarea rows={2} value={travelForm.notes} onChange={(e) => setTravelForm(prev => ({ ...prev, notes: e.target.value }))} />
                              </div>
                            </div>
                            <Button variant="outline" onClick={saveTravelCase} disabled={savingTravel}>
                              {savingTravel ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              Save Travel Case
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Itinerary
                          </h3>
                          <div className="mt-3 space-y-3">
                            {selectedItinerary.length ? selectedItinerary.map(item => (
                              <div key={item.id} className="rounded-md border p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(item.start_at).toLocaleString()}</p>
                                    {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
                                  </div>
                                  <Badge variant={item.status === 'confirmed' || item.status === 'scheduled' ? 'default' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </div>
                                {item.description && <p className="mt-2 text-xs">{item.description}</p>}
                              </div>
                            )) : (
                              <p className="text-sm text-muted-foreground">No itinerary items yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <h3 className="text-sm font-semibold">Communication Log</h3>
                          <div className="mt-3 space-y-3">
                            {selectedMessages.length ? selectedMessages.map((message, index) => (
                              <div key={`${message.recipient}-${message.sent_at || index}`} className="rounded-md border p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium">{message.subject || message.channel}</p>
                                  <Badge variant={message.status === 'sent' ? 'default' : message.status === 'failed' ? 'destructive' : 'secondary'}>
                                    {message.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{message.recipient}</p>
                                {message.sent_at && <p className="text-xs text-muted-foreground">{new Date(message.sent_at).toLocaleString()}</p>}
                                {message.error_message && <p className="mt-1 text-xs text-destructive">{message.error_message}</p>}
                              </div>
                            )) : (
                              <p className="text-sm text-muted-foreground">No communication log yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>



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
                      <TableHead>Capacity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map(event => {
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{event.type.replace('-', ' ')}</Badge></TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>{event.registrations}/{event.capacity}</TableCell>
                          <TableCell>{Math.round((event.registrations / event.capacity) * 100)}% filled</TableCell>
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
                      <p className="text-xs text-muted-foreground">Visa Support</p>
                      <p className="text-xl font-bold">{eventStats.visaSupport}</p>
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
                      <p className="text-xs text-muted-foreground">Active Cases</p>
                      <p className="text-xl font-bold">{eventStats.activeCases}</p>
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
                      <TableHead>Journey Track</TableHead>
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
                          <Badge variant={delegate.journeyTrack.includes('Executive') ? 'default' : 'secondary'}>
                            {delegate.journeyTrack}
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
