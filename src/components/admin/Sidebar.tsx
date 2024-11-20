import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, ShoppingCart, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { path: "/admin/dashboard/metrics", label: "Metrics", icon: BarChart3 },
    { path: "/admin/dashboard/solutions", label: "Solutions", icon: FileText },
    { path: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-64 bg-[#232323] border-r border-[#505050] p-4">
      <div className="flex flex-col h-full">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;