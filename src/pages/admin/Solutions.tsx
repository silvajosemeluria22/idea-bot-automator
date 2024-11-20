import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MessageSquare, CheckSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Solutions = () => {
  const [filter, setFilter] = useState<"need_reply" | "replied">("need_reply");

  const { data: solutions, isLoading } = useQuery({
    queryKey: ["admin-solutions", filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("replied", filter === "replied")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Solutions</h1>
        <div className="flex space-x-2">
          <Button
            variant={filter === "need_reply" ? "default" : "outline"}
            onClick={() => setFilter("need_reply")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Need Reply
          </Button>
          <Button
            variant={filter === "replied" ? "default" : "outline"}
            onClick={() => setFilter("replied")}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            Replied
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border border-[#505050]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#232323]">
              <TableHead>Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solutions?.map((solution) => (
              <TableRow key={solution.id} className="bg-[#232323]">
                <TableCell className="font-medium">{solution.title}</TableCell>
                <TableCell>{solution.email}</TableCell>
                <TableCell>
                  {new Date(solution.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/admin/dashboard/solutions/${solution.id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Solutions;