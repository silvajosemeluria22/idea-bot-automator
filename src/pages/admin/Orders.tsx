import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Orders = () => {
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
};

export default Orders;