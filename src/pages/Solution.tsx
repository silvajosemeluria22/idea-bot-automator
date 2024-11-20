import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Solution = {
  id: string;
  title: string;
  description: string;
  email: string;
  created_at: string;
  automation_suggestion?: string | null;
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

      if (data && !data.automation_suggestion) {
        try {
          const { data: suggestionData } = await supabase.functions.invoke('generate-automation', {
            body: { description: data.description }
          });
          
          if (suggestionData?.suggestion) {
            await supabase
              .from('solutions')
              .update({ automation_suggestion: suggestionData.suggestion })
              .eq('id', data.id);
            
            data.automation_suggestion = suggestionData.suggestion;
          }
        } catch (error) {
          console.error('Error generating automation suggestion:', error);
        }
      }

      return data;
    },
    refetchInterval: (data) => 
      data && (!data.automation_suggestion || data.title === "Generating title...") ? 2000 : false,
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
    <div className="container min-h-screen p-4 max-w-5xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">
          {solution.title === "Generating title..." ? (
            <div className="flex items-center gap-2">
              <span>Generating title</span>
              <div className="animate-bounce">...</div>
            </div>
          ) : (
            solution.title
          )}
        </h1>
        <p className="text-gray-400">{solution.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-[#232323] border-[#505050]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default" className="bg-emerald-500">Free</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 whitespace-pre-wrap">
              {solution.automation_suggestion || "Generating automation suggestion..."}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#232323] border-[#505050]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-purple-500">Premium</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm text-center">
                This could take up to 24 hours, comeback later or check your email for notification.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#232323] border-[#505050]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-blue-500">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm text-center">
                This could take up to 24 hours, comeback later or check your email for notification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Solution;