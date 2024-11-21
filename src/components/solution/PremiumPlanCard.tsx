import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type PremiumPlanProps = {
  paidOrder: any;
  solution: {
    premium_price: number;
    premium_time: number;
  };
  isProcessing: boolean;
  whatsapp: string;
  onWhatsappChange: (value: string) => void;
  onCheckout: () => void;
};

export const PremiumPlanCard = ({
  paidOrder,
  solution,
  isProcessing,
  whatsapp,
  onWhatsappChange,
  onCheckout,
}: PremiumPlanProps) => {
  if (paidOrder) {
    return (
      <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6 relative min-h-[300px]">
        <div className="text-emerald-500 mb-4">Premium</div>
        <div className="space-y-4">
          <p className="text-white">
            Thank you, we are working on this, you will be notified by email once is completed.
          </p>
          <div className="space-y-2">
            <p className="text-white">
              Prefer whatsapp? input your number bellow with country indicator
            </p>
            <Input
              value={whatsapp}
              onChange={(e) => onWhatsappChange(e.target.value)}
              placeholder="Whatsapp"
              className="bg-[#1C1C1C] border-[#333333] text-white"
            />
          </div>
          <p className="text-emerald-500 absolute bottom-6">Order Placed Successfully</p>
        </div>
      </div>
    );
  }

  if (solution?.premium_price && solution?.premium_time) {
    return (
      <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
        <div className="text-emerald-500 mb-4">Premium</div>
        <div className="space-y-4">
          <p className="text-white">
            A more detailed solution that includes a comprehensive diagram illustrating the solution architecture, and a step-by-step action plan for implementation. This package is designed for clients who have the resources to implement the solution on their own but need a detailed roadmap.
          </p>
          <p className="text-emerald-500">Price: ${solution.premium_price}</p>
          <p className="text-gray-400">Delivery time: {solution.premium_time} hours</p>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            onClick={onCheckout}
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
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
      <div className="text-emerald-500 mb-4">Premium</div>
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