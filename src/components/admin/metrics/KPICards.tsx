import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPICardsProps {
  solutions: number;
  orders: number;
  revenue: number;
}

export const KPICards = ({ solutions, orders, revenue }: KPICardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-[#232323] border-[#505050]">
        <CardHeader>
          <CardTitle className="text-lg">Total Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{solutions}</p>
        </CardContent>
      </Card>
      <Card className="bg-[#232323] border-[#505050]">
        <CardHeader>
          <CardTitle className="text-lg">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{orders}</p>
        </CardContent>
      </Card>
      <Card className="bg-[#232323] border-[#505050]">
        <CardHeader>
          <CardTitle className="text-lg">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${revenue.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};