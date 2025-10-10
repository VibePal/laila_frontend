import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Button } from "@/components/ui/button";
import { 
  LogOut,
  Menu,
  Plus,
  ShoppingCart
} from "lucide-react";

// Import admin components
import CreateOrder from "./admin/CreateOrder";
import Orders from "./admin/Orders";




const StaffDashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("create-order");
  
  // Track user activity for session management
  useActivityTracker();
  


  

  
  const navigate = useNavigate();



  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (!email || role !== "staff") {
      navigate("/login");
      return;
    }
    
    setUserEmail(email);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const sidebarItems = [
    { icon: Plus, label: "Create Order", href: "create-order" },
    { icon: ShoppingCart, label: "Orders", href: "orders" },
  ];




  const renderCreateOrder = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <CreateOrder />
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <Orders filterByCurrentUser={true} />
  );

  const renderContent = () => {
    switch (activeSection) {
      case "create-order":
        return renderCreateOrder();
      case "orders":
        return renderOrders();
      default:
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Welcome to Staff Dashboard</h2>
            <p className="text-muted-foreground">
              Select an option from the sidebar to get started.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-playfair font-bold">Laila's Cakes - Staff Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 bg-card border-r transition-transform duration-300 ease-in-out flex-shrink-0`}>
          <div className="p-6 h-full overflow-y-auto">
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  variant={activeSection === item.href ? "default" : "ghost"}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setActiveSection(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-6 h-full">
            <div className="max-w-6xl mx-auto h-full">
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

    </div>
  );
};

export default StaffDashboard;
