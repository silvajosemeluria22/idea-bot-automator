import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Metrics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Metrics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Total Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="bg-[#232323] border-[#505050]">
          <CardHeader>
            <CardTitle className="text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Metrics;