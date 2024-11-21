import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Solution } from "@/types/order";

type ProPlanProps = {
  solution: Solution;
};

export const ProPlanCard = ({ solution }: ProPlanProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!solution) return;
    setIsProcessing(true);

    try {
      const originalPrice = solution.pro_price || 0;
      const finalPrice = solution.discount 
        ? Math.max(0, originalPrice - solution.discount)
        : originalPrice;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          email: solution.email,
          amount: finalPrice,
          title: `Pro Plan: ${solution.title}`,
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

  if (solution?.pro_price && solution?.pro_time) {
    const originalPrice = solution.pro_price;
    const discountedPrice = solution.discount 
      ? Math.max(0, originalPrice - solution.discount)
      : originalPrice;

    return (
      <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
        <div className="text-emerald-500 mb-4">Pro</div>
        <div className="space-y-4">
          <p className="text-white">
            The most comprehensive offering, this package includes not only the detailed planning and diagrams of the Premium Solution but also full implementation services provided by our team. This hands-off approach is perfect for clients who prefer to have experts handle the entire process.
          </p>
          <div className="space-y-1">
            {solution.discount ? (
              <>
                <p className="text-gray-400 line-through">${originalPrice}</p>
                <p className="text-emerald-500">
                  ${discountedPrice} 
                  <span className="text-sm text-gray-400 ml-2">
                    (Premium plan credited)
                  </span>
                </p>
              </>
            ) : (
              <p className="text-emerald-500">Price: ${originalPrice}</p>
            )}
          </div>
          <p className="text-gray-400">Delivery time: {solution.pro_time} hours</p>
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
              "Do it for me"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
      <div className="text-emerald-500 mb-4">Pro</div>
      <div className="flex flex-col items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        <p className="text-gray-500 text-center mt-4">
          This could take up to 24 hours, comeback later<br />
          or check your email for notification.
        </p>
      </div>
    </div>
  );
};