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
      active_signals: {
        Row: {
          accuracy: number | null
          activity: Database["public"]["Enums"]["activity_type"]
          event_id: string | null
          expires_at: string
          id: string
          latitude: number
          location_description: string | null
          longitude: number
          signal_type: Database["public"]["Enums"]["signal_type"]
          started_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          activity: Database["public"]["Enums"]["activity_type"]
          event_id?: string | null
          expires_at?: string
          id?: string
          latitude: number
          location_description?: string | null
          longitude: number
          signal_type?: Database["public"]["Enums"]["signal_type"]
          started_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          activity?: Database["public"]["Enums"]["activity_type"]
          event_id?: string | null
          expires_at?: string
          id?: string
          latitude?: number
          location_description?: string | null
          longitude?: number
          signal_type?: Database["public"]["Enums"]["signal_type"]
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_signals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alert_preferences: {
        Row: {
          alert_error_spike: boolean
          alert_high_reports: boolean
          alert_new_user: boolean
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_error_spike?: boolean
          alert_high_reports?: boolean
          alert_new_user?: boolean
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_error_spike?: boolean
          alert_high_reports?: boolean
          alert_new_user?: boolean
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      alert_logs: {
        Row: {
          alert_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string
          subject: string
        }
        Insert: {
          alert_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string
          subject: string
        }
        Update: {
          alert_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string
          subject?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_feedback: {
        Row: {
          created_at: string
          id: string
          message: string | null
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          event_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          event_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          event_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_active: boolean
          latitude: number
          location_name: string
          longitude: number
          max_participants: number | null
          name: string
          organizer_id: string
          qr_code_secret: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          latitude: number
          location_name: string
          longitude: number
          max_participants?: number | null
          name: string
          organizer_id: string
          qr_code_secret?: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          location_name?: string
          longitude?: number
          max_participants?: number | null
          name?: string
          organizer_id?: string
          qr_code_secret?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          activity: Database["public"]["Enums"]["activity_type"]
          created_at: string
          feedback: string | null
          icebreaker: string | null
          id: string
          latitude: number | null
          longitude: number | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          activity: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          feedback?: string | null
          icebreaker?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          target_user_id: string
          user_id: string
        }
        Update: {
          activity?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          feedback?: string | null
          icebreaker?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          interaction_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          interaction_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          interaction_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_session_usage: {
        Row: {
          created_at: string
          id: string
          month_year: string
          sessions_created: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          sessions_created?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          sessions_created?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_session_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          favorite_activities: string[] | null
          first_name: string
          id: string
          is_premium: boolean
          university: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          favorite_activities?: string[] | null
          first_name: string
          id: string
          is_premium?: boolean
          university?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          favorite_activities?: string[] | null
          first_name?: string
          id?: string
          is_premium?: boolean
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_sessions: {
        Row: {
          activity: Database["public"]["Enums"]["activity_type"]
          city: string
          created_at: string
          creator_id: string
          duration_minutes: number
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          max_participants: number
          note: string | null
          scheduled_date: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          activity: Database["public"]["Enums"]["activity_type"]
          city: string
          created_at?: string
          creator_id: string
          duration_minutes: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number
          note?: string | null
          scheduled_date: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity?: Database["public"]["Enums"]["activity_type"]
          city?: string
          created_at?: string
          creator_id?: string
          duration_minutes?: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number
          note?: string | null
          scheduled_date?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_sessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_feedback: {
        Row: {
          comment: string | null
          created_at: string
          from_user_id: string
          id: string
          pleasant: boolean
          punctual: boolean
          session_id: string
          to_user_id: string
          would_recommend: boolean
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          pleasant?: boolean
          punctual?: boolean
          session_id: string
          to_user_id: string
          would_recommend?: boolean
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          pleasant?: boolean
          punctual?: boolean
          session_id?: string
          to_user_id?: string
          would_recommend?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          checked_out: boolean
          checked_out_at: string | null
          id: string
          joined_at: string
          reminder_15m_sent: boolean
          reminder_1h_sent: boolean
          session_id: string
          user_id: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_out?: boolean
          checked_out_at?: string | null
          id?: string
          joined_at?: string
          reminder_15m_sent?: boolean
          reminder_1h_sent?: boolean
          session_id: string
          user_id: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_out?: boolean
          checked_out_at?: string | null
          id?: string
          joined_at?: string
          reminder_15m_sent?: boolean
          reminder_1h_sent?: boolean
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      user_reliability: {
        Row: {
          created_at: string
          id: string
          late_cancellations: number
          no_shows: number
          positive_feedback_count: number
          reliability_score: number
          sessions_completed: number
          sessions_created: number
          sessions_joined: number
          total_feedback_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          late_cancellations?: number
          no_shows?: number
          positive_feedback_count?: number
          reliability_score?: number
          sessions_completed?: number
          sessions_created?: number
          sessions_joined?: number
          total_feedback_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          late_cancellations?: number
          no_shows?: number
          positive_feedback_count?: number
          reliability_score?: number
          sessions_completed?: number
          sessions_created?: number
          sessions_joined?: number
          total_feedback_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reliability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          ghost_mode: boolean
          id: string
          proximity_vibration: boolean
          push_notifications: boolean
          sound_notifications: boolean
          updated_at: string
          user_id: string
          visibility_distance: number
        }
        Insert: {
          created_at?: string
          ghost_mode?: boolean
          id?: string
          proximity_vibration?: boolean
          push_notifications?: boolean
          sound_notifications?: boolean
          updated_at?: string
          user_id: string
          visibility_distance?: number
        }
        Update: {
          created_at?: string
          ghost_mode?: boolean
          id?: string
          proximity_vibration?: boolean
          push_notifications?: boolean
          sound_notifications?: boolean
          updated_at?: string
          user_id?: string
          visibility_distance?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          hours_active: number
          id: string
          interactions: number
          rating: number
          total_ratings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours_active?: number
          id?: string
          interactions?: number
          rating?: number
          total_ratings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hours_active?: number
          id?: string
          interactions?: number
          rating?: number
          total_ratings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_badges: {
        Row: {
          badge_type: string
          id: string
          metadata: Json | null
          user_id: string
          verified_at: string
        }
        Insert: {
          badge_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          verified_at?: string
        }
        Update: {
          badge_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_hours_active: {
        Args: { p_hours: number; p_user_id: string }
        Returns: undefined
      }
      can_create_session: { Args: { p_user_id: string }; Returns: boolean }
      check_report_rate_limit: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_signals: { Args: never; Returns: undefined }
      cleanup_old_interaction_locations: { Args: never; Returns: undefined }
      fuzz_coordinates: { Args: { lat: number; lon: number }; Returns: Json }
      get_available_sessions: {
        Args: {
          p_activity?: Database["public"]["Enums"]["activity_type"]
          p_city: string
          p_date?: string
          p_duration?: number
        }
        Returns: {
          activity: Database["public"]["Enums"]["activity_type"]
          city: string
          created_at: string
          creator_avatar: string
          creator_id: string
          creator_name: string
          creator_reliability: number
          current_participants: number
          duration_minutes: number
          id: string
          location_name: string
          max_participants: number
          note: string
          scheduled_date: string
          start_time: string
        }[]
      }
      get_current_month_usage: {
        Args: { p_user_id: string }
        Returns: {
          can_create: boolean
          is_premium: boolean
          sessions_created: number
          sessions_limit: number
        }[]
      }
      get_daily_active_users: {
        Args: { days_back?: number }
        Returns: {
          active_users: number
          date: string
        }[]
      }
      get_event_for_user: {
        Args: { p_event_id: string }
        Returns: {
          created_at: string
          description: string
          ends_at: string
          id: string
          is_active: boolean
          latitude: number
          location_name: string
          longitude: number
          max_participants: number
          name: string
          organizer_id: string
          qr_code_secret: string
          starts_at: string
        }[]
      }
      get_events_public: {
        Args: never
        Returns: {
          created_at: string
          description: string
          ends_at: string
          id: string
          is_active: boolean
          latitude: number
          location_name: string
          longitude: number
          max_participants: number
          name: string
          organizer_id: string
          starts_at: string
        }[]
      }
      get_interaction_profile: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          first_name: string
          id: string
          university: string
        }[]
      }
      get_nearby_signals: {
        Args: {
          max_distance_meters?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          activity: Database["public"]["Enums"]["activity_type"]
          avatar_url: string
          first_name: string
          id: string
          latitude: number
          longitude: number
          rating: number
          signal_type: Database["public"]["Enums"]["signal_type"]
          started_at: string
          user_id: string
        }[]
      }
      get_own_admin_email: { Args: never; Returns: string }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          first_name: string
          id: string
          university: string
        }[]
      }
      get_public_profile_secure: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          id: string
          university: string
        }[]
      }
      get_public_profiles: {
        Args: { profile_ids: string[] }
        Returns: {
          avatar_url: string
          created_at: string
          first_name: string
          id: string
          university: string
        }[]
      }
      get_safe_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          first_name: string
          id: string
          university: string
        }[]
      }
      get_sessions_needing_reminders: {
        Args: never
        Returns: {
          activity: Database["public"]["Enums"]["activity_type"]
          city: string
          creator_name: string
          location_name: string
          participant_id: string
          reminder_type: string
          session_date: string
          session_id: string
          start_time: string
          user_id: string
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_interactions: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      join_session: { Args: { p_session_id: string }; Returns: boolean }
      leave_session: { Args: { p_session_id: string }; Returns: boolean }
      submit_rating: {
        Args: { p_rating: number; p_target_user_id: string }
        Returns: undefined
      }
      update_reliability_from_feedback: {
        Args: { p_positive: boolean; p_user_id: string }
        Returns: undefined
      }
      update_user_stats_safe: {
        Args: {
          p_hours_active?: number
          p_interactions?: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_type:
        | "studying"
        | "eating"
        | "working"
        | "talking"
        | "sport"
        | "other"
      signal_type: "green" | "yellow" | "red"
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
      activity_type: [
        "studying",
        "eating",
        "working",
        "talking",
        "sport",
        "other",
      ],
      signal_type: ["green", "yellow", "red"],
    },
  },
} as const
