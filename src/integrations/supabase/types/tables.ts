export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface OrdersTable {
  Row: {
    amount: number
    created_at: string
    currency: string
    customer_email: string
    id: string
    metadata: Json | null
    payment_intent_id: string | null
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
    solution_id?: string
    stripe_payment_captured?: boolean | null
    stripe_payment_status?: string | null
    stripe_session_id?: string | null
    updated_at?: string
    whatsapp_number?: string | null
  }
}

export interface SolutionsTable {
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
}

export interface StripeLogsTable {
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
}