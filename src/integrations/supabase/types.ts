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
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          plan_type: string | null
          solution_id: string
          stripe_payment_captured: boolean | null
          stripe_payment_status: string | null
          stripe_session_id: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          plan_type?: string | null
          solution_id: string
          stripe_payment_captured?: boolean | null
          stripe_payment_status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          plan_type?: string | null
          solution_id?: string
          stripe_payment_captured?: boolean | null
          stripe_payment_status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          automation_suggestion: string | null
          created_at: string
          description: string
          discount: number | null
          email: string
          id: string
          premium_price: number | null
          premium_time: number | null
          pro_price: number | null
          pro_time: number | null
          replied: boolean | null
          title: string
          whatsapp_number: string | null
        }
        Insert: {
          automation_suggestion?: string | null
          created_at?: string
          description: string
          discount?: number | null
          email: string
          id?: string
          premium_price?: number | null
          premium_time?: number | null
          pro_price?: number | null
          pro_time?: number | null
          replied?: boolean | null
          title: string
          whatsapp_number?: string | null
        }
        Update: {
          automation_suggestion?: string | null
          created_at?: string
          description?: string
          discount?: number | null
          email?: string
          id?: string
          premium_price?: number | null
          premium_time?: number | null
          pro_price?: number | null
          pro_time?: number | null
          replied?: boolean | null
          title?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      stripe_logs: {
        Row: {
          amount: number | null
          created_at: string
          event_id: string
          event_type: string
          id: string
          metadata: Json | null
          order_id: string | null
          payment_intent_id: string | null
          raw_event: Json
          session_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id?: string | null
          raw_event: Json
          session_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id?: string | null
          raw_event?: Json
          session_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
