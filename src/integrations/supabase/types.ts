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
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          venue_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          venue_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
          room_id: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
          room_id?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          created_by_owner_id: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          duration_hours: number
          id: string
          notes: string | null
          payment_intent_id: string | null
          source: string
          status: string
          total_price: number
          updated_at: string
          user_id: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          created_by_owner_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_hours?: number
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          source?: string
          status?: string
          total_price: number
          updated_at?: string
          user_id: string
          venue_id: string
          venue_name: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          created_by_owner_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_hours?: number
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          source?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
          venue_name?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          venue_id: string | null
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          venue_id?: string | null
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_reported: boolean | null
          message_text: string
          message_type: string
          reported_at: string | null
          reported_by: string | null
          room_id: string
          sender_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_reported?: boolean | null
          message_text: string
          message_type?: string
          reported_at?: string | null
          reported_by?: string | null
          room_id: string
          sender_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_reported?: boolean | null
          message_text?: string
          message_type?: string
          reported_at?: string | null
          reported_by?: string | null
          room_id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          reference_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reference_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reference_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_participants: {
        Row: {
          game_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number
          game_date: string
          game_time: string
          host_id: string
          id: string
          is_public: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          max_players: number
          price_per_player: number | null
          skill_level: string
          sport: string
          status: string
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          game_date: string
          game_time: string
          host_id: string
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_players?: number
          price_per_player?: number | null
          skill_level?: string
          sport: string
          status?: string
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          game_date?: string
          game_time?: string
          host_id?: string
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_players?: number
          price_per_player?: number | null
          skill_level?: string
          sport?: string
          status?: string
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      owner_reply_templates: {
        Row: {
          created_at: string
          id: string
          message_text: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          owner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_policies: {
        Row: {
          created_at: string
          id: string
          policy_data: Json
          policy_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          policy_data?: Json
          policy_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          policy_data?: Json
          policy_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          notification_preferences: Json | null
          onboarding_completed: boolean
          phone: string | null
          preferred_currency: string | null
          preferred_sports: string[] | null
          skill_level: string | null
          sports_offered: string[] | null
          stripe_account_id: string | null
          stripe_onboarding_completed: boolean | null
          updated_at: string
          user_id: string
          user_type: string
          username: string | null
          venue_address: string | null
          venue_description: string | null
          venue_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          preferred_currency?: string | null
          preferred_sports?: string[] | null
          skill_level?: string | null
          sports_offered?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
          user_type?: string
          username?: string | null
          venue_address?: string | null
          venue_description?: string | null
          venue_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          preferred_currency?: string | null
          preferred_sports?: string[] | null
          skill_level?: string | null
          sports_offered?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string
          username?: string | null
          venue_address?: string | null
          venue_description?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_equipment: {
        Row: {
          created_at: string
          description: string | null
          equipment_type: string
          id: string
          is_available: boolean
          name: string
          price: number
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment_type?: string
          id?: string
          is_available?: boolean
          name: string
          price?: number
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment_type?: string
          id?: string
          is_available?: boolean
          name?: string
          price?: number
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_equipment_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_hours: {
        Row: {
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string
          venue_id: string
        }
        Insert: {
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time: string
          venue_id: string
        }
        Update: {
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_hours_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_policies: {
        Row: {
          booking_window_days: number
          buffer_minutes: number
          cancellation_hours: number
          cancellation_policy: string
          checkin_instructions: string | null
          created_at: string
          early_arrival_minutes: number | null
          early_arrival_policy: string | null
          grace_period_minutes: number
          id: string
          max_duration_hours: number
          min_duration_hours: number
          overtime_rate_per_minute: number | null
          refund_type: string
          time_slot_increment: number
          updated_at: string
          venue_id: string
          venue_rules: string | null
        }
        Insert: {
          booking_window_days?: number
          buffer_minutes?: number
          cancellation_hours?: number
          cancellation_policy?: string
          checkin_instructions?: string | null
          created_at?: string
          early_arrival_minutes?: number | null
          early_arrival_policy?: string | null
          grace_period_minutes?: number
          id?: string
          max_duration_hours?: number
          min_duration_hours?: number
          overtime_rate_per_minute?: number | null
          refund_type?: string
          time_slot_increment?: number
          updated_at?: string
          venue_id: string
          venue_rules?: string | null
        }
        Update: {
          booking_window_days?: number
          buffer_minutes?: number
          cancellation_hours?: number
          cancellation_policy?: string
          checkin_instructions?: string | null
          created_at?: string
          early_arrival_minutes?: number | null
          early_arrival_policy?: string | null
          grace_period_minutes?: number
          id?: string
          max_duration_hours?: number
          min_duration_hours?: number
          overtime_rate_per_minute?: number | null
          refund_type?: string
          time_slot_increment?: number
          updated_at?: string
          venue_id?: string
          venue_rules?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_policies_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: true
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          amenities: string[] | null
          city: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_indoor: boolean | null
          latitude: number | null
          location_confirmed: boolean | null
          longitude: number | null
          name: string
          owner_id: string
          price_per_hour: number
          rating: number | null
          review_count: number | null
          sports: string[]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_indoor?: boolean | null
          latitude?: number | null
          location_confirmed?: boolean | null
          longitude?: number | null
          name: string
          owner_id: string
          price_per_hour?: number
          rating?: number | null
          review_count?: number | null
          sports?: string[]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_indoor?: boolean | null
          latitude?: number | null
          location_confirmed?: boolean | null
          longitude?: number | null
          name?: string
          owner_id?: string
          price_per_hour?: number
          rating?: number | null
          review_count?: number | null
          sports?: string[]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          onboarding_completed: boolean | null
          preferred_sports: string[] | null
          skill_level: string | null
          user_id: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          onboarding_completed?: boolean | null
          preferred_sports?: string[] | null
          skill_level?: string | null
          user_id?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          onboarding_completed?: boolean | null
          preferred_sports?: string[] | null
          skill_level?: string | null
          user_id?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_chat_member: {
        Args: { p_role: string; p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      get_or_create_chat_room:
        | { Args: { p_reference_id: string; p_type: string }; Returns: string }
        | { Args: { p_reference_id: string; p_type: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: boolean
      }
      send_system_message: {
        Args: { p_message: string; p_room_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
