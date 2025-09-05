import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Download
} from "lucide-react";
import { getOrders, getProducts, Order, Product } from "@/lib/dataService";

const Sales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesDateFilter, setSalesDateFilter] = useState("7"); // Default to last 7 days
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  // Helper functions
  const getPaymentTypeDisplayText = (paymentType: string) => {
    switch (paymentType) {
      case 'cash': return 'Cash';
      case 'momo': return 'MoMo';
      case 'card': return 'Card';
      case 'mobile_money': return 'Mobile Money';
      default: return paymentType;
    }
  };

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

  // Load data
  const loadData = () => {
    try {
      const ordersData = getOrders();
      const productsData = getProducts();
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sales calculations
  const getFilteredOrdersForSales = () => {
    const today = new Date();
    const daysToSubtract = parseInt(salesDateFilter);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract);
    
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= today;
    });
  };

  const filteredOrdersForSales = getFilteredOrdersForSales();

  const salesSummary = {
    totalOrders: filteredOrdersForSales.length,
    totalSales: filteredOrdersForSales.reduce((sum, order) => sum + order.total, 0),
    totalRevenue: filteredOrdersForSales.reduce((sum, order) => sum + order.total, 0),
  };

  const paymentMethodBreakdown = filteredOrdersForSales.reduce((acc, order) => {
    const method = getPaymentTypeDisplayText(order.paymentType);
    acc[method] = (acc[method] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const productTypeBreakdown = filteredOrdersForSales.reduce((acc, order) => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product ? product.category : 'Unknown';
      acc[category] = (acc[category] || 0) + item.subtotal;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get filtered breakdowns
  const getFilteredPaymentBreakdown = () => {
    if (paymentMethodFilter === "all") {
      return paymentMethodBreakdown;
    }
    const filtered = { ...paymentMethodBreakdown };
    Object.keys(filtered).forEach(key => {
      if (key !== paymentMethodFilter) {
        delete filtered[key];
      }
    });
    return filtered;
  };

  const getFilteredProductBreakdown = () => {
    if (productTypeFilter === "all") {
      return productTypeBreakdown;
    }
    const filtered = { ...productTypeBreakdown };
    Object.keys(filtered).forEach(key => {
      if (key !== productTypeFilter) {
        delete filtered[key];
      }
    });
    return filtered;
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Contact', 'Items', 'Total', 'Payment Method', 'Delivery Type', 'Status'];
    const csvData = filteredOrdersForSales.map(order => [
      order.id,
      order.orderDate,
      order.customerName,
      order.customerContact,
      order.items.map(item => `${item.productName} (${item.quantity})`).join('; '),
      order.total.toFixed(2),
      getPaymentTypeDisplayText(order.paymentType),
      order.deliveryType,
      getStatusDisplayText(order.deliveryStatus)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${salesDateFilter}-days.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label htmlFor="sales-date-filter">Time Period</Label>
          <Select value={salesDateFilter} onValueChange={setSalesDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Daily Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{salesSummary.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-3xl font-bold">₵{salesSummary.totalSales.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">₵{salesSummary.totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payment Method Breakdown</CardTitle>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getFilteredPaymentBreakdown()).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-medium">{method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((amount / salesSummary.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {Object.keys(getFilteredPaymentBreakdown()).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No payment data available for selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Type Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Product Type Breakdown</CardTitle>
              <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.keys(productTypeBreakdown).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getFilteredProductBreakdown()).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((amount / salesSummary.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {Object.keys(getFilteredProductBreakdown()).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No product data available for selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sales;
