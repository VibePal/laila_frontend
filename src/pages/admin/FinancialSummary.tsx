import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp,
  Trash2,
  Package,
  Users,
  ShoppingCart
} from "lucide-react";
import { getProducts, getOrders, getExpenses, Product, Order, Expense } from "@/lib/dataService";

const FinancialSummary = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Load data
  const loadData = () => {
    try {
      const productsData = getProducts();
      const ordersData = getOrders();
      const expensesData = getExpenses();
      setProducts(productsData);
      setOrders(ordersData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Financial calculations for selected date
  const getFilteredData = (selectedDate: string) => {
    const filteredOrders = orders.filter(order => order.orderDate === selectedDate);
    const filteredExpenses = expenses.filter(expense => expense.date === selectedDate);
    
    return { filteredOrders, filteredExpenses };
  };

  const { filteredOrders, filteredExpenses } = getFilteredData(dateFilter);

  // Revenue calculations
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;

  // Expense calculations by category
  const supplyExpenses = filteredExpenses
    .filter(expense => expense.category === "Supply")
    .reduce((sum, expense) => sum + expense.total, 0);

  const staffPayments = filteredExpenses
    .filter(expense => expense.category === "Staff")
    .reduce((sum, expense) => sum + expense.total, 0);

  const totalExpenses = supplyExpenses + staffPayments;

  // Profit calculation
  const netProfit = totalRevenue - totalExpenses;

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₵${amount.toFixed(2)}`;

  const clearAllData = () => {
    try {
      // Clear all data from localStorage
      localStorage.removeItem('laila_orders');
      localStorage.removeItem('laila_products');
      localStorage.removeItem('laila_expenses');
      localStorage.removeItem('recipes');
      localStorage.removeItem('ingredients');
      
      // Reset all state
      setOrders([]);
      setProducts([]);
      setExpenses([]);
      
      console.log('FinancialSummary: All data cleared');
      alert('All data has been cleared successfully!');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Filter and Clear Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Financial Summary</h2>
          <p className="text-muted-foreground">Complete financial overview for selected date</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearAllData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Main Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(staffPayments)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wages & salaries
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
                  <p className="font-semibold text-blue-600">{formatCurrency(staffPayments)}</p>
                  <p className="text-sm text-muted-foreground">Wages & salaries</p>
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

      {/* Summary for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>Summary for {new Date(dateFilter).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Orders Processed</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
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
    </div>
  );
};

export default FinancialSummary;
