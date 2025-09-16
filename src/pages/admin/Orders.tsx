import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { 
  ShoppingCart, 
  RefreshCw,
  Trash2,
  User,
  Package,
  DollarSign,
  MessageSquare,
  Edit,
  Save,
  X,
  Plus,
  Lock
} from "lucide-react";
import { getOrders, updateOrder, deleteOrder, getAllOrdersFromAPI, Order, getStaffFromAPI, StaffApiResponse, getProductsFromAPI, getPackagingTypesFromAPI, updateOrderAPI, UpdateOrderRequest, verifyPassword } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffApiResponse[]>([]);
  const [staffMap, setStaffMap] = useState<Map<string, string>>(new Map());
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageQuantity, setPackageQuantity] = useState("");
  
  // Password validation states (like staff dashboard)
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [validatedUsername, setValidatedUsername] = useState("");
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  const [passwordValidationTimer, setPasswordValidationTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Load products and packages for edit modal
  const loadEditModalData = async () => {
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
      console.error('Error loading edit modal data:', error);
    }
  };

  // Password validation function (like staff dashboard)
  const debouncedValidatePassword = (passwordValue: string) => {
    // Clear existing timer
    if (passwordValidationTimer) {
      clearTimeout(passwordValidationTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      if (passwordValue.trim()) {
        setIsValidatingPassword(true);
        setPasswordError("");
        
        try {
          const response = await verifyPassword(passwordValue);
          if (response.success && response.data) {
            setValidatedUsername(response.data.username);
            setPasswordError("");
          } else {
            setValidatedUsername("");
            setPasswordError(response.error || "Invalid password");
          }
        } catch (error) {
          setValidatedUsername("");
          setPasswordError("Error validating password");
        } finally {
          setIsValidatingPassword(false);
        }
      } else {
        setValidatedUsername("");
        setPasswordError("");
      }
    }, 500);

    setPasswordValidationTimer(timer);
  };

  // Load data
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrdersFromAPI();
      if (response.success && Array.isArray(response.data)) {
        console.log('Orders: Loading orders from API', { count: response.data.length });
        
        // Debug: Check createdBy and editedBy fields
        const ordersWithCreatedBy = response.data.filter(order => order.createdBy);
        const ordersWithEditedBy = response.data.filter(order => order.editedBy);
        console.log('Orders: CreatedBy field analysis:', {
          total: response.data.length,
          withCreatedBy: ordersWithCreatedBy.length,
          createdByValues: ordersWithCreatedBy.map(o => ({ id: o.id, createdBy: o.createdBy })),
          withEditedBy: ordersWithEditedBy.length,
          editedByValues: ordersWithEditedBy.map(o => ({ id: o.id, editedBy: o.editedBy }))
        });
        
        // Log order type breakdown
        const standardOrders = response.data.filter(order => !isCustomOrder(order)).length;
        const customOrders = response.data.filter(order => isCustomOrder(order)).length;
        console.log('Orders: Order type breakdown', { standard: standardOrders, custom: customOrders });
        
        setOrders(response.data);
        toast({
          title: "Success",
          description: `Loaded ${response.data.length} orders successfully (${standardOrders} standard, ${customOrders} custom)`,
        });
      } else {
        console.error('Error loading orders:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to load orders",
        });
        // Fallback to local storage if API fails
        const localOrders = getOrders();
        setOrders(Array.isArray(localOrders) ? localOrders : []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check if it's an API URL configuration error
      if (errorMessage.includes("API URL not configured")) {
        toast({
          title: "Configuration Error",
          description: "Please create a .env file with VITE_API_URL pointing to your backend",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders. Using local data.",
        });
      }
      
      // Fallback to local storage
      const localOrders = getOrders();
      setOrders(Array.isArray(localOrders) ? localOrders : []);
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditOrder = async (order: Order) => {
    setEditingOrderId(order.id);
    setEditingOrder({ ...order });
    setShowEditModal(true);
    await loadEditModalData();
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
        items: editingOrder.items || [],
        total: editingOrder.total,
        additionalPrice: editingOrder.additionalPrice,
        colour: editingOrder.colour,
        inscription: editingOrder.inscription,
        totalCost: editingOrder.totalCost,
        editedBy: validatedUsername
      };

      // Call API to update order
      const response = await updateOrderAPI(editingOrder.id, orderData);
      
      if (response.success && response.data) {
        // Update local state
        setOrders(orders.map(o => o.id === editingOrder.id ? response.data : o));
        
        toast({
          title: "Success",
          description: "Order updated successfully!",
        });
        
        handleCancelEdit();
      } else {
        throw new Error(response.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditingOrder(null);
    setShowEditModal(false);
    setSelectedProduct("");
    setProductQuantity("");
    setSelectedPackage("");
    setPackageQuantity("");
    // Reset password validation states
    setPassword("");
    setPasswordError("");
    setValidatedUsername("");
    setIsValidatingPassword(false);
    if (passwordValidationTimer) {
      clearTimeout(passwordValidationTimer);
      setPasswordValidationTimer(null);
    }
  };

  const recalculateOrderTotal = (order: Order): number => {
    const subtotal = (order.items || []).reduce((sum, item) => sum + item.subtotal, 0);
    return subtotal + order.deliveryFee;
  };

  // Helper functions for edit modal
  const addProductToOrder = () => {
    if (!selectedProduct || !productQuantity || !editingOrder) return;

    const product = availableProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const quantity = parseInt(productQuantity);
    if (quantity <= 0) return;

    const newProduct = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.unitPrice,
      subtotal: quantity * product.unitPrice
    };

    setEditingOrder({
      ...editingOrder,
      items: [...(editingOrder.items || []), newProduct],
      total: recalculateOrderTotal({...editingOrder, items: [...(editingOrder.items || []), newProduct]})
    });

    // Reset form
    setSelectedProduct("");
    setProductQuantity("");
  };

  const removeProductFromOrder = (productId: string) => {
    if (!editingOrder) return;

    const updatedItems = (editingOrder.items || []).filter(item => item.productId !== productId);
    const updatedOrder = {
      ...editingOrder,
      items: updatedItems,
      total: recalculateOrderTotal({...editingOrder, items: updatedItems})
    };

    setEditingOrder(updatedOrder);
  };

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
      items: [...(editingOrder.items || []), newPackage],
      total: recalculateOrderTotal({...editingOrder, items: [...(editingOrder.items || []), newPackage]})
    });

    // Reset form
    setSelectedPackage("");
    setPackageQuantity("");
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        deleteOrder(orderId);
        setOrders((Array.isArray(orders) ? orders : []).filter(o => o.id !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
      }
    }
  };

  useEffect(() => {
    loadStaffMembers();
    loadOrders();
  }, []);

  // Determine if an order is custom or standard
  const isCustomOrder = (order: Order): boolean => {
    // First check if orderType is explicitly set from backend
    if (order.orderType) {
      return order.orderType === 'custom';
    }
    // Fallback: Check if order has custom order specific fields
    return !!(order.additionalPrice || order.colour || order.inscription || order.totalCost);
  };

  // Filter orders based on selected filters
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesDate = !dateFilter || order.orderDate === format(dateFilter, 'yyyy-MM-dd');
    const matchesDeliveryType = deliveryTypeFilter === "all" || order.deliveryType === deliveryTypeFilter;
    const matchesPaymentType = paymentTypeFilter === "all" || order.paymentType === paymentTypeFilter;
    const matchesProduct = productFilter === "all" || (order.items || []).some(item => 
      item.productName.toLowerCase().includes(productFilter.toLowerCase())
    );
    const matchesOrderType = orderTypeFilter === "all" || 
      (orderTypeFilter === "custom" && isCustomOrder(order)) ||
      (orderTypeFilter === "standard" && !isCustomOrder(order));
    
    return matchesDate && matchesDeliveryType && matchesPaymentType && matchesProduct && matchesOrderType;
  }).sort((a, b) => {
    // Sort by date and time in descending order (most recent first)
    // Use createdAt timestamp if available (more accurate), otherwise use orderDate + orderTime
    let dateA: Date;
    let dateB: Date;
    
    if (a.createdAt) {
      dateA = new Date(a.createdAt);
    } else {
      dateA = new Date(`${a.orderDate} ${a.orderTime}`);
    }
    
    if (b.createdAt) {
      dateB = new Date(b.createdAt);
    } else {
      dateB = new Date(`${b.orderDate} ${b.orderTime}`);
    }
    
    return dateB.getTime() - dateA.getTime();
  });

  // Get unique values for filter options
  const safeOrders = Array.isArray(orders) ? orders : [];
  const uniqueDates = [...new Set(safeOrders.map(order => order.orderDate))].sort();
  const uniqueProducts = [...new Set(safeOrders.flatMap(order => (order.items || []).map(item => item.productName)))].sort();

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'preparing': return 'default';
      case 'ready': return 'outline';
      case 'delivered': return 'default';
      case 'picked_up': return 'default';
      default: return 'secondary';
    }
  };

  // Get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'delivered': return 'Delivered';
      case 'picked_up': return 'Picked Up';
      default: return status;
    }
  };

  // Get payment type display text
  const getPaymentTypeDisplayText = (paymentType: string) => {
    switch (paymentType) {
      case 'cash': return 'Cash';
      case 'momo': return 'MoMo';
      case 'card': return 'Card';
      case 'mobile_money': return 'Mobile Money';
      default: return paymentType;
    }
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

  // Helper function to get display name for creator/editor
  const getCreatorDisplayName = (createdBy: string | undefined): string => {
    if (!createdBy) return 'Unknown';
    
    // If it's a number (user ID), try to get username from staff map
    if (/^\d+$/.test(createdBy)) {
      const username = staffMap.get(createdBy);
      return username || `User #${createdBy}`;
    }
    
    // If it's an email, extract username part
    if (createdBy.includes('@')) {
      const username = createdBy.split('@')[0];
      return username || createdBy;
    }
    
    // If it's a username, return as is
    return createdBy;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Refresh Button and Filters */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <Label htmlFor="date-filter" className="text-xs">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-32 h-10 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "MMM dd, yyyy") : "All dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setDateFilter(undefined)}
                    >
                      Clear Date Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label htmlFor="delivery-filter" className="text-xs">Type</Label>
            <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="payment-filter" className="text-xs">Payment</Label>
            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="product-filter" className="text-xs">Product</Label>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {uniqueProducts.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="order-type-filter" className="text-xs">Order Type</Label>
            <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadOrders} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {(() => {
            // Check if there are no orders at all
            if (!safeOrders || safeOrders.length === 0) {
              return (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No orders found</p>
                      <p className="text-sm">Orders will appear here once they are created by staff.</p>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            return filteredOrders.map((order) => (
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
                        <p className="text-sm text-muted-foreground font-medium">
                          Created by: <span className="text-primary font-semibold">{getCreatorDisplayName(order.createdBy)}</span>
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
                        <>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.customerContact}</p>
                          {order.deliveryType === 'delivery' && order.hostel && (
                            <p className="text-muted-foreground">📍 {order.hostel}</p>
                          )}
                        </>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Items ({(order.items || []).length})</h4>
                      </div>
                      <div className="pl-6 space-y-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => {
                            console.log('🔵 Rendering item:', item);
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
            ));
          })()}

          {filteredOrders.length === 0 && safeOrders.length > 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found matching the selected filters.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
                      <Label>Current Products ({(editingOrder.items || []).length})</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(editingOrder.items || []).map((item, index) => (
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
                        {(editingOrder.items || []).length === 0 && (
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
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  {/* Custom Order Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="edit-colour">Colour</Label>
                    <Input
                      id="edit-colour"
                      value={editingOrder.colour || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, colour: e.target.value})}
                      placeholder="Enter colour details"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-inscription">Inscription</Label>
                    <Textarea
                      id="edit-inscription"
                      value={editingOrder.inscription || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, inscription: e.target.value})}
                      rows={3}
                      placeholder="Enter inscription text"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Password Validation Section */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Password Verification</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Enter your password to save changes</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        debouncedValidatePassword(e.target.value);
                      }}
                      placeholder="Enter your password"
                      className="max-w-md"
                    />
                    {isValidatingPassword && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
              </div>
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

export default Orders;
