export interface Order {
  id: string;
  solution_id: string;
  stripe_session_id: string | null;
  stripe_payment_status: string | null;
  amount: number;
  currency: string;
  customer_email: string;
  created_at: string;
  solution?: {
    title: string;
  };
}