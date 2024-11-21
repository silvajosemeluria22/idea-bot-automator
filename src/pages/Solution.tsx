import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="max-w-4xl mx-auto space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className="bg-[#232323] border-[#505050]">
            <CardHeader>
              <CardTitle className="text-white">Free Plan</CardTitle>
              <CardDescription>Basic automation suggestion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">$0</p>
                <p className="text-gray-400">Delivery Time: Instant</p>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          {solution.premium_price && solution.premium_time && (
            <Card className="bg-[#232323] border-[#505050]">
              <CardHeader>
                <CardTitle className="text-white">Premium Plan</CardTitle>
                <CardDescription>Enhanced automation solution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">${solution.premium_price}</p>
                  <p className="text-gray-400">Delivery Time: {solution.premium_time} hours</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pro Plan */}
          {solution.pro_price && solution.pro_time && (
            <Card className="bg-[#232323] border-[#505050]">
              <CardHeader>
                <CardTitle className="text-white">Pro Plan</CardTitle>
                <CardDescription>Full custom implementation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">${solution.pro_price}</p>
                  <p className="text-gray-400">Delivery Time: {solution.pro_time} hours</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Solution;