import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Order = {
  id: string;
  solution_id: string;
  stripe_session_id: string | null;
  stripe_payment_status: string | null;
  amount: number;
  currency: string;
  customer_email: string;
  created_at: string;
  solution: {
    title: string;
  };
};

const Orders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const refreshPaymentStatus = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch('/functions/v1/refresh-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh payment status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Payment status refreshed",
        description: "The order has been updated with the latest payment status.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error refreshing payment status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'succeeded':
      case 'completed':
        return 'default';
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'secondary';
      case 'expired':
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
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
              <TableRow key={order.id} className="bg-[#232323]">
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.solution?.title}</TableCell>
                <TableCell>{order.customer_email}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: order.currency.toUpperCase(),
                  }).format(order.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(order.stripe_payment_status)}
                  >
                    {order.stripe_payment_status || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  {order.stripe_session_id && (
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${order.stripe_session_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View in Stripe
                    </a>
                  )}
                  <Button
                    onClick={() => refreshPaymentStatus.mutate(order.id)}
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    disabled={refreshPaymentStatus.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshPaymentStatus.isPending ? 'animate-spin' : ''}`} />
                    Refresh
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

export default Orders;