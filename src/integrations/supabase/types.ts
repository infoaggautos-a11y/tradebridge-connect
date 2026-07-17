export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_registrations: {
        Row: {
          account_created: boolean | null
          additional_notes: string | null
          address: string | null
          annual_revenue: string | null
          city: string | null
          company_name: string
          company_size: string | null
          contact_person: string
          country: string
          created_at: string | null
          email: string
          export_markets: string | null
          id: string
          import_interests: string | null
          phone: string | null
          products_services: string | null
          registration_number: string | null
          sector: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          account_created?: boolean | null
          additional_notes?: string | null
          address?: string | null
          annual_revenue?: string | null
          city?: string | null
          company_name: string
          company_size?: string | null
          contact_person: string
          country?: string
          created_at?: string | null
          email: string
          export_markets?: string | null
          id?: string
          import_interests?: string | null
          phone?: string | null
          products_services?: string | null
          registration_number?: string | null
          sector?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          account_created?: boolean | null
          additional_notes?: string | null
          address?: string | null
          annual_revenue?: string | null
          city?: string | null
          company_name?: string
          company_size?: string | null
          contact_person?: string
          country?: string
          created_at?: string | null
          email?: string
          export_markets?: string | null
          id?: string
          import_interests?: string | null
          phone?: string | null
          products_services?: string | null
          registration_number?: string | null
          sector?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      escrow_deals: {
        Row: {
          amount: number
          buyer_id: string
          commission_amount: number | null
          commission_rate: number
          created_at: string | null
          currency: string | null
          deal_room_id: string
          disputed_at: string | null
          funded_at: string | null
          id: string
          net_seller_amount: number | null
          released_at: string | null
          seller_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          commission_amount?: number | null
          commission_rate: number
          created_at?: string | null
          currency?: string | null
          deal_room_id: string
          disputed_at?: string | null
          funded_at?: string | null
          id?: string
          net_seller_amount?: number | null
          released_at?: string | null
          seller_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission_amount?: number | null
          commission_rate?: number
          created_at?: string | null
          currency?: string | null
          deal_room_id?: string
          disputed_at?: string | null
          funded_at?: string | null
          id?: string
          net_seller_amount?: number | null
          released_at?: string | null
          seller_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          accepted_at: string | null
          application_payload: Json
          company: string | null
          country: string | null
          created_at: string
          email: string
          event_id: string
          event_title: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          qualification_score: number | null
          rejected_at: string | null
          relationship_manager_id: string | null
          reviewed_at: string | null
          score_breakdown: Json
          status: string
          submitted_at: string
          ticket_tier: string | null
          updated_at: string
          user_id: string | null
          workflow_stage: string
        }
        Insert: {
          accepted_at?: string | null
          application_payload?: Json
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          event_id: string
          event_title: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          qualification_score?: number | null
          rejected_at?: string | null
          relationship_manager_id?: string | null
          reviewed_at?: string | null
          score_breakdown?: Json
          status?: string
          submitted_at?: string
          ticket_tier?: string | null
          updated_at?: string
          user_id?: string | null
          workflow_stage?: string
        }
        Update: {
          accepted_at?: string | null
          application_payload?: Json
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          event_id?: string
          event_title?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          qualification_score?: number | null
          rejected_at?: string | null
          relationship_manager_id?: string | null
          reviewed_at?: string | null
          score_breakdown?: Json
          status?: string
          submitted_at?: string
          ticket_tier?: string | null
          updated_at?: string
          user_id?: string | null
          workflow_stage?: string
        }
        Relationships: []
      }
      tmos_stage_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_id: string
          event_registration_id: string
          from_stage: string | null
          id: string
          reason: string | null
          to_stage: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_id: string
          event_registration_id: string
          from_stage?: string | null
          id?: string
          reason?: string | null
          to_stage: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_id?: string
          event_registration_id?: string
          from_stage?: string | null
          id?: string
          reason?: string | null
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmos_stage_events_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_document_requirements: {
        Row: {
          applies_to_stages: string[]
          code: string
          created_at: string
          description: string | null
          event_id: string
          id: string
          label: string
          required: boolean
          updated_at: string
        }
        Insert: {
          applies_to_stages?: string[]
          code: string
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          label: string
          required?: boolean
          updated_at?: string
        }
        Update: {
          applies_to_stages?: string[]
          code?: string
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          label?: string
          required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tmos_delegate_documents: {
        Row: {
          created_at: string
          document_code: string
          event_id: string
          event_registration_id: string
          file_name: string | null
          file_url: string | null
          id: string
          label: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string
          document_code: string
          event_id: string
          event_registration_id: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          label: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string
          document_code?: string
          event_id?: string
          event_registration_id?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          label?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmos_delegate_documents_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_business_partners: {
        Row: {
          company_name: string
          contact_name: string | null
          country: string | null
          created_at: string
          email: string | null
          event_id: string
          id: string
          phone: string | null
          profile: Json
          sector: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          phone?: string | null
          profile?: Json
          sector?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          phone?: string | null
          profile?: Json
          sector?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tmos_delegate_matches: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string
          event_registration_id: string
          id: string
          location: string | null
          match_rationale: string | null
          match_score: number
          meeting_format: string
          meeting_objective: string | null
          notes: string | null
          partner_company: string
          partner_contact_name: string | null
          partner_country: string | null
          partner_email: string | null
          partner_id: string | null
          partner_sector: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id: string
          event_registration_id: string
          id?: string
          location?: string | null
          match_rationale?: string | null
          match_score?: number
          meeting_format?: string
          meeting_objective?: string | null
          notes?: string | null
          partner_company: string
          partner_contact_name?: string | null
          partner_country?: string | null
          partner_email?: string | null
          partner_id?: string | null
          partner_sector?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string
          event_registration_id?: string
          id?: string
          location?: string | null
          match_rationale?: string | null
          match_score?: number
          meeting_format?: string
          meeting_objective?: string | null
          notes?: string | null
          partner_company?: string
          partner_contact_name?: string | null
          partner_country?: string | null
          partner_email?: string | null
          partner_id?: string | null
          partner_sector?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmos_delegate_matches_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmos_delegate_matches_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "tmos_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_itinerary_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string | null
          event_id: string
          event_registration_id: string
          id: string
          item_type: string
          location: string | null
          match_id: string | null
          start_at: string
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          event_id: string
          event_registration_id: string
          id?: string
          item_type?: string
          location?: string | null
          match_id?: string | null
          start_at: string
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          event_id?: string
          event_registration_id?: string
          id?: string
          item_type?: string
          location?: string | null
          match_id?: string | null
          start_at?: string
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmos_itinerary_items_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmos_itinerary_items_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tmos_delegate_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_message_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          event_id: string
          event_registration_id: string | null
          id: string
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          template_key: string | null
          workflow_stage: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          event_id: string
          event_registration_id?: string | null
          id?: string
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          workflow_stage?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_registration_id?: string | null
          id?: string
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmos_message_logs_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      match_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          match_score: number
          matched_business_id: string | null
          matched_business_name: string
          requester_business_name: string
          requester_email: string
          requester_id: string
          sectors: string[] | null
          status: string
          target_countries: string[] | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_score?: number
          matched_business_id?: string | null
          matched_business_name: string
          requester_business_name: string
          requester_email: string
          requester_id: string
          sectors?: string[] | null
          status?: string
          target_countries?: string[] | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_score?: number
          matched_business_id?: string | null
          matched_business_name?: string
          requester_business_name?: string
          requester_email?: string
          requester_id?: string
          sectors?: string[] | null
          status?: string
          target_countries?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          paystack_ref: string | null
          provider: string
          reference: string
          status: string | null
          stripe_payment_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          paystack_ref?: string | null
          provider: string
          reference: string
          status?: string | null
          stripe_payment_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          paystack_ref?: string | null
          provider?: string
          reference?: string
          status?: string | null
          stripe_payment_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          provider: string | null
          provider_ref: string | null
          reference: string
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          provider?: string | null
          provider_ref?: string | null
          reference: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          provider?: string | null
          provider_ref?: string | null
          reference?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_revenue: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          reference: string | null
          source: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          reference?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          reference?: string | null
          source?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          kyc_status: string | null
          membership_tier: string | null
          name: string | null
          paystack_customer_id: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          kyc_status?: string | null
          membership_tier?: string | null
          name?: string | null
          paystack_customer_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          kyc_status?: string | null
          membership_tier?: string | null
          name?: string | null
          paystack_customer_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paystack_sub_code: string | null
          plan_id: string
          plan_name: string
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_sub_code?: string | null
          plan_id: string
          plan_name: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_sub_code?: string | null
          plan_id?: string
          plan_name?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_delegate_documents: {
        Row: {
          created_at: string
          document_code: string
          event_id: string
          event_registration_id: string
          file_name: string | null
          file_url: string | null
          id: string
          label: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string
          document_code: string
          event_id: string
          event_registration_id: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          label: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string
          document_code?: string
          event_id?: string
          event_registration_id?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          label?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmos_delegate_documents_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_document_requirements: {
        Row: {
          applies_to_stages: string[]
          code: string
          created_at: string
          description: string | null
          event_id: string
          id: string
          label: string
          required: boolean
          updated_at: string
        }
        Insert: {
          applies_to_stages?: string[]
          code: string
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          label: string
          required?: boolean
          updated_at?: string
        }
        Update: {
          applies_to_stages?: string[]
          code?: string
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          label?: string
          required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tmos_message_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          event_id: string
          event_registration_id: string | null
          id: string
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          template_key: string | null
          workflow_stage: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          event_id: string
          event_registration_id?: string | null
          id?: string
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          workflow_stage?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_registration_id?: string | null
          id?: string
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmos_message_logs_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tmos_stage_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_id: string
          event_registration_id: string
          from_stage: string | null
          id: string
          reason: string | null
          to_stage: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_id: string
          event_registration_id: string
          from_stage?: string | null
          id?: string
          reason?: string | null
          to_stage: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_id?: string
          event_registration_id?: string
          from_stage?: string | null
          id?: string
          reason?: string | null
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmos_stage_events_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_reference: string | null
          reference: string | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_reference?: string | null
          reference?: string | null
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_reference?: string | null
          reference?: string | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference: string | null
          status: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          pending_balance: number | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pending_balance?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_balance?: number | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pending_balance?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "office"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "office"],
    },
  },
} as const
