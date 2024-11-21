import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { PremiumPlanCard } from "@/components/solution/PremiumPlanCard";
import { ProPlanCard } from "@/components/solution/ProPlanCard";
import type { Solution } from "@/types/order";

const Solution = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  const { data: solution, isLoading } = useQuery({
    queryKey: ["solution", id],
    queryFn: async () => {
      if (!id) throw new Error('No solution ID provided');

      const { data, error } = await supabase
        .from("solutions")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching solution:", error);
        throw error;
      }

      if (data.whatsapp_number) {
        setWhatsapp(data.whatsapp_number);
      }

      return data as Solution;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      if (!query.state.data) return 2000;
      if (!query.state.data.premium_price || !query.state.data.pro_price) {
        return 2000;
      }
      return false;
    },
  });

  const { data: paidOrder } = useQuery({
    queryKey: ["paidOrder", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("orders")
        .select()
        .eq("solution_id", id)
        .eq("stripe_payment_status", "paid")
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error fetching order:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  const handleCheckout = async () => {
    if (!solution) return;
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          email: solution.email,
          amount: solution.premium_price,
          title: solution.title,
          solutionId: solution.id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">Solution not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{solution?.title}</h1>
          <p className="text-gray-400">{solution?.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
            <div className="text-emerald-500 mb-4">Free</div>
            <p className="text-white whitespace-pre-wrap">
              {solution?.automation_suggestion || (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                </div>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solution && (
              <PremiumPlanCard
                paidOrder={paidOrder}
                solution={solution}
                isProcessing={isProcessing}
                whatsapp={whatsapp}
                onWhatsappChange={setWhatsapp}
                onCheckout={handleCheckout}
              />
            )}
            {solution && <ProPlanCard solution={solution} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solution;