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
          expires_at: string
          id: string
          latitude: number
          longitude: number
          signal_type: Database["public"]["Enums"]["signal_type"]
          started_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          activity: Database["public"]["Enums"]["activity_type"]
          expires_at?: string
          id?: string
          latitude: number
          longitude: number
          signal_type?: Database["public"]["Enums"]["signal_type"]
          started_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          activity?: Database["public"]["Enums"]["activity_type"]
          expires_at?: string
          id?: string
          latitude?: number
          longitude?: number
          signal_type?: Database["public"]["Enums"]["signal_type"]
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          university: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          university?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
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
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
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
    }
    Views: {
      active_signals_public: {
        Row: {
          accuracy: number | null
          activity: Database["public"]["Enums"]["activity_type"] | null
          expires_at: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          signal_type: Database["public"]["Enums"]["signal_type"] | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          activity?: Database["public"]["Enums"]["activity_type"] | null
          expires_at?: string | null
          id?: string | null
          latitude?: never
          longitude?: never
          signal_type?: Database["public"]["Enums"]["signal_type"] | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          activity?: Database["public"]["Enums"]["activity_type"] | null
          expires_at?: string | null
          id?: string | null
          latitude?: never
          longitude?: never
          signal_type?: Database["public"]["Enums"]["signal_type"] | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_hours_active: {
        Args: { p_hours: number; p_user_id: string }
        Returns: undefined
      }
      cleanup_expired_signals: { Args: never; Returns: undefined }
      cleanup_old_interaction_locations: { Args: never; Returns: undefined }
      fuzz_coordinates: { Args: { lat: number; lon: number }; Returns: Json }
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
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_interactions: {
        Args: { p_user_id: string }
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
