import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LogOut,
  Menu,
  Plus,
  ShoppingCart,
  FileText,
  Filter,
  RefreshCw,
  User,
  Package,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { getOrders, Order } from "@/lib/dataService";

// Import admin CreateOrder component
import CreateOrder from "./admin/CreateOrder";

// Get current user from localStorage or session
const getCurrentUser = (): string => {
  // This would typically come from your authentication system
  // For now, we'll use a simple approach
  const currentUser = localStorage.getItem('currentUser') || 'staff';
  return currentUser;
};



const StaffDashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("create-order");
  


  // Orders state - loaded from data service
  const [orders, setOrders] = useState<Order[]>([]);

  // Orders filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  

  
  const navigate = useNavigate();

  // Load data from data service
  const loadData = () => {
    try {
      const ordersData = getOrders();
      console.log('StaffDashboard: Loading data', { orders: ordersData.length });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    }
  };

  const clearOrders = () => {
    try {
      localStorage.removeItem('laila_orders');
      setOrders([]);
      console.log('StaffDashboard: All orders cleared');
    } catch (error) {
      console.error('Error clearing orders:', error);
      alert('Error clearing orders. Please try again.');
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (!email || role !== "staff") {
      navigate("/login");
      return;
    }
    
    setUserEmail(email);
    
    // Load data from data service
    loadData();
  }, [navigate]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const sidebarItems = [
    { icon: Plus, label: "Create Order", href: "create-order" },
    { icon: ShoppingCart, label: "Orders", href: "orders" },
    { icon: FileText, label: "Manage Order", href: "manage-order" },
  ];



  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    const matchesDate = dateFilter === "all" || order.orderDate === dateFilter;
    const matchesDeliveryType = deliveryTypeFilter === "all" || order.deliveryType === deliveryTypeFilter;
    const matchesPaymentType = paymentTypeFilter === "all" || order.paymentType === paymentTypeFilter;
    
    return matchesDate && matchesDeliveryType && matchesPaymentType;
  });

  // Get unique values for filter options
  const uniqueDates = [...new Set(orders.map(order => order.orderDate))].sort();

  // Get payment type display text
  const getPaymentTypeDisplayText = (paymentType: string) => {
    switch (paymentType) {
      case 'cash': return 'Cash';
      case 'momo': return 'MoMo';
      default: return paymentType;
    }
  };





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
    <div className="h-full flex flex-col">
      {/* Static Filter Section */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter" className="text-xs">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter === "all" ? "" : dateFilter}
                onChange={(e) => setDateFilter(e.target.value || "all")}
                className="w-32"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="delivery-filter" className="text-xs">Type</Label>
              <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="payment-filter" className="text-xs">Payment</Label>
              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="momo">MoMo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={clearOrders}
            >
              Clear Orders
            </Button>
          </div>
          
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Scrollable Orders List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-lg text-primary">#{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()} at {order.orderTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.deliveryType === 'pickup' ? 'outline' : 'default'}>
                    {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </Badge>
                  <Badge variant={order.paymentType === 'cash' ? 'secondary' : 'destructive'}>
                    {getPaymentTypeDisplayText(order.paymentType)}
                  </Badge>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">Customer</h4>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.customerContact}</p>
                    {order.deliveryType === 'delivery' && order.hostel && (
                      <p className="text-muted-foreground">📍 {order.hostel}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">Items ({order.items.length})</h4>
                  </div>
                  <div className="pl-6 space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">{item.productName} × {item.quantity}</span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">Summary</h4>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${(order.total - order.deliveryFee).toFixed(2)}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>${order.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>Total:</span>
                      <span className="text-primary">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              {order.specialNotes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Special Notes</p>
                      <p className="text-sm text-muted-foreground">{order.specialNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {orders.length === 0 
                    ? "No orders have been created yet. Create your first order to get started."
                    : "No orders found matching the selected filters."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );

  const renderManageOrder = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Manage Order</h2>
        <p className="text-muted-foreground">View and update existing orders</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View, edit, and update order status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Order management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "create-order":
        return renderCreateOrder();
      case "orders":
        return renderOrders();
      case "manage-order":
        return renderManageOrder();
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

