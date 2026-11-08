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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          adjustment: number | null
          admin_username: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string
        }
        Insert: {
          action: string
          adjustment?: number | null
          admin_username: string
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string
        }
        Update: {
          action?: string
          adjustment?: number | null
          admin_username?: string
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ballots: {
        Row: {
          candidate_ids: string[]
          created_at: string
          id: string
          ip_fingerprint: string
          party_id: string
        }
        Insert: {
          candidate_ids: string[]
          created_at?: string
          id: string
          ip_fingerprint: string
          party_id: string
        }
        Update: {
          candidate_ids?: string[]
          created_at?: string
          id?: string
          ip_fingerprint?: string
          party_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ballots_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          age: number | null
          arabic_name: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          list_position: number
          manual_vote_adjustment: number
          party_id: string
          photo_url: string
          profession: string | null
        }
        Insert: {
          age?: number | null
          arabic_name?: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          list_position: number
          manual_vote_adjustment?: number
          party_id: string
          photo_url?: string
          profession?: string | null
        }
        Update: {
          age?: number | null
          arabic_name?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          list_position?: number
          manual_vote_adjustment?: number
          party_id?: string
          photo_url?: string
          profession?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      election_settings: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      parties: {
        Row: {
          accent_color: string
          arabic_name: string
          display_order: number
          id: string
          is_public: boolean
          list_number: number
          logo_url: string
          manual_vote_adjustment: number
          name: string
          theme_color: string
        }
        Insert: {
          accent_color?: string
          arabic_name?: string
          display_order?: number
          id: string
          is_public?: boolean
          list_number: number
          logo_url?: string
          manual_vote_adjustment?: number
          name: string
          theme_color?: string
        }
        Update: {
          accent_color?: string
          arabic_name?: string
          display_order?: number
          id?: string
          is_public?: boolean
          list_number?: number
          logo_url?: string
          manual_vote_adjustment?: number
          name?: string
          theme_color?: string
        }
        Relationships: []
      }
      security_records: {
        Row: {
          attempts_count: number
          first_seen: string
          ip_fingerprint: string
          last_attempt: string
          reason: string | null
          status: string
        }
        Insert: {
          attempts_count?: number
          first_seen?: string
          ip_fingerprint: string
          last_attempt?: string
          reason?: string | null
          status: string
        }
        Update: {
          attempts_count?: number
          first_seen?: string
          ip_fingerprint?: string
          last_attempt?: string
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_events: {
        Row: {
          candidate_count: number
          created_at: string
          id: number
          list_number: number
          party_id: string
          party_name: string
          total_ballots: number
        }
        Insert: {
          candidate_count: number
          created_at?: string
          id?: number
          list_number: number
          party_id: string
          party_name: string
          total_ballots: number
        }
        Update: {
          candidate_count?: number
          created_at?: string
          id?: number
          list_number?: number
          party_id?: string
          party_name?: string
          total_ballots?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_ballot: {
        Args: { p_candidate_ids: string[]; p_fp: string; p_party_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
