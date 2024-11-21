import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Solution, Order } from "@/types/order";

const Metrics = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const debouncedSearch = useDebounce(search, 300);

  const { data: kpiData } = useQuery({
    queryKey: ['kpi-data', date],
    queryFn: async () => {
      let solutionsQuery = supabase.from('solutions').select('*', { count: 'exact', head: true });
      let ordersQuery = supabase.from('orders').select('*', { count: 'exact', head: true });
      let revenueQuery = supabase.from('orders').select('amount').eq('stripe_payment_status', 'paid');

      // Apply date filters if set
      if (date?.from) {
        solutionsQuery = solutionsQuery.gte('created_at', date.from.toISOString());
        ordersQuery = ordersQuery.gte('created_at', date.from.toISOString());
        revenueQuery = revenueQuery.gte('created_at', date.from.toISOString());
      }
      if (date?.to) {
        const endDate = new Date(date.to);
        endDate.setHours(23, 59, 59, 999);
        solutionsQuery = solutionsQuery.lte('created_at', endDate.toISOString());
        ordersQuery = ordersQuery.lte('created_at', endDate.toISOString());
        revenueQuery = revenueQuery.lte('created_at', endDate.toISOString());
      }

      const [{ count: solutionsCount }, { count: ordersCount }, { data: revenueData }] = await Promise.all([
        solutionsQuery,
        ordersQuery,
        revenueQuery
      ]);

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      return {
        solutions: solutionsCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue
      };
    }
  });

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedSearch, date],
    queryFn: async () => {
      if (!debouncedSearch) return { solutions: [], orders: [] };

      let solutionsQuery = supabase
        .from('solutions')
        .select('*')
        .or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
        .limit(5);

      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          solution:solutions(title)
        `)
        .or(`customer_email.ilike.%${debouncedSearch}%,solution_id.eq.${debouncedSearch}`)
        .limit(5);

      // Apply date filters if set
      if (date?.from) {
        solutionsQuery = solutionsQuery.gte('created_at', date.from.toISOString());
        ordersQuery = ordersQuery.gte('created_at', date.from.toISOString());
      }
      if (date?.to) {
        const endDate = new Date(date.to);
        endDate.setHours(23, 59, 59, 999);
        solutionsQuery = solutionsQuery.lte('created_at', endDate.toISOString());
        ordersQuery = ordersQuery.lte('created_at', endDate.toISOString());
      }

      const [solutionsResult, ordersResult] = await Promise.all([solutionsQuery, ordersQuery]);

      return {
        solutions: (solutionsResult.data || []) as Solution[],
        orders: (ordersResult.data || []).map(order => ({
          ...order,
          solution: { title: order.solution?.[0]?.title || '' }
        })) as Order[]
      };
    },
    enabled: debouncedSearch.length > 0
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Metrics</h1>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal bg-[#232323] border-[#505050]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
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