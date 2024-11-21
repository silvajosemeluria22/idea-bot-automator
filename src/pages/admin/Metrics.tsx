import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";

const Metrics = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Fetch KPI data
  const { data: kpiData } = useQuery({
    queryKey: ['kpi-data'],
    queryFn: async () => {
      // Get solutions count
      const { count: solutionsCount } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true });

      // Get orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get revenue from paid orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('amount')
        .eq('stripe_payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      return {
        solutions: solutionsCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue
      };
    }
  });

  // Search functionality
  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { solutions: [], orders: [] };

      const [solutions, orders] = await Promise.all([
        supabase
          .from('solutions')
          .select('*')
          .or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
          .limit(5),
        supabase
          .from('orders')
          .select('*, solution:solutions(title)')
          .or(`customer_email.ilike.%${debouncedSearch}%,solution_id.eq.${debouncedSearch}`)
          .limit(5)
      ]);

      return {
        solutions: solutions.data || [],
        orders: orders.data || []
      };
    },
    enabled: debouncedSearch.length > 0
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Metrics</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Total Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpiData?.solutions || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpiData?.orders || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${kpiData?.revenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search solutions or orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-[#232323] border-[#505050] text-white"
        />

        {debouncedSearch && (searchResults?.solutions.length || searchResults?.orders.length) ? (
          <div className="space-y-6">
            {searchResults?.solutions.length > 0 && (
              <Card className="bg-[#232323] border-[#505050]">
                <CardHeader>
                  <CardTitle>Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.solutions.map((solution) => (
                        <TableRow key={solution.id}>
                          <TableCell>{solution.title}</TableCell>
                          <TableCell>{solution.description}</TableCell>
                          <TableCell>{solution.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {searchResults?.orders.length > 0 && (
              <Card className="bg-[#232323] border-[#505050]">
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solution</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.solution?.title}</TableCell>
                          <TableCell>{order.customer_email}</TableCell>
                          <TableCell>${order.amount.toLocaleString()}</TableCell>
                          <TableCell>{order.stripe_payment_status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : debouncedSearch ? (
          <p className="text-muted-foreground">No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default Metrics;