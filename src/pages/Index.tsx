import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !problem) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate title using OpenAI
      const { data: titleData, error: titleError } = await supabase.functions.invoke('generate-title', {
        body: { description: problem }
      });

      if (titleError) throw titleError;

      // Create solution in database
      const { error: insertError } = await supabase
        .from('solutions')
        .insert([
          {
            title: titleData.title,
            description: problem,
            email: email,
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Your solution request has been submitted successfully!",
      });

      // Clear form
      setEmail("");
      setProblem("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            AI Business Automation
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary animate-glow">
            Automate Everything
          </h2>
        </div>

        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          To submit your idea, problem, or challenge for AI-powered business automation, start by
          providing a clear summary, including relevant data types and sources, the current
          manual process, and any software tools in use. Detail the desired outcome and success
          metrics, noting any specific constraints or requirements.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-4">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Type here..."
              className="w-full h-48 px-4 py-3 bg-white/10 rounded-lg border border-gray-700 
                       text-white placeholder-gray-400 focus:outline-none focus:border-primary 
                       focus:ring-1 focus:ring-primary textarea-glow transition-all duration-300"
            />
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-gray-700 
                       text-white placeholder-gray-400 focus:outline-none focus:border-primary 
                       focus:ring-1 focus:ring-primary transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold
                     hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all 
                     duration-300 focus:outline-none focus:ring-2 focus:ring-primary 
                     focus:ring-offset-2 focus:ring-offset-[#1A1F2C] disabled:opacity-50
                     disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Solution..." : "Generate Solution"}
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-4">
          By clicking "Generate Solution", you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Index;