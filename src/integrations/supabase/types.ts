export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          day_of_month: number | null
          description: string
          end_date: string | null
          id: string
          is_recurring: boolean
          is_reserved: boolean
          next_occurrence_date: string | null
          recurring_interval: number | null
          recurring_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          day_of_month?: number | null
          description: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          is_reserved?: boolean
          next_occurrence_date?: string | null
          recurring_interval?: number | null
          recurring_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          day_of_month?: number | null
          description?: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          is_reserved?: boolean
          next_occurrence_date?: string | null
          recurring_interval?: number | null
          recurring_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          base_currency: string
          created_at: string
          has_completed_feature_tour: boolean
          id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          has_completed_feature_tour?: boolean
          id?: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          has_completed_feature_tour?: boolean
          id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salary: {
        Row: {
          id: string
          pay_dates: number[]
          paychecks: number[]
          schedule: string
          time_created: string
          time_updated: string
          user_id: string
        }
        Insert: {
          id?: string
          pay_dates: number[]
          paychecks: number[]
          schedule: string
          time_created?: string
          time_updated?: string
          user_id: string
        }
        Update: {
          id?: string
          pay_dates?: number[]
          paychecks?: number[]
          schedule?: string
          time_created?: string
          time_updated?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          contribution_frequency: string | null
          created_at: string
          current_amount: number
          icon: string | null
          id: string
          name: string
          recurring_contribution: number | null
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution_frequency?: string | null
          created_at?: string
          current_amount?: number
          icon?: string | null
          id?: string
          name: string
          recurring_contribution?: number | null
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution_frequency?: string | null
          created_at?: string
          current_amount?: number
          icon?: string | null
          id?: string
          name?: string
          recurring_contribution?: number | null
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          goal_id: string | null
          id: string
          is_reserved: boolean
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description: string
          goal_id?: string | null
          id?: string
          is_reserved?: boolean
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          goal_id?: string | null
          id?: string
          is_reserved?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_recurring_expenses: {
        Args: {
          user_id_param: string
          start_date_param: string
          end_date_param: string
        }
        Returns: {
          id: string
          description: string
          amount: number
          category: string
          date: string
          is_recurring: boolean
          user_id: string
        }[]
      }
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
