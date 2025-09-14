import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp,
  Trash2,
  Package,
  Users,
  ShoppingCart,
  Loader2,
  Building2
} from "lucide-react";
import { 
  getFinancialSummary,
  getFinancialRevenue,
  getFinancialExpenses,
  getFinancialProfit,
  getFinancialBreakdown,
  FinancialSummaryResponse,
  FinancialRevenueResponse,
  FinancialExpensesResponse,
  FinancialProfitResponse,
  FinancialBreakdownResponse,
  ApiResponse
} from "@/lib/dataService";

const FinancialSummary = () => {
  // API data state
  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryResponse | null>(null);
  const [financialRevenue, setFinancialRevenue] = useState<FinancialRevenueResponse | null>(null);
  const [financialExpenses, setFinancialExpenses] = useState<FinancialExpensesResponse | null>(null);
  const [financialProfit, setFinancialProfit] = useState<FinancialProfitResponse | null>(null);
  const [financialBreakdown, setFinancialBreakdown] = useState<FinancialBreakdownResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter state
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');

  // Load financial data from API
  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const dateParam = dateFilter;
      
      // Load all financial data in parallel
      const [summaryResponse, revenueResponse, expensesResponse, profitResponse, breakdownResponse] = await Promise.all([
        getFinancialSummary({ date: dateParam, period: timePeriod }),
        getFinancialRevenue({ date: dateParam, period: timePeriod }),
        getFinancialExpenses({ date: dateParam, period: timePeriod }),
        getFinancialProfit({ date: dateParam, period: timePeriod }),
        getFinancialBreakdown({ date: dateParam, period: timePeriod })
      ]);

      if (summaryResponse.success && summaryResponse.data) {
        setFinancialSummary(summaryResponse.data);
      }
      
      if (revenueResponse.success && revenueResponse.data) {
        setFinancialRevenue(revenueResponse.data);
      }
      
      if (expensesResponse.success && expensesResponse.data) {
        setFinancialExpenses(expensesResponse.data);
      }
      
      if (profitResponse.success && profitResponse.data) {
        setFinancialProfit(profitResponse.data);
      }
      
      if (breakdownResponse.success && breakdownResponse.data) {
        setFinancialBreakdown(breakdownResponse.data);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [dateFilter, timePeriod]);


  // Use API data for calculations
  const totalRevenue = financialSummary?.total_revenue || 0;
  const totalOrders = financialSummary?.total_orders || 0;

  // Use API data for expense calculations
  const supplyExpenses = financialSummary?.supply_expenses || 0;
  const totalStaffPayments = financialSummary?.staff_payments || 0;
  const totalOverheadCosts = financialSummary?.overhead_costs || 0;
  const totalExpenses = financialSummary?.total_expenses || 0;

  // Use API data for profit calculation
  const netProfit = financialSummary?.net_profit || 0;

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₵${amount.toFixed(2)}`;

  // Helper function to format date range display
  const getDateRangeDisplay = (selectedDate: string, period: 'day' | 'week' | 'month') => {
    switch (period) {
      case 'day':
        return new Date(selectedDate).toLocaleDateString();
      case 'week':
        return `Week of ${new Date(selectedDate).toLocaleDateString()}`;
      case 'month':
        return new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      default:
        return new Date(selectedDate).toLocaleDateString();
    }
  };


  return (
    <div className="space-y-6">
      {/* Header with Date Filter and Clear Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Financial Summary</h2>
          <p className="text-muted-foreground">Complete financial overview for {getDateRangeDisplay(dateFilter, timePeriod)}</p>
        </div>
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
            <Label htmlFor="date-filter">Select Date</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Main Financial Summary Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalOrders} orders
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Supply Expenses Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supply Expenses</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(supplyExpenses)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Materials & ingredients
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Staff Payments Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Payments</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalStaffPayments)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Staff payments
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Overhead Costs Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overhead Costs</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(totalOverheadCosts)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Overhead costs
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Revenue - Expenses
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="font-medium">Total Revenue</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">{totalOrders} orders</p>
                </div>
              </div>
              {totalRevenue === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No revenue data for selected date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              Expenses Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  <span className="font-medium">Supply Expenses</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">{formatCurrency(supplyExpenses)}</p>
                  <p className="text-sm text-muted-foreground">Materials & ingredients</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="font-medium">Staff Payments</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{formatCurrency(totalStaffPayments)}</p>
                  <p className="text-sm text-muted-foreground">Staff payments</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                  <span className="font-medium">Overhead Costs</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">{formatCurrency(totalOverheadCosts)}</p>
                  <p className="text-sm text-muted-foreground">Overhead costs</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-t">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span className="font-medium">Total Expenses</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm text-muted-foreground">Supply + Staff</p>
                </div>
              </div>
              {totalExpenses === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No expenses recorded for selected date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary for Selected Period */}
      <Card>
        <CardHeader>
          <CardTitle>Summary for {getDateRangeDisplay(dateFilter, timePeriod)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Orders Processed</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Overhead Costs</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalOverheadCosts)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

export default FinancialSummary;