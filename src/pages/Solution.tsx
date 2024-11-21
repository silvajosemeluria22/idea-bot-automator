import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Solution = {
  id: string;
  title: string;
  description: string;
  email: string;
  automation_suggestion: string | null;
  premium_price: number | null;
  premium_time: number | null;
  pro_price: number | null;
  pro_time: number | null;
};

const Solution = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

      return data as Solution;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      if (!query.state.data) return 2000;
      // Continue refetching until both premium and pro plans are set
      if (!query.state.data.premium_price || !query.state.data.pro_price) {
        return 2000;
      }
      return false;
    },
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
          {/* Free Plan */}
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
            {/* Premium Plan */}
            <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
              <div className="text-emerald-500 mb-4">Premium</div>
              {solution?.premium_price && solution?.premium_time ? (
                <div className="space-y-4">
                  <p className="text-white">
                    A more detailed solution that includes a comprehensive diagram illustrating the solution architecture, and a step-by-step action plan for implementation. This package is designed for clients who have the resources to implement the solution on their own but need a detailed roadmap.
                  </p>
                  <p className="text-emerald-500">Price: ${solution.premium_price}</p>
                  <p className="text-gray-400">Delivery time: {solution.premium_time} hours</p>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Get the blueprint"
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                  </div>
                  <p className="text-gray-500 text-center mt-4">
                    This could take up to 24 hours, comeback later<br />
                    or check your email for notification.
                  </p>
                </>
              )}
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
              <div className="text-emerald-500 mb-4">Pro</div>
              {solution?.pro_price && solution?.pro_time ? (
                <div className="space-y-4">
                  <p className="text-white">
                    The most comprehensive offering, this package includes not only the detailed planning and diagrams of the Premium Solution but also full implementation services provided by our team. This hands-off approach is perfect for clients who prefer to have experts handle the entire process.
                  </p>
                  <p className="text-emerald-500">Price: ${solution.pro_price}</p>
                  <p className="text-gray-400">Delivery time: {solution.pro_time} hours</p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Do it for me
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                  </div>
                  <p className="text-gray-500 text-center mt-4">
                    This could take up to 24 hours, comeback later<br />
                    or check your email for notification.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solution;