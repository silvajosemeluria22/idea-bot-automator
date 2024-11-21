import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { Order } from "@/types/order";

interface OrderRowProps {
  order: Order;
}

export const OrderRow = ({ order }: OrderRowProps) => {
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
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
      <TableCell className="space-y-1">
        <Badge
          variant={getStatusBadgeVariant(order.stripe_payment_status)}
        >
          {order.stripe_payment_status || 'pending'}
        </Badge>
        {order.stripe_payment_status === 'paid' && (
          <Badge variant={order.stripe_payment_captured ? 'default' : 'destructive'}>
            {order.stripe_payment_captured ? 'Captured' : 'Not Captured'}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {order.payment_intent_id && (
          <a
            href={`https://dashboard.stripe.com/test/payments/${order.payment_intent_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
            View in Stripe
          </a>
        )}
      </TableCell>
    </TableRow>
  );
};