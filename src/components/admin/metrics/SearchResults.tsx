import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Solution, Order } from "@/types/order";

interface SearchResultsProps {
  solutions: Solution[];
  orders: Order[];
}

export const SearchResults = ({ solutions, orders }: SearchResultsProps) => {
  return (
    <div className="space-y-6">
      {solutions.length > 0 && (
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
                {solutions.map((solution) => (
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

      {orders.length > 0 && (
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
                {orders.map((order) => (
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
  );
};