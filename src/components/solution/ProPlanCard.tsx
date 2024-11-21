import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Solution } from "@/types/order";

type ProPlanProps = {
  solution: Solution;
  paidOrder?: any;
  whatsapp: string;
  onWhatsappChange: (value: string) => void;
};

export const ProPlanCard = ({ solution, paidOrder, whatsapp, onWhatsappChange }: ProPlanProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveWhatsapp = async () => {
    if (!whatsapp) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ whatsapp_number: whatsapp })
        .eq('id', solution.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp number saved successfully",
      });
    } catch (error) {
      console.error('Error saving WhatsApp number:', error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp number",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  if (paidOrder) {
    return (
      <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6 relative min-h-[300px]">
        <div className="text-emerald-500 mb-4">Pro</div>
        <div className="space-y-4">
          {!solution.whatsapp_number ? (
            <>
              <p className="text-white">
                Thank you, we are working on this, you will be notified by email once is completed.
              </p>
              <div className="space-y-2">
                <p className="text-white">
                  Prefer whatsapp? input your number bellow with country indicator
                </p>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <PhoneInput
                      country={'us'}
                      value={whatsapp}
                      onChange={onWhatsappChange}
                      inputStyle={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: '#1C1C1C',
                        border: '1px solid #333333',
                        color: 'white',
                      }}
                      dropdownStyle={{
                        backgroundColor: '#1C1C1C',
                        border: '1px solid #333333',
                        color: 'white',
                      }}
                      buttonStyle={{
                        backgroundColor: '#1C1C1C',
                        border: '1px solid #333333',
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSaveWhatsapp}
                    disabled={isSaving || !whatsapp}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-white">
                Thank you, we are working on this, you will be notified by email and whatsapp once is completed.
              </p>
            </div>
          )}
          <p className="text-emerald-500 absolute bottom-6">Order Placed Successfully</p>
        </div>
      </div>
    );
  }

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