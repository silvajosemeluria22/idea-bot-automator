import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { OrderRow } from "@/components/admin/OrderRow";
import { Order } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";

const Orders = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          solution:solutions(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const refreshTransactions = async () => {
    try {
      const response = await fetch('/functions/v1/refresh-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh transactions');
      }
      
      const result = await response.json();
      toast({
        title: "Transactions refreshed",
        description: `Updated ${result.updated} orders with latest transaction status.`,
      });
      
      // Refresh the orders list
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      toast({
        title: "Error refreshing transactions",
        description: error.message,
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <div className="flex gap-2">
          <Button
            onClick={refreshTransactions}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Transactions
          </Button>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh List
          </Button>
        </div>
      </div>
      
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