import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Solution = {
  id: string;
  title: string;
  description: string;
  automation_suggestion: string | null;
  premium_price: number | null;
  premium_time: number | null;
  pro_price: number | null;
  pro_time: number | null;
};

const Solution = () => {
  const { id } = useParams();

  const { data: solution, isLoading } = useQuery({
    queryKey: ["solution", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Solution;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{solution.title}</h1>
          <p className="text-gray-400 whitespace-pre-wrap">{solution.description}</p>
          {solution.automation_suggestion && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-2">Automation Suggestion</h2>
              <p className="text-gray-400 whitespace-pre-wrap">{solution.automation_suggestion}</p>
            </div>
          )}
        </div>

        {(solution.premium_price || solution.pro_price) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solution.premium_price && solution.premium_time && (
              <div className="bg-[#232323] p-6 rounded-lg border border-[#505050]">
                <h3 className="text-xl font-semibold text-white mb-4">Premium Plan</h3>
                <div className="space-y-2">
                  <p className="text-gray-400">Price: ${solution.premium_price}</p>
                  <p className="text-gray-400">Delivery Time: {solution.premium_time} hours</p>
                </div>
              </div>
            )}

            {solution.pro_price && solution.pro_time && (
              <div className="bg-[#232323] p-6 rounded-lg border border-[#505050]">
                <h3 className="text-xl font-semibold text-white mb-4">Pro Plan</h3>
                <div className="space-y-2">
                  <p className="text-gray-400">Price: ${solution.pro_price}</p>
                  <p className="text-gray-400">Delivery Time: {solution.pro_time} hours</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solution;