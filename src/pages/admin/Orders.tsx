import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { getOrders, updateOrder, deleteOrder, Order } from "@/lib/dataService";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Load data
  const loadOrders = () => {
    try {
      const ordersData = getOrders();
      console.log('Orders: Loading orders', { count: ordersData.length });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error loading orders. Please try again.');
    }
  };

  const clearAllOrders = () => {
    try {
      localStorage.removeItem('laila_orders');
      setOrders([]);
      console.log('Orders: All orders cleared');
    } catch (error) {
      console.error('Error clearing orders:', error);
      alert('Error clearing orders. Please try again.');
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
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
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
        setOrders(orders.filter(o => o.id !== orderId));
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

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    const matchesDate = dateFilter === "all" || order.orderDate === dateFilter;
    const matchesDeliveryType = deliveryTypeFilter === "all" || order.deliveryType === deliveryTypeFilter;
    const matchesPaymentType = paymentTypeFilter === "all" || order.paymentType === paymentTypeFilter;
    const matchesProduct = productFilter === "all" || order.items.some(item => 
      item.productName.toLowerCase().includes(productFilter.toLowerCase())
    );
    
    return matchesDate && matchesDeliveryType && matchesPaymentType && matchesProduct;
  });

  // Get unique values for filter options
  const uniqueDates = [...new Set(orders.map(order => order.orderDate))].sort();
  const uniqueProducts = [...new Set(orders.flatMap(order => order.items.map(item => item.productName)))].sort();

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

  return (
    <div className="h-full flex flex-col">
      {/* Header with Refresh Button and Filters */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <Label htmlFor="date-filter" className="text-xs">Date</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {orders.length > 0 && (
            <Button onClick={clearAllOrders} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Orders
            </Button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {(() => {
            // Check if there are no orders at all
            if (!orders || orders.length === 0) {
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
                          Created by: {order.createdBy || 'Unknown'}
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
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="truncate">{item.productName} × {item.quantity}</span>
                            <span className="font-medium">₵{item.subtotal.toFixed(2)}</span>
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
                        <div className="flex justify-between font-bold text-base border-t pt-1">
                          <span>Total:</span>
                          <span className="text-primary">₵{(editingOrderId === order.id && editingOrder ? editingOrder.total : order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {(order.specialNotes || editingOrderId === order.id) && (
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
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ));
          })()}

          {filteredOrders.length === 0 && orders.length > 0 && (
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
