import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  X
} from "lucide-react";
import { getOrders, updateOrder, deleteOrder, getAllOrdersFromAPI, Order } from "@/lib/dataService";
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

  // Load data
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrdersFromAPI();
      if (response.success && Array.isArray(response.data)) {
        console.log('Orders: Loading orders from API', { count: response.data.length });
        
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


  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setEditingOrder({ ...order });
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    
    try {
      updateOrder(editingOrder);
      setOrders((Array.isArray(orders) ? orders : []).map(o => o.id === editingOrder.id ? editingOrder : o));
      setEditingOrderId(null);
      setEditingOrder(null);
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditingOrder(null);
  };

  const recalculateOrderTotal = (order: Order): number => {
    const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    return subtotal + order.deliveryFee;
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
    const matchesProduct = productFilter === "all" || order.items.some(item => 
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
  const uniqueProducts = [...new Set(safeOrders.flatMap(order => order.items.map(item => item.productName)))].sort();

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
                        <p className="text-xs text-muted-foreground">
                          Created by: {order.createdBy === 'admin' ? (localStorage.getItem('username') || 'admin') : (order.createdBy || 'Unknown')}
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
                      {editingOrderId === order.id ? (
                        <div className="flex gap-1">
                          <Button onClick={handleSaveEdit} size="sm" variant="outline">
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="outline">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button onClick={() => handleEditOrder(order)} size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button onClick={() => handleDeleteOrder(order.id)} size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
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
                        {editingOrderId === order.id && editingOrder ? (
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="edit-customer-name" className="text-xs">Name</Label>
                              <Input
                                id="edit-customer-name"
                                value={editingOrder.customerName}
                                onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-customer-contact" className="text-xs">Contact</Label>
                              <Input
                                id="edit-customer-contact"
                                value={editingOrder.customerContact}
                                onChange={(e) => setEditingOrder({...editingOrder, customerContact: e.target.value})}
                                className="h-7 text-sm"
                              />
                            </div>
                            {editingOrder.deliveryType === 'delivery' && (
                              <div>
                                <Label htmlFor="edit-hostel" className="text-xs">Hostel</Label>
                                <Input
                                  id="edit-hostel"
                                  value={editingOrder.hostel || ''}
                                  onChange={(e) => setEditingOrder({...editingOrder, hostel: e.target.value})}
                                  className="h-7 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-muted-foreground">{order.customerContact}</p>
                            {order.deliveryType === 'delivery' && order.hostel && (
                              <p className="text-muted-foreground">📍 {order.hostel}</p>
                            )}
                          </>
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
                            {editingOrderId === order.id && editingOrder ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingOrder.deliveryFee}
                                onChange={(e) => {
                                  const newDeliveryFee = parseFloat(e.target.value) || 0;
                                  const newTotal = recalculateOrderTotal({...editingOrder, deliveryFee: newDeliveryFee});
                                  setEditingOrder({...editingOrder, deliveryFee: newDeliveryFee, total: newTotal});
                                }}
                                className="w-20 h-6 text-xs"
                              />
                            ) : (
                              <span>₵{order.deliveryFee.toFixed(2)}</span>
                            )}
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
                          <span className="text-primary">₵{(editingOrderId === order.id && editingOrder ? editingOrder.total : order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Notes and Custom Order Details */}
                  {(order.specialNotes || editingOrderId === order.id || isCustomOrder(order)) && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">Special Notes</p>
                          {editingOrderId === order.id && editingOrder ? (
                            <textarea
                              value={editingOrder.specialNotes}
                              onChange={(e) => setEditingOrder({...editingOrder, specialNotes: e.target.value})}
                              className="w-full p-2 text-sm border rounded resize-none"
                              rows={2}
                              placeholder="Enter special notes..."
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">{order.specialNotes}</p>
                          )}
                          
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
    </div>
  );
};

export default Orders;
