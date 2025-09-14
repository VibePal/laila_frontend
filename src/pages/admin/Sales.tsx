import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Download
} from "lucide-react";
import { 
  getSalesSummary, 
  getSalesPaymentBreakdown, 
  getSalesOrders, 
  exportSalesData,
  SalesSummaryResponse,
  PaymentBreakdownItem,
  SalesOrder,
  ApiResponse
} from "@/lib/dataService";

const Sales = () => {
  // API data state
  const [salesSummary, setSalesSummary] = useState<SalesSummaryResponse | null>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdownItem[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter state
  const [salesDateFilter, setSalesDateFilter] = useState<Date | undefined>(new Date()); // Default to today
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");


  // Load data from API
  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      const dateParam = salesDateFilter ? salesDateFilter.toISOString().split('T')[0] : undefined;
      
      // Load all sales data in parallel
      const [summaryResponse, paymentResponse, ordersResponse] = await Promise.all([
        getSalesSummary({ date: dateParam, period: timePeriod }),
        getSalesPaymentBreakdown({ date: dateParam, period: timePeriod }),
        getSalesOrders({ date: dateParam, period: timePeriod })
      ]);

      if (summaryResponse.success && summaryResponse.data) {
        setSalesSummary(summaryResponse.data);
      }
      
      if (paymentResponse.success && paymentResponse.data) {
        setPaymentBreakdown(paymentResponse.data);
      }
      
      if (ordersResponse.success && ordersResponse.data) {
        setSalesOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [salesDateFilter, timePeriod]);

  // Helper function to format date range display
  const getDateRangeDisplay = (selectedDate: Date | undefined, period: 'day' | 'week' | 'month') => {
    if (!selectedDate) return "All dates";
    
    switch (period) {
      case 'day':
        return format(selectedDate, "MMM dd, yyyy");
      case 'week':
        return `Week of ${format(selectedDate, "MMM dd, yyyy")}`;
      case 'month':
        return format(selectedDate, "MMMM yyyy");
      default:
        return format(selectedDate, "MMM dd, yyyy");
    }
  };

  // Export function
  const handleExport = async () => {
    try {
      const dateParam = salesDateFilter ? salesDateFilter.toISOString().split('T')[0] : undefined;
      const blob = await exportSalesData({ date: dateParam, period: timePeriod });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-data-${dateParam || 'all'}-${timePeriod}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting sales data:', error);
    }
  };

  // Get filtered breakdowns
  const getFilteredPaymentBreakdown = () => {
    if (paymentMethodFilter === "all") {
      return paymentBreakdown;
    }
    
    // Map display values to API values
    // Backend maps 'momo' -> 'MoMo', so we need to match 'MoMo'
    const apiValue = paymentMethodFilter === "Momo" ? "MoMo" : paymentMethodFilter;
    
    return paymentBreakdown.filter(item => item.payment_method === apiValue);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="time-period">Time Period</Label>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as 'day' | 'week' | 'month')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-date-filter">Date Filter</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-48 h-10 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateRangeDisplay(salesDateFilter, timePeriod)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={salesDateFilter}
                  onSelect={setSalesDateFilter}
                  initialFocus
                />
                {salesDateFilter && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSalesDateFilter(undefined)}
                    >
                      Clear Date Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button onClick={handleExport} disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Daily Sales Summary */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{salesSummary?.total_orders || 0}</p>
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
                <p className="text-3xl font-bold">₵{(salesSummary?.total_sales || 0).toFixed(2)}</p>
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
                <p className="text-3xl font-bold">₵{(salesSummary?.total_revenue || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 gap-6">
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
                  <SelectItem value="Momo">Momo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredPaymentBreakdown().map((item) => (
                <div key={item.payment_method} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-medium">{item.payment_method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{item.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {getFilteredPaymentBreakdown().length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No payment data available for selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          </div>
        </>
      )}
    </div>
  );
};

export default Sales;
