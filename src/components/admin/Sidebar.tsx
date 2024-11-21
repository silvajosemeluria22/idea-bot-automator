import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, ShoppingCart, LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { path: "/admin/dashboard/metrics", label: "Metrics", icon: BarChart3 },
    { path: "/admin/dashboard/solutions", label: "Solutions", icon: FileText },
    { path: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out bg-[#232323] border-r border-[#505050] h-full flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="self-end m-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-col h-full p-2">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-400 hover:text-white hover:bg-[#2A2A2A]",
              isCollapsed && "px-4"
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;