import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Solution = {
  id: string;
  title: string;
  description: string;
  email: string;
  created_at: string;
}

const Solution = () => {
  const { id } = useParams();

  const { data: solution, isLoading } = useQuery<Solution>({
    queryKey: ['solution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: (data) => 
      data && data.title === "Generating title..." ? 2000 : false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Solution Not Found</CardTitle>
            <CardDescription>
              The solution you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            {solution.title === "Generating title..." ? (
              <div className="flex items-center gap-2">
                <span>Generating title</span>
                <div className="animate-bounce">...</div>
              </div>
            ) : (
              solution.title
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Submitted by: {solution.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{solution.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            Submitted on: {new Date(solution.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solution;