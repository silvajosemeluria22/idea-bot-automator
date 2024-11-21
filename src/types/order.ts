import type { Database } from "@/integrations/supabase/types";

export type Order = Database['public']['Tables']['orders']['Row'] & {
  solution?: {
    title: string;
  };
};

export type Solution = Database['public']['Tables']['solutions']['Row'];