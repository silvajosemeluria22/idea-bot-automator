import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/admin/Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#1C1C1C]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;