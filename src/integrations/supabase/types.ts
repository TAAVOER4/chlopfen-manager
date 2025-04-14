export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      group_participants: {
        Row: {
          group_id: number
          modified_at: string | null
          modified_by: string | null
          participant_id: number
          record_type: string | null
        }
        Insert: {
          group_id: number
          modified_at?: string | null
          modified_by?: string | null
          participant_id: number
          record_type?: string | null
        }
        Update: {
          group_id?: number
          modified_at?: string | null
          modified_by?: string | null
          participant_id?: number
          record_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      group_scores: {
        Row: {
          group_id: number
          id: number
          judge_id: string
          modified_at: string | null
          modified_by: string | null
          record_type: string | null
          rhythm: number
          tempo: number
          time: boolean
          tournament_id: number | null
          whip_strikes: number
        }
        Insert: {
          group_id: number
          id?: number
          judge_id: string
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          rhythm: number
          tempo: number
          time?: boolean
          tournament_id?: number | null
          whip_strikes: number
        }
        Update: {
          group_id?: number
          id?: number
          judge_id?: string
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          rhythm?: number
          tempo?: number
          time?: boolean
          tournament_id?: number | null
          whip_strikes?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_scores_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_scores_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_scores_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: Database["public"]["Enums"]["group_category"]
          display_order: number | null
          id: number
          modified_at: string | null
          modified_by: string | null
          name: string
          record_type: string | null
          size: Database["public"]["Enums"]["group_size"]
          tournament_id: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["group_category"]
          display_order?: number | null
          id?: number
          modified_at?: string | null
          modified_by?: string | null
          name: string
          record_type?: string | null
          size: Database["public"]["Enums"]["group_size"]
          tournament_id?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["group_category"]
          display_order?: number | null
          id?: number
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          record_type?: string | null
          size?: Database["public"]["Enums"]["group_size"]
          tournament_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_scores: {
        Row: {
          id: number
          judge_id: string
          modified_at: string | null
          modified_by: string | null
          participant_id: number
          posture: number
          record_type: string | null
          rhythm: number
          round: number
          stance: number
          tournament_id: number | null
          whip_control: number
          whip_strikes: number
        }
        Insert: {
          id?: number
          judge_id: string
          modified_at?: string | null
          modified_by?: string | null
          participant_id: number
          posture: number
          record_type?: string | null
          rhythm: number
          round: number
          stance: number
          tournament_id?: number | null
          whip_control: number
          whip_strikes: number
        }
        Update: {
          id?: number
          judge_id?: string
          modified_at?: string | null
          modified_by?: string | null
          participant_id?: number
          posture?: number
          record_type?: string | null
          rhythm?: number
          round?: number
          stance?: number
          tournament_id?: number | null
          whip_control?: number
          whip_strikes?: number
        }
        Relationships: [
          {
            foreignKeyName: "individual_scores_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_scores_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          birth_year: number
          category: Database["public"]["Enums"]["participant_category"]
          display_order: number | null
          first_name: string
          id: number
          is_group_only: boolean | null
          last_name: string
          location: string
          modified_at: string | null
          modified_by: string | null
          record_type: string | null
          tournament_id: number | null
        }
        Insert: {
          birth_year: number
          category: Database["public"]["Enums"]["participant_category"]
          display_order?: number | null
          first_name: string
          id?: number
          is_group_only?: boolean | null
          last_name: string
          location: string
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          tournament_id?: number | null
        }
        Update: {
          birth_year?: number
          category?: Database["public"]["Enums"]["participant_category"]
          display_order?: number | null
          first_name?: string
          id?: number
          is_group_only?: boolean | null
          last_name?: string
          location?: string
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          tournament_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          category: string | null
          description: string | null
          end_time: string
          id: number
          modified_at: string | null
          modified_by: string | null
          record_type: string | null
          start_time: string
          title: string
          tournament_id: number
          type: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          end_time: string
          id?: number
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          start_time: string
          title: string
          tournament_id: number
          type: string
        }
        Update: {
          category?: string | null
          description?: string | null
          end_time?: string
          id?: number
          modified_at?: string | null
          modified_by?: string | null
          record_type?: string | null
          start_time?: string
          title?: string
          tournament_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          category: string | null
          id: number
          is_main_sponsor: boolean | null
          logo: string | null
          modified_at: string | null
          modified_by: string | null
          name: string
          rank: number | null
          record_type: string | null
          tournament_id: number | null
          type: Database["public"]["Enums"]["sponsor_type"]
          website_url: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          is_main_sponsor?: boolean | null
          logo?: string | null
          modified_at?: string | null
          modified_by?: string | null
          name: string
          rank?: number | null
          record_type?: string | null
          tournament_id?: number | null
          type: Database["public"]["Enums"]["sponsor_type"]
          website_url?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          is_main_sponsor?: boolean | null
          logo?: string | null
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          rank?: number | null
          record_type?: string | null
          tournament_id?: number | null
          type?: Database["public"]["Enums"]["sponsor_type"]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          date: string
          id: number
          is_active: boolean
          location: string
          modified_at: string | null
          modified_by: string | null
          name: string
          record_type: string | null
          year: number
        }
        Insert: {
          date: string
          id?: number
          is_active?: boolean
          location: string
          modified_at?: string | null
          modified_by?: string | null
          name: string
          record_type?: string | null
          year: number
        }
        Update: {
          date?: string
          id?: number
          is_active?: boolean
          location?: string
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          record_type?: string | null
          year?: number
        }
        Relationships: []
      }
      user_tournaments: {
        Row: {
          tournament_id: number
          user_id: string
        }
        Insert: {
          tournament_id: number
          user_id: string
        }
        Update: {
          tournament_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tournaments_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tournaments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          group_criterion: string | null
          id: string
          individual_criterion: string | null
          modified_at: string | null
          modified_by: string | null
          name: string
          password_hash: string
          record_type: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          group_criterion?: string | null
          id?: string
          individual_criterion?: string | null
          modified_at?: string | null
          modified_by?: string | null
          name: string
          password_hash: string
          record_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          group_criterion?: string | null
          id?: string
          individual_criterion?: string | null
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          password_hash?: string
          record_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
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
      group_category: "kids_juniors" | "active"
      group_size: "three" | "four"
      participant_category: "kids" | "juniors" | "active"
      sponsor_type: "prize" | "donor" | "banner" | "main"
      user_role: "admin" | "judge" | "reader" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      group_category: ["kids_juniors", "active"],
      group_size: ["three", "four"],
      participant_category: ["kids", "juniors", "active"],
      sponsor_type: ["prize", "donor", "banner", "main"],
      user_role: ["admin", "judge", "reader", "editor"],
    },
  },
} as const
