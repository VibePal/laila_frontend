import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Cake, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  Home,
  ShoppingCart,
  FileText,
  BarChart3,
  Package,
  Plus,
  Building2
} from "lucide-react";

// Import the new page components
import ProductManagement from "./admin/ProductManagement";
import CreateOrder from "./admin/CreateOrder";
import Orders from "./admin/Orders";
import Sales from "./admin/Sales";
import Expenses from "./admin/Expenses";
import OverheadCosts from "./admin/OverheadCosts";
import FinancialSummary from "./admin/FinancialSummary";
import StaffManagement from "./admin/StaffManagement";
import Settings from "./admin/Settings";


const AdminDashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("cake-management");

  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (!email || role !== "admin") {
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
    { icon: Package, label: "Product Management", href: "cake-management" },
    { icon: Plus, label: "Create Order", href: "create-order" },
    { icon: ShoppingCart, label: "Orders", href: "orders" },
    { icon: BarChart3, label: "Sales", href: "sales" },
    { icon: Package, label: "Supplies", href: "expenses" },
    { icon: Users, label: "Staff", href: "staff" },
    { icon: Building2, label: "Overhead Costs", href: "overhead-costs" },
    { icon: TrendingUp, label: "Financial Summary", href: "profit" },
    { icon: SettingsIcon, label: "Settings", href: "settings" },
  ];

    const renderContent = () => {
    console.log("renderContent called with activeSection:", activeSection);
    
    try {
      switch (activeSection) {
        case "cake-management":
          return <ProductManagement />;
        case "create-order":
          return <CreateOrder />;
        case "orders":
          return <Orders />;
        case "sales":
          return <Sales />;
        case "expenses":
          return <Expenses />;
        case "overhead-costs":
          return <OverheadCosts />;
        case "profit":
          return <FinancialSummary />;
        case "staff":
          return <StaffManagement />;
        case "settings":
          return <Settings />;
        default:
          return (
            <div>
              <h2 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Select an option from the sidebar to get started with managing Laila's Cakes.
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error("Error in renderContent:", error);
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6">Error</h2>
          <p className="text-muted-foreground">
            An error occurred while rendering the content.
          </p>
          <p className="text-sm text-red-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
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
            <h1 className="text-2xl font-playfair font-bold">Laila's Cakes - Admin Dashboard</h1>
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
                  onClick={() => {
                    console.log("Sidebar item clicked:", item.href);
                    setActiveSection(item.href);
                  }}
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

export default AdminDashboard;
