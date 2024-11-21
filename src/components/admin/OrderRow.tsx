import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";

interface OrderRowProps {
  order: Order;
}

export const OrderRow = ({ order }: OrderRowProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      // Update just this order in the cache
      queryClient.setQueryData(["admin-orders"], (oldData: Order[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(o => o.id === order.id ? { ...o, ...data } : o);
      });
      toast({
        title: "Payment status refreshed",
        description: "The order has been updated with the latest payment status.",
      });
    },
    onError: (error: Error) => {
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

  return (
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
  );
};