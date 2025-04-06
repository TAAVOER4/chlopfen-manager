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
          participant_id: number
        }
        Insert: {
          group_id: number
          participant_id: number
        }
        Update: {
          group_id?: number
          participant_id?: number
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
          name: string
          size: Database["public"]["Enums"]["group_size"]
          tournament_id: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["group_category"]
          display_order?: number | null
          id?: number
          name: string
          size: Database["public"]["Enums"]["group_size"]
          tournament_id?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["group_category"]
          display_order?: number | null
          id?: number
          name?: string
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
          participant_id: number
          posture: number
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
          participant_id: number
          posture: number
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
          participant_id?: number
          posture?: number
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
          name: string
          rank: number | null
          tournament_id: number | null
          type: Database["public"]["Enums"]["sponsor_type"]
          website_url: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          is_main_sponsor?: boolean | null
          logo?: string | null
          name: string
          rank?: number | null
          tournament_id?: number | null
          type: Database["public"]["Enums"]["sponsor_type"]
          website_url?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          is_main_sponsor?: boolean | null
          logo?: string | null
          name?: string
          rank?: number | null
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
          name: string
          year: number
        }
        Insert: {
          date: string
          id?: number
          is_active?: boolean
          location: string
          name: string
          year: number
        }
        Update: {
          date?: string
          id?: number
          is_active?: boolean
          location?: string
          name?: string
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
          name: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          group_criterion?: string | null
          id?: string
          individual_criterion?: string | null
          name: string
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          group_criterion?: string | null
          id?: string
          individual_criterion?: string | null
          name?: string
          password_hash?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
