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
  Trash2,
  Minus
} from "lucide-react";
import { getExpenses, saveExpense, deleteExpense, Expense } from "@/lib/dataService";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: "",
    supplier: "",
    category: "Supply"
  });

  const [expenseItems, setExpenseItems] = useState([
    {
    items: "",
    quantity: "",
    costPerItem: "",
    purchaseUnit: "",
    packageSize: ""
    }
  ]);
  const [supplyDateFilter, setSupplyDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Settings data state
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string, contact?: string, address?: string}>>([]);
  const [items, setItems] = useState<Array<{id: string, name: string, unit: string}>>([]);

  // Load data
  const loadExpenses = () => {
    try {
      const expensesData = getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadSettingsData = () => {
    try {
      // Load suppliers
      const savedSuppliers = localStorage.getItem('laila_suppliers');
      if (savedSuppliers) {
        setSuppliers(JSON.parse(savedSuppliers));
      }

      // Load items
      const savedItems = localStorage.getItem('laila_items');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading settings data:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadSettingsData();
  }, []);

  // Expense management functions
  const handleAddExpense = () => {
    if (newExpense.date && newExpense.supplier && expenseItems.length > 0) {
      // Validate that all items have required fields
      const validItems = expenseItems.filter(item => 
        item.items.trim() && item.quantity && item.costPerItem
      );
      
      if (validItems.length === 0) {
        alert("Please add at least one item with all required fields");
        return;
      }

      // Create an expense for each item
      validItems.forEach((item, index) => {
        const costPerItem = parseFloat(item.costPerItem);
        const packageSize = parseFloat(item.packageSize || "0");
      const pricePerUnit = packageSize > 0 ? costPerItem / packageSize : 0;
      
      const expense: Expense = {
          id: `EXP-${Date.now().toString().slice(-6)}-${index}`,
        date: newExpense.date,
        supplier: newExpense.supplier,
          items: item.items,
          quantity: parseInt(item.quantity),
        costPerItem: costPerItem,
          total: parseInt(item.quantity) * costPerItem,
        category: "Supply",
          purchaseUnit: item.purchaseUnit || "",
        packageSize: packageSize,
        pricePerUnit: pricePerUnit
      };
      
      saveExpense(expense);
      });
      
      loadExpenses();
      
      // Reset form
      setNewExpense({ 
        date: "", 
        supplier: "", 
        category: "Supply"
      });
      setExpenseItems([
        {
        items: "", 
        quantity: "", 
        costPerItem: "", 
        purchaseUnit: "", 
        packageSize: "" 
        }
      ]);
      setIsAddExpenseDialogOpen(false);
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
    loadExpenses();
  };

  // Helper functions for managing multiple items
  const addExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      {
        items: "",
        quantity: "",
        costPerItem: "",
        purchaseUnit: "",
        packageSize: ""
      }
    ]);
  };

  const removeExpenseItem = (index: number) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter((_, i) => i !== index));
    }
  };

  const updateExpenseItem = (index: number, field: string, value: string) => {
    const updatedItems = [...expenseItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If items field is updated, automatically set the purchase unit from settings
    if (field === 'items' && value) {
      const selectedItem = items.find(item => item.name === value);
      if (selectedItem) {
        updatedItems[index].purchaseUnit = selectedItem.unit;
      }
    }
    
    setExpenseItems(updatedItems);
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
                     <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Add New Supply Expense</DialogTitle>
              <DialogDescription>
                Add a new supply expense to your records.
              </DialogDescription>
            </DialogHeader>
                         <div className="grid gap-3 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
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
                <Select value={newExpense.supplier} onValueChange={(value) => setNewExpense({...newExpense, supplier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Multiple Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Supply Items</Label>
                </div>
                
                {expenseItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Item {index + 1}</Label>
                      {expenseItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExpenseItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
              </div>
                    
              <div className="grid gap-2">
                      <Label htmlFor={`expense-items-${index}`}>Supply Item</Label>
                      <Select value={item.items} onValueChange={(value) => updateExpenseItem(index, 'items', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supply item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((itemOption) => (
                            <SelectItem key={itemOption.id} value={itemOption.name}>
                              {itemOption.name} ({itemOption.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
              </div>
                    
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                        <Label htmlFor={`expense-quantity-${index}`}>Quantity</Label>
                  <Input
                          id={`expense-quantity-${index}`}
                    type="number"
                    min="0"
                          value={item.quantity}
                          onChange={(e) => updateExpenseItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                        <Label htmlFor={`expense-cost-${index}`}>Cost per Item (₵)</Label>
                  <Input
                          id={`expense-cost-${index}`}
                    type="number"
                    step="0.01"
                          value={item.costPerItem}
                          onChange={(e) => updateExpenseItem(index, 'costPerItem', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
                    
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                        <Label htmlFor={`expense-package-size-${index}`}>Package Size</Label>
                  <Input
                          id={`expense-package-size-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                          value={item.packageSize}
                          onChange={(e) => updateExpenseItem(index, 'packageSize', e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
                <div className="grid gap-2">
                        <Label htmlFor={`expense-purchase-unit-${index}`}>Purchase Unit</Label>
                        <Input
                          id={`expense-purchase-unit-${index}`}
                          value={item.purchaseUnit}
                          placeholder="Auto-filled from selected item"
                          readOnly
                          className="bg-gray-50"
                        />
                </div>
              </div>
                    
                    {item.costPerItem && item.packageSize && parseFloat(item.packageSize) > 0 && (
                <div className="grid gap-2">
                  <Label>Price per Unit (₵)</Label>
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md">
                    <span className="text-lg font-semibold text-blue-700">
                            ₵{(parseFloat(item.costPerItem) / parseFloat(item.packageSize)).toFixed(2)}
                    </span>
                    <span className="text-sm text-blue-600 ml-2">
                            per {item.purchaseUnit || 'unit'}
                    </span>
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
                         <div className="flex justify-between gap-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpenseItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
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
