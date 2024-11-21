// Base types
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database interface
interface Database {
  public: {
    Tables: {
      orders: OrdersTable;
      solutions: SolutionsTable;
      stripe_logs: StripeLogsTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Table interfaces
interface OrdersTable {
  Row: {
    amount: number;
    created_at: string;
    currency: string;
    customer_email: string;
    id: string;
    metadata: Json | null;
    payment_intent_id: string | null;
    solution_id: string;
    stripe_payment_captured: boolean | null;
    stripe_payment_status: string | null;
    stripe_session_id: string | null;
    updated_at: string;
  };
  Insert: {
    amount: number;
    created_at?: string;
    currency?: string;
    customer_email: string;
    id?: string;
    metadata?: Json | null;
    payment_intent_id?: string | null;
    solution_id: string;
    stripe_payment_captured?: boolean | null;
    stripe_payment_status?: string | null;
    stripe_session_id?: string | null;
    updated_at?: string;
  };
  Update: {
    amount?: number;
    created_at?: string;
    currency?: string;
    customer_email?: string;
    id?: string;
    metadata?: Json | null;
    payment_intent_id?: string | null;
    solution_id?: string;
    stripe_payment_captured?: boolean | null;
    stripe_payment_status?: string | null;
    stripe_session_id?: string | null;
    updated_at?: string;
  };
}

interface SolutionsTable {
  Row: {
    automation_suggestion: string | null;
    created_at: string;
    description: string;
    email: string;
    id: string;
    premium_price: number | null;
    premium_time: number | null;
    pro_price: number | null;
    pro_time: number | null;
    replied: boolean | null;
    title: string;
  };
  Insert: {
    automation_suggestion?: string | null;
    created_at?: string;
    description: string;
    email: string;
    id?: string;
    premium_price?: number | null;
    premium_time?: number | null;
    pro_price?: number | null;
    pro_time?: number | null;
    replied?: boolean | null;
    title: string;
  };
  Update: {
    automation_suggestion?: string | null;
    created_at?: string;
    description?: string;
    email?: string;
    id?: string;
    premium_price?: number | null;
    premium_time?: number | null;
    pro_price?: number | null;
    pro_time?: number | null;
    replied?: boolean | null;
    title?: string;
  };
}

interface StripeLogsTable {
  Row: {
    id: string;
    event_type: string;
    event_id: string;
    created_at: string;
    payment_intent_id: string | null;
    session_id: string | null;
    order_id: string | null;
    status: string | null;
    amount: number | null;
    metadata: Json | null;
    raw_event: Json;
  };
  Insert: {
    id?: string;
    event_type: string;
    event_id: string;
    created_at?: string;
    payment_intent_id?: string | null;
    session_id?: string | null;
    order_id?: string | null;
    status?: string | null;
    amount?: number | null;
    metadata?: Json | null;
    raw_event: Json;
  };
  Update: {
    id?: string;
    event_type?: string;
    event_id?: string;
    created_at?: string;
    payment_intent_id?: string | null;
    session_id?: string | null;
    order_id?: string | null;
    status?: string | null;
    amount?: number | null;
    metadata?: Json | null;
    raw_event?: Json;
  };
}

export type { Database, Json };