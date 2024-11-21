import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: solution, isLoading } = useQuery<Solution>({
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
    refetchInterval: (data) => {
      if (data?.title && data?.title !== "Generating title..." && data?.automation_suggestion) {
        return false;
      }
      return 2000;
    },
  });

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
          <h1 className="text-3xl font-bold text-white">{solution.title}</h1>
          <p className="text-gray-400">{solution.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Free Plan */}
          <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
            <div className="text-emerald-500 mb-4">Free</div>
            <p className="text-white whitespace-pre-wrap">
              {solution.automation_suggestion || (
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
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
              </div>
              <p className="text-gray-500 text-center mt-4">
                This could take up to 24 hours, comeback later<br />
                or check your email for notification.
              </p>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1C1C1C] rounded-lg border border-[#333333] p-6">
              <div className="text-emerald-500 mb-4">Pro</div>
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
              </div>
              <p className="text-gray-500 text-center mt-4">
                This could take up to 24 hours, comeback later<br />
                or check your email for notification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solution;