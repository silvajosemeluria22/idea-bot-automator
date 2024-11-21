import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderRow } from "@/components/admin/OrderRow";
import { Order } from "@/types/order";

const Orders = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          solution:solutions!inner(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Orders will appear here once they are placed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Orders</h1>
      
      <div className="rounded-md border border-[#505050]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#232323]">
              <TableHead>Date</TableHead>
              <TableHead>Solution</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;