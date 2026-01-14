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
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          duration_hours: number
          id: string
          payment_intent_id: string | null
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
          duration_hours?: number
          id?: string
          payment_intent_id?: string | null
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
          duration_hours?: number
          id?: string
          payment_intent_id?: string | null
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
          venue_name?: string
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
          location: string
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
          location: string
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
          location?: string
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
          name: string
          owner_id: string
          price_per_hour: number
          rating: number | null
          review_count: number | null
          sports: string[]
          updated_at: string
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
          name: string
          owner_id: string
          price_per_hour?: number
          rating?: number | null
          review_count?: number | null
          sports?: string[]
          updated_at?: string
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
          name?: string
          owner_id?: string
          price_per_hour?: number
          rating?: number | null
          review_count?: number | null
          sports?: string[]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
