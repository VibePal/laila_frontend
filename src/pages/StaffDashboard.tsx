import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  LogOut,
  Menu,
  Plus,
  ShoppingCart,
  Filter,
  RefreshCw,
  User,
  Package,
  DollarSign,
  MessageSquare,
  Edit,
  Trash2,
  Save,
  X,
  Lock
} from "lucide-react";
import { getAllOrdersFromAPI, Order, ApiResponse, getProductsFromAPI, getPackagingTypesFromAPI, verifyPassword, updateOrderAPI, UpdateOrderRequest, getStaffFromAPI, StaffApiResponse } from "@/lib/dataService";

// Import admin CreateOrder component
import CreateOrder from "./admin/CreateOrder";




const StaffDashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("create-order");
  
  // Track user activity for session management
  useActivityTracker();
  


  // Orders state - loaded from data service
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffApiResponse[]>([]);
  const [staffMap, setStaffMap] = useState<Map<string, string>>(new Map());

  // Orders filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  
  // Edit states
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [validatedUsername, setValidatedUsername] = useState("");
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  
  // Edit modal state for products and packages
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageQuantity, setPackageQuantity] = useState("");
  
  // Debounce timer for password validation
  const [passwordValidationTimer, setPasswordValidationTimer] = useState<NodeJS.Timeout | null>(null);
  

  
  const navigate = useNavigate();

  // Load staff members
  const loadStaffMembers = async () => {
    try {
      const response = await getStaffFromAPI();
      if (response.success && Array.isArray(response.data)) {
        setStaffMembers(response.data);
        
        // Create a map from user ID to username
        const map = new Map<string, string>();
        response.data.forEach(staff => {
          map.set(staff.id, staff.username);
        });
        setStaffMap(map);
      }
    } catch (error) {
      console.error('Error loading staff members:', error);
    }
  };

  // Load data from API
  const loadData = async () => {
    try {
      const response: ApiResponse<Order[]> = await getAllOrdersFromAPI();
      if (response.success && response.data) {
        console.log('StaffDashboard: Loading data from API', { orders: response.data.length });
        
        // Debug: Check if any orders have editedBy field
        const editedOrders = response.data.filter(order => order.editedBy);
        console.log('📝 StaffDashboard: Orders with editedBy field:', {
          count: editedOrders.length,
          orders: editedOrders.map(o => ({ id: o.id, editedBy: o.editedBy, updatedAt: o.updatedAt }))
        });
        
        // Debug: Show all orders and their editedBy status
        console.log('🔍 StaffDashboard: All orders editedBy status:', response.data.map(o => ({
          id: o.id,
          hasEditedBy: !!o.editedBy,
          editedBy: o.editedBy,
          updatedAt: o.updatedAt
        })));
        
        setOrders(response.data);
      } else {
        console.error('Failed to load orders:', response.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setOrders([]);
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
    
    // Load data from API
    loadStaffMembers();
    loadData();
  }, [navigate]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if not currently editing an order
      if (!editingOrderId) {
        loadData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [editingOrderId]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const sidebarItems = [
    { icon: Plus, label: "Create Order", href: "create-order" },
    { icon: ShoppingCart, label: "Orders", href: "orders" },
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

  // Get creator display name
  const getCreatorDisplayName = (createdBy: string) => {
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUsername = localStorage.getItem('username');
    
    // If the createdBy matches current user's email or username, show the username
    if (createdBy === currentUserEmail || createdBy === currentUsername) {
      return currentUsername || currentUserEmail || 'You';
    }
    
    // If createdBy is a number (user ID), try to get username from staff map
    if (/^\d+$/.test(createdBy)) {
      const username = staffMap.get(createdBy);
      return username || currentUsername || currentUserEmail || 'You';
    }
    
    // If it's an email, extract username part
    if (createdBy.includes('@')) {
      const username = createdBy.split('@')[0];
      return username || createdBy;
    }
    
    // Return the createdBy value as is (should be a username)
    return createdBy || 'Unknown';
  };

  // Determine if an order is custom or standard
  const isCustomOrder = (order: Order): boolean => {
    // First check if orderType is explicitly set from backend
    if (order.orderType) {
      return order.orderType === 'custom';
    }
    // Fallback: Check if order has custom order specific fields
    return !!(order.additionalPrice || order.colour || order.inscription || order.totalCost);
  };

  // Get order type badge
  const getOrderTypeBadge = (order: Order) => {
    const isCustom = isCustomOrder(order);
    return (
      <Badge 
        variant={isCustom ? "default" : "secondary"} 
        className={isCustom ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-green-100 text-green-800 border-green-200"}
      >
        {isCustom ? "Custom Order" : "Standard Order"}
      </Badge>
    );
  };

  // Edit order handlers
  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setEditingOrder({ ...order });
    setShowEditModal(true);
    loadProductsAndPackages(); // Load products and packages when opening edit modal
  };

  // Debounced password validation
  const debouncedValidatePassword = (passwordValue: string) => {
    // Clear existing timer
    if (passwordValidationTimer) {
      clearTimeout(passwordValidationTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      if (!passwordValue.trim()) {
        setPasswordError("");
        setValidatedUsername("");
        return;
      }

      setIsValidatingPassword(true);
      setPasswordError("");

      try {
        // Call real API to verify password
        const response = await verifyPassword(passwordValue);
        
        if (response.success && response.data) {
          setValidatedUsername(response.data.username);
          setPasswordError("");
        } else {
          setValidatedUsername("");
          setPasswordError(response.error || "Invalid password. Please check and try again.");
        }
      } catch (error) {
        console.error('Error validating password:', error);
        setPasswordError("Error validating password. Please try again.");
        setValidatedUsername("");
      } finally {
        setIsValidatingPassword(false);
      }
    }, 500);

    setPasswordValidationTimer(timer);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    
    // Check if password is validated
    if (!validatedUsername) {
      setPasswordError("Please enter a valid password to save changes.");
      return;
    }

    try {
      // Prepare order data for API
      const orderData: UpdateOrderRequest = {
        customerName: editingOrder.customerName,
        customerContact: editingOrder.customerContact,
        deliveryType: editingOrder.deliveryType,
        hostel: editingOrder.hostel,
        paymentType: editingOrder.paymentType,
        deliveryFee: editingOrder.deliveryFee,
        specialNotes: editingOrder.specialNotes,
        items: editingOrder.items,
        total: editingOrder.total,
        additionalPrice: editingOrder.additionalPrice,
        colour: editingOrder.colour,
        inscription: editingOrder.inscription,
        totalCost: editingOrder.totalCost,
        editedBy: validatedUsername
      };

      // Call API to update order
      const response = await updateOrderAPI(editingOrder.id, orderData);
      
      console.log('🔄 StaffDashboard: Order update API response:', {
        success: response.success,
        data: response.data,
        error: response.error,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (response.success && response.data) {
        // Update the order in the local state with API response
        const updatedOrder = {
          ...editingOrder,
          editedBy: response.data.editedBy,
          updatedAt: response.data.updatedAt,
          total: response.data.total
        };
        
        console.log('✅ StaffDashboard: Updated order with editedBy:', {
          orderId: updatedOrder.id,
          editedBy: updatedOrder.editedBy,
          updatedAt: updatedOrder.updatedAt,
          timestamp: new Date().toLocaleTimeString()
        });
        
        setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        
        // Close modal and reset state
        setShowEditModal(false);
        setEditingOrderId(null);
        setEditingOrder(null);
        setPassword("");
        setPasswordError("");
        setValidatedUsername("");
        
        alert('Order updated successfully!');
      } else {
        alert(`Error updating order: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order. Please try again.');
    }
  };


  const handleCancelEdit = () => {
    // Clear password validation timer
    if (passwordValidationTimer) {
      clearTimeout(passwordValidationTimer);
      setPasswordValidationTimer(null);
    }
    
    setShowEditModal(false);
    setEditingOrderId(null);
    setEditingOrder(null);
    setPassword("");
    setPasswordError("");
    setValidatedUsername("");
    // Reset product and package selection states
    setSelectedProduct("");
    setProductQuantity("");
    setSelectedPackage("");
    setPackageQuantity("");
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setOrders(orders.filter(o => o.id !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
      }
    }
  };

  const recalculateOrderTotal = (order: Order): number => {
    const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    return subtotal + order.deliveryFee;
  };

  // Load products and packages for edit modal
  const loadProductsAndPackages = async () => {
    try {
      const [productsResponse, packagesResponse] = await Promise.all([
        getProductsFromAPI(),
        getPackagingTypesFromAPI()
      ]);

      if (productsResponse.success && productsResponse.data) {
        setAvailableProducts(productsResponse.data);
      }

      if (packagesResponse.success && packagesResponse.data) {
        setAvailablePackages(packagesResponse.data);
      }
    } catch (error) {
      console.error('Error loading products and packages:', error);
    }
  };

  // Add product to editing order
  const addProductToOrder = () => {
    if (!selectedProduct || !productQuantity || !editingOrder) return;

    const product = availableProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const quantity = parseInt(productQuantity);
    if (quantity <= 0) return;

    const existingItemIndex = editingOrder.items.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...editingOrder.items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setEditingOrder({...editingOrder, items: updatedItems});
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.unitPrice,
        subtotal: quantity * product.unitPrice
      };
      setEditingOrder({...editingOrder, items: [...editingOrder.items, newItem]});
    }

    // Reset form
    setSelectedProduct("");
    setProductQuantity("");
  };

  // Remove product from editing order
  const removeProductFromOrder = (productId: string) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      items: editingOrder.items.filter(item => item.productId !== productId)
    });
  };

  // Add package to editing order
  const addPackageToOrder = () => {
    if (!selectedPackage || !packageQuantity || !editingOrder) return;

    const packageItem = availablePackages.find(p => p.id === selectedPackage);
    if (!packageItem) return;

    const quantity = parseInt(packageQuantity);
    if (quantity <= 0) return;

    const newPackage = {
      productId: packageItem.id,
      productName: packageItem.name,
      quantity: quantity,
      unitPrice: packageItem.price,
      subtotal: quantity * packageItem.price
    };

    setEditingOrder({
      ...editingOrder,
      items: [...editingOrder.items, newPackage]
    });

    // Reset form
    setSelectedPackage("");
    setPackageQuantity("");
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
                    <p className="text-xs text-muted-foreground">
                      Created by: {getCreatorDisplayName(order.createdBy)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Edited by: {order.editedBy ? getCreatorDisplayName(order.editedBy) : 'Not edited'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getOrderTypeBadge(order)}
                  <Badge variant={order.deliveryType === 'pickup' ? 'outline' : 'default'}>
                    {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </Badge>
                  <Badge variant={order.paymentType === 'cash' ? 'secondary' : 'destructive'}>
                    {getPaymentTypeDisplayText(order.paymentType)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button onClick={() => handleEditOrder(order)} size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button onClick={() => handleDeleteOrder(order.id)} size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        // Handle different possible item structures from backend
                        const productName = item.productName || item.product_name || item.name || 'Unknown Product';
                        const quantity = item.quantity || 1;
                        const subtotal = item.subtotal || item.total || (item.unitPrice || item.unit_price || 0) * quantity;
                        
                        return (
                      <div key={index} className="flex justify-between text-sm">
                            <span className="truncate">{productName} × {quantity}</span>
                            <span className="font-medium">₵{subtotal.toFixed(2)}</span>
                      </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No items found</p>
                    )}
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
                      <span>₵{(order.total - order.deliveryFee).toFixed(2)}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>₵{order.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {isCustomOrder(order) && order.additionalPrice && order.additionalPrice > 0 && (
                      <div className="flex justify-between">
                        <span>Additional Price:</span>
                        <span>₵{order.additionalPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {isCustomOrder(order) && order.totalCost && order.totalCost > 0 && (
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span>₵{order.totalCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>Total:</span>
                      <span className="text-primary">₵{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes and Custom Order Details */}
              {(order.specialNotes || isCustomOrder(order)) && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Special Notes</p>
                      <p className="text-sm text-muted-foreground">{order.specialNotes}</p>
                      
                      {/* Custom Order Details */}
                      {isCustomOrder(order) && (
                        <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                          <p className="font-medium text-sm mb-2 text-purple-700">Custom Order Details</p>
                          <div className="space-y-1 text-sm">
                            {order.colour && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Colour:</span>
                                <span className="font-medium">{order.colour}</span>
                    </div>
                            )}
                            {order.inscription && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Inscription:</span>
                                <span className="font-medium italic">"{order.inscription}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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

      {/* Edit Order Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order #{editingOrder?.id}</DialogTitle>
            <DialogDescription>
              {editingOrder && isCustomOrder(editingOrder) ? 'Edit Custom Order' : 'Edit Standard Order'}
            </DialogDescription>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-6">
              <Tabs defaultValue={isCustomOrder(editingOrder) ? "custom" : "standard"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="standard">Standard Order</TabsTrigger>
                  <TabsTrigger value="custom">Custom Order</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-customer-name">Customer Name</Label>
                      <Input
                        id="edit-customer-name"
                        value={editingOrder.customerName}
                        onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-customer-contact">Customer Contact</Label>
                      <Input
                        id="edit-customer-contact"
                        value={editingOrder.customerContact}
                        onChange={(e) => setEditingOrder({...editingOrder, customerContact: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Delivery Type</Label>
                      <Select 
                        value={editingOrder.deliveryType} 
                        onValueChange={(value: 'pickup' | 'delivery') => setEditingOrder({...editingOrder, deliveryType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <Select 
                        value={editingOrder.paymentType} 
                        onValueChange={(value: 'momo' | 'cash') => setEditingOrder({...editingOrder, paymentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="momo">MoMo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {editingOrder.deliveryType === 'delivery' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-hostel">Hostel</Label>
                      <Input
                        id="edit-hostel"
                        value={editingOrder.hostel || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, hostel: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-delivery-fee">Delivery Fee (₵)</Label>
                    <Input
                      id="edit-delivery-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingOrder.deliveryFee}
                      onChange={(e) => {
                        const newDeliveryFee = parseFloat(e.target.value) || 0;
                        const newTotal = recalculateOrderTotal({...editingOrder, deliveryFee: newDeliveryFee});
                        setEditingOrder({...editingOrder, deliveryFee: newDeliveryFee, total: newTotal});
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-special-notes">Special Notes</Label>
                    <Textarea
                      id="edit-special-notes"
                      value={editingOrder.specialNotes}
                      onChange={(e) => setEditingOrder({...editingOrder, specialNotes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Products</h3>
                    </div>
                    
                    {/* Add Product Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="edit-select-product">Select Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₵{product.unitPrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-product-quantity">Quantity</Label>
                        <Input
                          id="edit-product-quantity"
                          type="number"
                          min="1"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button onClick={addProductToOrder} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    </div>

                    {/* Current Products List */}
                    <div className="space-y-2">
                      <Label>Current Products ({editingOrder.items.length})</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {editingOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₵{item.unitPrice} = ₵{item.subtotal}
                              </p>
                            </div>
                            <Button
                              onClick={() => removeProductFromOrder(item.productId)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {editingOrder.items.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No products added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Packages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Packages</h3>
                    </div>
                    
                    {/* Add Package Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="edit-select-package">Select Package</Label>
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages.map((packageItem) => (
                              <SelectItem key={packageItem.id} value={packageItem.id}>
                                {packageItem.name} - ₵{packageItem.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-package-quantity">Quantity</Label>
                        <Input
                          id="edit-package-quantity"
                          type="number"
                          min="1"
                          value={packageQuantity}
                          onChange={(e) => setPackageQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button onClick={addPackageToOrder} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Password Verification Section */}
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <Label htmlFor="edit-password">Staff Password Verification</Label>
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="edit-password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          debouncedValidatePassword(e.target.value);
                        }}
                        placeholder="Enter your password to verify changes"
                        className={passwordError ? "border-red-500" : validatedUsername ? "border-green-500" : ""}
                      />
                      {isValidatingPassword && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Validating password...
                        </div>
                      )}
                      {validatedUsername && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Verified as: <span className="font-medium">{validatedUsername}</span>
                        </div>
                      )}
                      {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-custom-customer-name">Customer Name</Label>
                      <Input
                        id="edit-custom-customer-name"
                        value={editingOrder.customerName}
                        onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-custom-customer-contact">Customer Contact</Label>
                      <Input
                        id="edit-custom-customer-contact"
                        value={editingOrder.customerContact}
                        onChange={(e) => setEditingOrder({...editingOrder, customerContact: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Delivery Type</Label>
                      <Select 
                        value={editingOrder.deliveryType} 
                        onValueChange={(value: 'pickup' | 'delivery') => setEditingOrder({...editingOrder, deliveryType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <Select 
                        value={editingOrder.paymentType} 
                        onValueChange={(value: 'momo' | 'cash') => setEditingOrder({...editingOrder, paymentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="momo">MoMo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {editingOrder.deliveryType === 'delivery' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-custom-hostel">Hostel</Label>
                      <Input
                        id="edit-custom-hostel"
                        value={editingOrder.hostel || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, hostel: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-custom-delivery-fee">Delivery Fee (₵)</Label>
                      <Input
                        id="edit-custom-delivery-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingOrder.deliveryFee}
                        onChange={(e) => {
                          const newDeliveryFee = parseFloat(e.target.value) || 0;
                          const newTotal = recalculateOrderTotal({...editingOrder, deliveryFee: newDeliveryFee});
                          setEditingOrder({...editingOrder, deliveryFee: newDeliveryFee, total: newTotal});
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-additional-price">Additional Price (₵)</Label>
                      <Input
                        id="edit-additional-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingOrder.additionalPrice || 0}
                        onChange={(e) => setEditingOrder({...editingOrder, additionalPrice: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-colour">Colour</Label>
                      <Input
                        id="edit-colour"
                        value={editingOrder.colour || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, colour: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-total-cost">Total Cost (₵)</Label>
                      <Input
                        id="edit-total-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingOrder.totalCost || 0}
                        onChange={(e) => setEditingOrder({...editingOrder, totalCost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-inscription">Inscription</Label>
                    <Textarea
                      id="edit-inscription"
                      value={editingOrder.inscription || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, inscription: e.target.value})}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-custom-special-notes">Special Notes</Label>
                    <Textarea
                      id="edit-custom-special-notes"
                      value={editingOrder.specialNotes}
                      onChange={(e) => setEditingOrder({...editingOrder, specialNotes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Products</h3>
                    </div>
                    
                    {/* Add Product Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="edit-custom-select-product">Select Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₵{product.unitPrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-custom-product-quantity">Quantity</Label>
                        <Input
                          id="edit-custom-product-quantity"
                          type="number"
                          min="1"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button onClick={addProductToOrder} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    </div>

                    {/* Current Products List */}
                    <div className="space-y-2">
                      <Label>Current Products ({editingOrder.items.length})</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {editingOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₵{item.unitPrice} = ₵{item.subtotal}
                              </p>
                            </div>
                            <Button
                              onClick={() => removeProductFromOrder(item.productId)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {editingOrder.items.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No products added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Packages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Packages</h3>
                    </div>
                    
                    {/* Add Package Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="edit-custom-select-package">Select Package</Label>
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages.map((packageItem) => (
                              <SelectItem key={packageItem.id} value={packageItem.id}>
                                {packageItem.name} - ₵{packageItem.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-custom-package-quantity">Quantity</Label>
                        <Input
                          id="edit-custom-package-quantity"
                          type="number"
                          min="1"
                          value={packageQuantity}
                          onChange={(e) => setPackageQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button onClick={addPackageToOrder} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Password Verification Section */}
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <Label htmlFor="edit-custom-password">Staff Password Verification</Label>
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="edit-custom-password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          debouncedValidatePassword(e.target.value);
                        }}
                        placeholder="Enter your password to verify changes"
                        className={passwordError ? "border-red-500" : validatedUsername ? "border-green-500" : ""}
                      />
                      {isValidatingPassword && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Validating password...
                        </div>
                      )}
                      {validatedUsername && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Verified as: <span className="font-medium">{validatedUsername}</span>
                        </div>
                      )}
                      {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!validatedUsername || isValidatingPassword}
            >
              {isValidatingPassword ? "Validating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StaffDashboard;