import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedText } from "@/components/FormattedText";

type Solution = {
  id: string;
  title: string;
  description: string;
  email: string;
  created_at: string;
  automation_suggestion: string | null;
  premium_price: number | null;
  premium_time: number | null;
  pro_price: number | null;
  pro_time: number | null;
  replied: boolean;
}

const SolutionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [premiumPrice, setPremiumPrice] = useState<string>("");
  const [premiumTime, setPremiumTime] = useState<string>("");
  const [proPrice, setProPrice] = useState<string>("");
  const [proTime, setProTime] = useState<string>("");

  const { data: solution, isLoading } = useQuery({
    queryKey: ['admin-solution', id],
    queryFn: async () => {
      if (!id) throw new Error('No solution ID provided');
      
      const { data, error } = await supabase
        .from('solutions')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;

      setPremiumPrice(data.premium_price?.toString() || "");
      setPremiumTime(data.premium_time?.toString() || "");
      setProPrice(data.pro_price?.toString() || "");
      setProTime(data.pro_time?.toString() || "");

      return data as Solution;
    },
    enabled: !!id,
  });

  const handleSave = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('solutions')
        .update({
          premium_price: premiumPrice ? parseFloat(premiumPrice) : null,
          premium_time: premiumTime ? parseInt(premiumTime) : null,
          pro_price: proPrice ? parseFloat(proPrice) : null,
          pro_time: proTime ? parseInt(proTime) : null,
          replied: true
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Solution updated successfully",
      });
      
      navigate("/admin/dashboard/solutions");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update solution",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Solution not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-4">Solution Details</h1>
      
      <Card className="bg-[#232323] border-[#505050]">
        <CardHeader>
          <CardTitle>{solution.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Description</p>
            <p className="text-white">{solution.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Email</p>
            <p className="text-white">{solution.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Automation Suggestion</p>
            <FormattedText text={solution.automation_suggestion} className="text-white whitespace-pre-wrap" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#232323] border-[#505050]">
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Premium Plan</h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Price ($)</label>
                <Input
                  type="number"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  placeholder="Enter premium price"
                  className="bg-[#1C1C1C] border-[#505050]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Delivery Time (hours)</label>
                <Input
                  type="number"
                  value={premiumTime}
                  onChange={(e) => setPremiumTime(e.target.value)}
                  placeholder="Enter delivery time"
                  className="bg-[#1C1C1C] border-[#505050]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Price ($)</label>
                <Input
                  type="number"
                  value={proPrice}
                  onChange={(e) => setProPrice(e.target.value)}
                  placeholder="Enter pro price"
                  className="bg-[#1C1C1C] border-[#505050]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Delivery Time (hours)</label>
                <Input
                  type="number"
                  value={proTime}
                  onChange={(e) => setProTime(e.target.value)}
                  placeholder="Enter delivery time"
                  className="bg-[#1C1C1C] border-[#505050]"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full md:w-auto"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionView;
