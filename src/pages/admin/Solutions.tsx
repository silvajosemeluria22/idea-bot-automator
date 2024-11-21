import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MessageSquare, CheckSquare, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

type FilterType = "all" | "need_reply" | "replied";

const Solutions = () => {
  const [filter, setFilter] = useState<FilterType>("need_reply");

  const { data: solutions, isLoading } = useQuery({
    queryKey: ["admin-solutions", filter],
    queryFn: async () => {
      const query = supabase
        .from("solutions")
        .select(`
          *,
          orders (
            stripe_payment_status,
            amount,
            currency,
            plan_type
          )
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query.eq("replied", filter === "replied");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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

  const getPlanType = (solution: any) => {
    if (!solution.orders || solution.orders.length === 0) return null;
    
    const paidOrders = solution.orders.filter((order: any) => order.stripe_payment_status === 'paid');
    if (paidOrders.length === 0) return null;

    // Get the latest paid order's plan type
    const latestOrder = paidOrders[paidOrders.length - 1];
    return latestOrder.plan_type;
  };

  const getPlanBadgeVariant = (planType: string | null) => {
    switch (planType?.toLowerCase()) {
      case 'premium':
        return 'secondary';
      case 'pro':
        return 'default';
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

  if (!solutions?.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Solutions</h1>
          <div className="flex space-x-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="flex items-center gap-2"
            >
              All Solutions
            </Button>
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
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle>No Solutions Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Solutions will appear here once they are submitted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Solutions</h1>
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="flex items-center gap-2"
          >
            All Solutions
          </Button>
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
              <TableHead>Plan Type</TableHead>
              <TableHead>Payment Status</TableHead>
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
                  {getPlanType(solution) ? (
                    <Badge variant={getPlanBadgeVariant(getPlanType(solution))}>
                      {getPlanType(solution)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No plan</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {solution.orders && solution.orders[0] ? (
                    <div className="space-y-1">
                      <Badge
                        variant={getStatusBadgeVariant(solution.orders[0].stripe_payment_status)}
                      >
                        {solution.orders[0].stripe_payment_status || 'pending'}
                      </Badge>
                      <div className="text-sm text-gray-400">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: solution.orders[0].currency.toUpperCase(),
                        }).format(solution.orders[0].amount)}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="outline">No payment</Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/admin/dashboard/solutions/${solution.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/solution/${solution.id}`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Client View
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
