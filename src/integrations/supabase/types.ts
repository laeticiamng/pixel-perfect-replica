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
            foreignKeyName: "active_signals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
            foreignKeyName: "interactions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "verification_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      events_public: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string | null
          is_active: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          max_participants: number | null
          name: string | null
          organizer_id: string | null
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          name?: string | null
          organizer_id?: string | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          name?: string | null
          organizer_id?: string | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          university: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          university?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          university?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_hours_active: {
        Args: { p_hours: number; p_user_id: string }
        Returns: undefined
      }
      check_report_rate_limit: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_signals: { Args: never; Returns: undefined }
      cleanup_old_interaction_locations: { Args: never; Returns: undefined }
      fuzz_coordinates: { Args: { lat: number; lon: number }; Returns: Json }
      get_daily_active_users: {
        Args: { days_back?: number }
        Returns: {
          active_users: number
          date: string
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
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_interactions: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      submit_rating: {
        Args: { p_rating: number; p_target_user_id: string }
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
