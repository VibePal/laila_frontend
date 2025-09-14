import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Package,
  Plus,
  Trash2,
  Minus,
  Loader2
} from "lucide-react";
import { 
  getSupplyExpensesFromAPI,
  createSupplyExpense,
  updateSupplyExpenseAPI,
  deleteSupplyExpenseAPI,
  getSuppliersFromAPI,
  getItemsFromAPI,
  Expense,
  SupplierApiResponse,
  ItemApiResponse,
  ApiResponse
} from "@/lib/dataService";

const Expenses = () => {
  console.log("🔵 Expenses component is rendering!");
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

  // Settings data state - using API response types
  const [suppliers, setSuppliers] = useState<SupplierApiResponse[]>([]);
  const [items, setItems] = useState<ItemApiResponse[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const { toast } = useToast();

  // Load data
  const loadExpenses = async () => {
    console.log("🔵 loadExpenses called");
    try {
      console.log("🔵 Calling getSupplyExpensesFromAPI...");
      const response = await getSupplyExpensesFromAPI();
      console.log("🔵 loadExpenses API response:", response);
      
      if (response.success && response.data) {
        console.log("✅ Expenses loaded successfully:", response.data);
        console.log("🔵 Number of expenses loaded:", response.data.length);
        setExpenses(response.data);
        console.log("🔵 Expenses state updated, current expenses:", response.data);
      } else {
        console.error("❌ Error loading expenses:", response.error);
        setExpenses([]);
      }
    } catch (error) {
      console.error("❌ Exception in loadExpenses:", error);
      setExpenses([]);
    }
  };

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const response: ApiResponse<SupplierApiResponse[]> = await getSuppliersFromAPI();
      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        console.error('Failed to load suppliers:', response.error);
        setSuppliers([]);
        toast({
          title: "Error",
          description: response.error || "Failed to load suppliers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers([]);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const loadItems = async () => {
    setIsLoadingItems(true);
    try {
      const response: ApiResponse<ItemApiResponse[]> = await getItemsFromAPI();
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        console.error('Failed to load items:', response.error);
        setItems([]);
        toast({
          title: "Error",
          description: response.error || "Failed to load items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    console.log("🔵 Expenses component mounted, loading data...");
    loadExpenses();
    loadSuppliers();
    loadItems();
  }, []);

  // Expense management functions
  const handleAddExpense = async () => {
    console.log("🔵 handleAddExpense called");
    console.log("🔵 Current form data:", { newExpense, expenseItems });
    
    if (newExpense.date && newExpense.supplier && expenseItems.length > 0) {
      // Validate that all items have required fields
      const validItems = expenseItems.filter(item => 
        item.items.trim() && item.quantity && item.costPerItem
      );
      
      if (validItems.length === 0) {
        alert("Please add at least one item with all required fields");
        return;
      }

      console.log("✅ All required fields present, creating expenses...");
      
      // Create an expense for each item using API
      try {
        for (const item of validItems) {
          const costPerItem = parseFloat(item.costPerItem);
          const packageSize = item.packageSize ? parseFloat(item.packageSize) : undefined;

          // Convert date to ISO format
          const isoDate = new Date(newExpense.date).toISOString();

          // Build payload for API - exclude total and pricePerUnit as backend calculates them
          const expensePayload = {
            date: isoDate,
            supplier: newExpense.supplier.trim(),
            items: item.items.trim(),
            quantity: parseInt(item.quantity),
            costPerItem: costPerItem,
            category: "Supply",
            purchaseUnit: item.purchaseUnit || undefined,
            packageSize: packageSize,
          };

          console.log("🔵 Creating expense with payload:", expensePayload);
          
          const response = await createSupplyExpense(expensePayload);
          if (response.success) {
            console.log("✅ Expense created successfully:", response.data);
          } else {
            console.error("❌ Error creating expense:", response.error);
            alert(`Error creating expense: ${response.error}`);
            return;
          }
        }
        
        // Reload expenses to get the updated list with backend-calculated fields
        console.log("🔵 Reloading expenses...");
        await loadExpenses();
      
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
        console.log("✅ Form reset and dialog closed");
        
      } catch (error) {
        console.error("❌ Exception caught in handleAddExpense:", error);
        alert("Failed to create expense. Please try again.");
      }
    } else {
      console.log("❌ Missing required fields:", {
        date: !!newExpense.date,
        supplier: !!newExpense.supplier,
        expenseItems: expenseItems.length
      });
      alert("Please fill in all required fields");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    console.log("🔵 handleDeleteExpense called with ID:", expenseId);
    try {
      const response = await deleteSupplyExpenseAPI(expenseId);
      if (response.success) {
        console.log("✅ Expense deleted successfully");
        // Reload expenses to get the updated list
        await loadExpenses();
      } else {
        console.error("❌ Error deleting expense:", response.error);
        
        // Check if it's an authentication error
        if (response.error?.includes('credentials') || response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          alert("Your session has expired. Please log in again.");
          navigate('/login');
        } else {
          alert(`Error deleting expense: ${response.error}`);
        }
      }
    } catch (error) {
      console.error("❌ Exception in handleDeleteExpense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    console.log("🔵 handleEditExpense called with:", expense);
    setEditingExpense(expense);
    setIsEditExpenseDialogOpen(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    console.log("🔵 handleUpdateExpense called for:", editingExpense.id);
    
    try {
      // Convert date to ISO format if it's not already
      const isoDate = editingExpense.date.includes('T') 
        ? editingExpense.date 
        : new Date(editingExpense.date).toISOString();

      const updatePayload = {
        date: isoDate,
        supplier: editingExpense.supplier.trim(),
        items: editingExpense.items.trim(),
        quantity: editingExpense.quantity,
        costPerItem: editingExpense.costPerItem,
        category: editingExpense.category,
        purchaseUnit: editingExpense.purchaseUnit || undefined,
        packageSize: editingExpense.packageSize || undefined,
      };

      console.log("🔵 Updating expense with payload:", updatePayload);
      
      const response = await updateSupplyExpenseAPI(editingExpense.id, updatePayload);
      if (response.success) {
        console.log("✅ Expense updated successfully");
        // Reload expenses to get the updated list
        await loadExpenses();
        setIsEditExpenseDialogOpen(false);
        setEditingExpense(null);
      } else {
        console.error("❌ Error updating expense:", response.error);
        
        // Check if it's an authentication error
        if (response.error?.includes('credentials') || response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          alert("Your session has expired. Please log in again.");
          navigate('/login');
        } else {
          alert(`Error updating expense: ${response.error}`);
        }
      }
    } catch (error) {
      console.error("❌ Exception in handleUpdateExpense:", error);
      alert("Failed to update expense. Please try again.");
    }
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
                <Select value={newExpense.supplier} onValueChange={(value) => setNewExpense({...newExpense, supplier: value})} disabled={isLoadingSuppliers}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSuppliers ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading suppliers...</span>
                      </div>
                    ) : suppliers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No suppliers available. Please add suppliers in Settings.
                      </div>
                    ) : (
                      suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))
                    )}
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
                      <Select value={item.items} onValueChange={(value) => updateExpenseItem(index, 'items', value)} disabled={isLoadingItems}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingItems ? "Loading items..." : "Select supply item"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingItems ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Loading items...</span>
                            </div>
                          ) : items.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No items available. Please add items in Settings.
                            </div>
                          ) : (
                            items.map((itemOption) => (
                              <SelectItem key={itemOption.id} value={itemOption.name}>
                                {itemOption.name} ({itemOption.unit})
                              </SelectItem>
                            ))
                          )}
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

        {/* Edit Expense Dialog */}
        <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Supply Expense</DialogTitle>
              <DialogDescription>
                Update the supply expense details.
              </DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <div className="grid gap-3 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-expense-date">Date</Label>
                  <Input
                    id="edit-expense-date"
                    type="date"
                    value={editingExpense.date.split('T')[0]}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      date: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expense-supplier">Supplier</Label>
                  <Input
                    id="edit-expense-supplier"
                    value={editingExpense.supplier}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      supplier: e.target.value
                    })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expense-items">Supply Item</Label>
                  <Input
                    id="edit-expense-items"
                    value={editingExpense.items}
                    onChange={(e) => setEditingExpense({
                      ...editingExpense,
                      items: e.target.value
                    })}
                    placeholder="Enter supply item description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-expense-quantity">Quantity</Label>
                    <Input
                      id="edit-expense-quantity"
                      type="number"
                      min="0"
                      value={editingExpense.quantity}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        quantity: parseInt(e.target.value) || 0
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-expense-cost">Cost per Item (₵)</Label>
                    <Input
                      id="edit-expense-cost"
                      type="number"
                      step="0.01"
                      value={editingExpense.costPerItem}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        costPerItem: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-expense-package-size">Package Size</Label>
                    <Input
                      id="edit-expense-package-size"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingExpense.packageSize || ""}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        packageSize: parseFloat(e.target.value) || undefined
                      })}
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-expense-purchase-unit">Purchase Unit</Label>
                    <Input
                      id="edit-expense-purchase-unit"
                      value={editingExpense.purchaseUnit || ""}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        purchaseUnit: e.target.value
                      })}
                      placeholder="e.g., kg, L, piece"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditExpenseDialogOpen(false);
                  setEditingExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateExpense}>Update Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            console.log("🔵 Filtering expenses for display:");
            console.log("🔵 All expenses:", expenses);
            console.log("🔵 Supply date filter:", supplyDateFilter);
            
            const filteredExpenses = expenses.filter(expense => {
              const expenseDate = expense.date.split("T")[0]; // Extract just the date part
              const matchesCategory = expense.category === "Supply";
              const matchesDate = expenseDate === supplyDateFilter;
              
              console.log("🔵 Expense:", expense.id, "Date:", expense.date, "Extracted date:", expenseDate, "Matches date:", matchesDate, "Matches category:", matchesCategory);
              
              return matchesCategory && matchesDate;
            });
            
            console.log("🔵 Filtered expenses:", filteredExpenses);
            console.log("🔵 Number of filtered expenses:", filteredExpenses.length);
            
            return filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
              <Card key={expense.id} className="h-fit">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditExpense(expense)}
                        >
                          Edit
                        </Button>
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
            );
          })()}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Expenses;
