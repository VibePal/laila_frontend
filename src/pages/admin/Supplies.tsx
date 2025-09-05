import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Package,
  Plus,
  Trash2
} from "lucide-react";
import { getExpenses, saveExpense, deleteExpense, Expense } from "@/lib/dataService";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: "",
    supplier: "",
    items: "",
    quantity: "",
    costPerItem: "",
    category: "Supply",
    purchaseUnit: "",
    packageSize: ""
  });
  const [supplyDateFilter, setSupplyDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Load data
  const loadExpenses = () => {
    try {
      const expensesData = getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Expense management functions
  const handleAddExpense = () => {
    if (newExpense.date && newExpense.supplier && newExpense.items && newExpense.quantity && newExpense.costPerItem) {
      const costPerItem = parseFloat(newExpense.costPerItem);
      const packageSize = parseFloat(newExpense.packageSize || "0");
      const pricePerUnit = packageSize > 0 ? costPerItem / packageSize : 0;
      
      const expense: Expense = {
        id: `EXP-${Date.now().toString().slice(-6)}`,
        date: newExpense.date,
        supplier: newExpense.supplier,
        items: newExpense.items,
        quantity: parseInt(newExpense.quantity),
        costPerItem: costPerItem,
        total: parseInt(newExpense.quantity) * costPerItem,
        category: "Supply",
        purchaseUnit: newExpense.purchaseUnit || "",
        packageSize: packageSize,
        pricePerUnit: pricePerUnit
      };
      
      saveExpense(expense);
      loadExpenses();
      
      setNewExpense({ 
        date: "", 
        supplier: "", 
        items: "", 
        quantity: "", 
        costPerItem: "", 
        category: "Supply", 
        purchaseUnit: "", 
        packageSize: "" 
      });
      setIsAddExpenseDialogOpen(false);
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
    loadExpenses();
  };

    return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="supply-date-filter" className="text-sm font-medium">Filter by Date:</Label>
            <Input
              id="supply-date-filter"
              type="date"
              value={supplyDateFilter}
              onChange={(e) => setSupplyDateFilter(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supply Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Supply Expense</DialogTitle>
              <DialogDescription>
                Add a new supply expense to your records.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid gap-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-supplier">Supplier</Label>
                <Input
                  id="expense-supplier"
                  value={newExpense.supplier}
                  onChange={(e) => setNewExpense({...newExpense, supplier: e.target.value})}
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-items">Supply Item</Label>
                <Input
                  id="expense-items"
                  value={newExpense.items}
                  onChange={(e) => setNewExpense({...newExpense, items: e.target.value})}
                  placeholder="Enter supply item description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="expense-quantity">Quantity</Label>
                  <Input
                    id="expense-quantity"
                    type="number"
                    min="0"
                    value={newExpense.quantity}
                    onChange={(e) => setNewExpense({...newExpense, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expense-cost">Cost per Item (₵)</Label>
                  <Input
                    id="expense-cost"
                    type="number"
                    step="0.01"
                    value={newExpense.costPerItem}
                    onChange={(e) => setNewExpense({...newExpense, costPerItem: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="expense-package-size">Package Size</Label>
                  <Input
                    id="expense-package-size"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.packageSize || ""}
                    onChange={(e) => setNewExpense({...newExpense, packageSize: e.target.value})}
                    placeholder="e.g., 1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expense-purchase-unit">Purchase Unit</Label>
                  <Select value={newExpense.purchaseUnit || ""} onValueChange={(value) => setNewExpense({...newExpense, purchaseUnit: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newExpense.costPerItem && newExpense.packageSize && parseFloat(newExpense.packageSize) > 0 && (
                <div className="grid gap-2">
                  <Label>Price per Unit (₵)</Label>
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md">
                    <span className="text-lg font-semibold text-blue-700">
                      ₵{(parseFloat(newExpense.costPerItem) / parseFloat(newExpense.packageSize)).toFixed(2)}
                    </span>
                    <span className="text-sm text-blue-600 ml-2">
                      per {newExpense.purchaseUnit || 'unit'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.filter(expense => expense.category === "Supply" && expense.date === supplyDateFilter).length > 0 ? (
            expenses.filter(expense => expense.category === "Supply" && expense.date === supplyDateFilter).map((expense) => (
              <Card key={expense.id} className="h-fit">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{expense.id}</h3>
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{expense.items}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Supplier:</span>
                        <span className="truncate">{expense.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Item:</span>
                        <span className="truncate">{expense.items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Quantity:</span>
                        <span>{expense.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cost per Item:</span>
                        <span>₵{expense.costPerItem.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {expense.purchaseUnit && expense.packageSize && expense.pricePerUnit && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-blue-800">Package:</span>
                            <span className="text-blue-700">
                              {expense.packageSize} {expense.purchaseUnit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-blue-800">Price per Unit:</span>
                            <span className="text-blue-700 font-semibold">
                              ₵{expense.pricePerUnit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Total:</span>
                        <span className="font-bold text-base">₵{expense.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No supply expenses found for {new Date(supplyDateFilter).toLocaleDateString()}</p>
                  <p className="text-sm">Try selecting a different date or add a new supply expense.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
