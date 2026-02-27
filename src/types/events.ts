export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type DelegateStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled';

export interface EventSpeaker {
  id: string;
  name: string;
  role: string;
  company: string;
  bio?: string;
  photoUrl?: string;
}

export interface EventAgendaItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  location?: string;
  type: 'keynote' | 'session' | 'break' | 'networking' | 'workshop';
}

export interface EventTicketTier {
  id: string;
  tier: string;
  price: number;
  currency: 'USD' | 'EUR' | 'NGN';
  label: string;
  perks: string[];
  quantity: number;
  sold: number;
}

export interface EventDelegate {
  id: string;
  businessId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  ticketTier: string;
  status: DelegateStatus;
  registrationDate: string;
  dietaryRequirements?: string;
  visaSupport?: boolean;
  attended?: boolean;
}

export interface Delegation {
  id: string;
  eventId: string;
  name: string;
  leader: string;
  country: string;
  members: DelegationMember[];
  status: 'planning' | 'confirmed' | 'in_transit' | 'completed';
  arrivalDate?: string;
  departureDate?: string;
  accommodation?: string;
  notes?: string;
}

export interface DelegationMember {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  passportNumber?: string;
  dietaryRequirements?: string;
}

export interface EventSponsorship {
  id: string;
  sponsorName: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  amount: number;
  currency: string;
  benefits: string[];
  logo?: string;
}
