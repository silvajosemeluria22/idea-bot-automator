import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Solutions = () => {
  const { data: solutions, isLoading } = useQuery({
    queryKey: ["admin-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Solutions</h1>
      <div className="rounded-md border border-[#505050]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#232323]">
              <TableHead>Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Solutions;