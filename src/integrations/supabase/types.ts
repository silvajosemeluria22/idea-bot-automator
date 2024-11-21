// Base types
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database schema types
type SolutionRow = {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  automation_suggestion: string | null
  premium_price: number | null
  premium_time: number | null
  pro_price: number | null
  pro_time: number | null
  replied: boolean | null
  whatsapp_number: string | null
}

type OrderRow = {
  id: string
  solution_id: string
  stripe_session_id: string | null
  stripe_payment_status: string | null
  stripe_payment_captured: boolean | null
  amount: number
  currency: string
  customer_email: string
  created_at: string
  updated_at: string
  metadata: Json | null
  payment_intent_id: string | null
}

type StripeLogRow = {
  id: string
  event_type: string
  event_id: string
  created_at: string
  payment_intent_id: string | null
  session_id: string | null
  order_id: string | null
  status: string | null
  amount: number | null
  metadata: Json | null
  raw_event: Json
}

// Database schema
export type Database = {
  public: {
    Tables: {
      solutions: {
        Row: SolutionRow
        Insert: Partial<SolutionRow>
        Update: Partial<SolutionRow>
      }
      orders: {
        Row: OrderRow
        Insert: Partial<OrderRow>
        Update: Partial<OrderRow>
      }
      stripe_logs: {
        Row: StripeLogRow
        Insert: Partial<StripeLogRow>
        Update: Partial<StripeLogRow>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Export table types for convenience
export type Solution = Database['public']['Tables']['solutions']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type StripeLog = Database['public']['Tables']['stripe_logs']['Row']