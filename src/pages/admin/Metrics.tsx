import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { DateRangeSelector } from "@/components/admin/metrics/DateRangeSelector";
import { KPICards } from "@/components/admin/metrics/KPICards";
import { SearchResults } from "@/components/admin/metrics/SearchResults";

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
        solutions: (solutionsResult.data || []),
        orders: (ordersResult.data || []).map(order => ({
          ...order,
          solution: { title: order.solution?.[0]?.title || '' }
        }))
      };
    },
    enabled: debouncedSearch.length > 0
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Metrics</h1>

      <DateRangeSelector date={date} setDate={setDate} />
      
      <KPICards 
        solutions={kpiData?.solutions || 0}
        orders={kpiData?.orders || 0}
        revenue={kpiData?.revenue || 0}
      />

      <div className="space-y-4">
        <Input
          placeholder="Search solutions or orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-[#232323] border-[#505050] text-white"
        />

        {debouncedSearch && (searchResults?.solutions.length || searchResults?.orders.length) ? (
          <SearchResults 
            solutions={searchResults.solutions} 
            orders={searchResults.orders}
          />
        ) : debouncedSearch ? (
          <p className="text-muted-foreground">No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default Metrics;