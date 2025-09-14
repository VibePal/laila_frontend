import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  getSupplyExpensesFromAPI,
  createSupplyExpense,
  deleteSupplyExpenseAPI,
  getItemsFromAPI,
  Expense,
  ItemApiResponse,
} from "@/lib/dataService";

console.log("🔵 Supplies.tsx: Imports loaded successfully");

const Expenses = () => {
  console.log("🔵 Expenses component is rendering!");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<ItemApiResponse[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: "",
    supplier: "",
    items: "",
    quantity: "",
    costPerItem: "",
    category: "Supply",
    purchaseUnit: "",
    packageSize: "",
  });
  const [supplyDateFilter, setSupplyDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Load data
  const loadExpenses = async () => {
    console.log("🔵 loadExpenses called");
    try {
      console.log("🔵 Calling getSupplyExpensesFromAPI...");
      const response = await getSupplyExpensesFromAPI();
      console.log("🔵 loadExpenses API response:", response);
      
      if (response.success && response.data) {
        console.log("✅ Expenses loaded successfully:", response.data);
        setExpenses(response.data);
      } else {
        console.error("❌ Error loading expenses:", response.error);
        setExpenses([]);
      }
    } catch (error) {
      console.error("❌ Exception in loadExpenses:", error);
      setExpenses([]);
    }
  };

  const loadItems = async () => {
    console.log("🔵 loadItems called");
    setIsLoadingItems(true);
    try {
      console.log("🔵 Calling getItemsFromAPI...");
      const response = await getItemsFromAPI();
      console.log("🔵 loadItems API response:", response);
      
      if (response.success && response.data) {
        console.log("✅ Items loaded successfully:", response.data);
        setItems(response.data);
      } else {
        console.error("❌ Error loading items:", response.error);
        setItems([]);
      }
    } catch (error) {
      console.error("❌ Exception in loadItems:", error);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    console.log("🔵 Supplies component mounted, loading data...");
    console.log("🔵 Current expenses state:", expenses);
    loadExpenses();
    loadItems();
  }, []);

  // Helper function to get the most recent price for an item
  const getMostRecentPriceForItem = (itemName: string): number | null => {
    console.log("🔵 getMostRecentPriceForItem called for:", itemName);
    
    // Find all expenses for this item
    const itemExpenses = expenses.filter(expense => 
      expense.category === "Supply" && 
      expense.items.toLowerCase() === itemName.toLowerCase()
    );
    
    console.log("🔵 Found expenses for item:", itemExpenses);
    
    if (itemExpenses.length === 0) {
      console.log("❌ No expenses found for item:", itemName);
      return null;
    }
    
    // Sort by date (most recent first) and get the first one
    const sortedExpenses = itemExpenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const mostRecentExpense = sortedExpenses[0];
    console.log("🔵 Most recent expense for item:", mostRecentExpense);
    
    // Return the cost per item from the most recent expense
    return mostRecentExpense.costPerItem;
  };

  // Expense management functions
  const handleAddExpense = async () => {
    console.log("🔵 handleAddExpense called");
    console.log("🔵 Current form data:", newExpense);
    
    if (
      newExpense.date &&
      newExpense.supplier &&
      newExpense.items &&
      newExpense.quantity &&
      newExpense.costPerItem
    ) {
      console.log("✅ All required fields present");
      
      const costPerItem = parseFloat(newExpense.costPerItem);
      const packageSize = newExpense.packageSize
        ? parseFloat(newExpense.packageSize)
        : undefined;

      console.log("🔵 Parsed values:", {
        costPerItem,
        packageSize,
        originalPackageSize: newExpense.packageSize
      });

      // 🔑 Convert date-only string to full ISO string
      const isoDate = new Date(newExpense.date).toISOString();
      console.log("🔵 Date conversion:", {
        original: newExpense.date,
        iso: isoDate
      });

      // Build payload for API - exclude total and pricePerUnit as backend calculates them
      const expensePayload = {
        date: isoDate,
        supplier: newExpense.supplier.trim(),
        items: newExpense.items.trim(),
        quantity: parseInt(newExpense.quantity),
        costPerItem: costPerItem,
        category: "Supply",
        purchaseUnit: newExpense.purchaseUnit || undefined,
        packageSize: packageSize,
      };

      console.log("🔵 Final payload being sent to API:", expensePayload);

      try {
        console.log("🔵 Calling createSupplyExpense API...");
        const response = await createSupplyExpense(expensePayload);
        console.log("🔵 API response received:", response);
        
        if (response.success) {
          console.log("✅ Expense created successfully");
          // Reload expenses to get the updated list with backend-calculated fields
          console.log("🔵 Reloading expenses...");
          await loadExpenses();
          
          setNewExpense({
            date: "",
            supplier: "",
            items: "",
            quantity: "",
            costPerItem: "",
            category: "Supply",
            purchaseUnit: "",
            packageSize: "",
          });
          setIsAddExpenseDialogOpen(false);
          console.log("✅ Form reset and dialog closed");
        } else {
          console.error("❌ API returned error:", response.error);
          alert(`Error creating expense: ${response.error}`);
        }
      } catch (error) {
        console.error("❌ Exception caught in handleAddExpense:", error);
        alert("Failed to create expense. Please try again.");
      }
    } else {
      console.log("❌ Missing required fields:", {
        date: !!newExpense.date,
        supplier: !!newExpense.supplier,
        items: !!newExpense.items,
        quantity: !!newExpense.quantity,
        costPerItem: !!newExpense.costPerItem
      });
      alert("Please fill in all required fields");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await deleteSupplyExpenseAPI(expenseId);
      if (response.success) {
        // Reload expenses to get the updated list
        await loadExpenses();
      } else {
        alert(`Error deleting expense: ${response.error}`);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  console.log("🔵 About to render Expenses component JSX");
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="supply-date-filter"
              className="text-sm font-medium"
            >
              Filter by Date:
            </Label>
            <Input
              id="supply-date-filter"
              type="date"
              value={supplyDateFilter}
              onChange={(e) => setSupplyDateFilter(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        <Dialog
          open={isAddExpenseDialogOpen}
          onOpenChange={setIsAddExpenseDialogOpen}
        >
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
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-supplier">Supplier</Label>
                <Input
                  id="expense-supplier"
                  value={newExpense.supplier}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, supplier: e.target.value })
                  }
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-items">Supply Item</Label>
                <Select
                  value={newExpense.items}
                  onValueChange={(value) => {
                    console.log("🔵 Item selected:", value);
                    const selectedItem = items.find(item => item.name === value);
                    const recentPrice = getMostRecentPriceForItem(value);
                    
                    setNewExpense({ 
                      ...newExpense, 
                      items: value,
                      costPerItem: recentPrice ? recentPrice.toString() : "",
                      purchaseUnit: selectedItem?.unit || ""
                    });
                    
                    console.log("🔵 Updated form with:", {
                      items: value,
                      costPerItem: recentPrice,
                      purchaseUnit: selectedItem?.unit
                    });
                  }}
                  disabled={isLoadingItems}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingItems ? "Loading items..." : "Select supply item"} />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Unit: {item.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="expense-quantity">Quantity</Label>
                  <Input
                    id="expense-quantity"
                    type="number"
                    min="0"
                    value={newExpense.quantity}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, quantity: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        costPerItem: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                  {newExpense.items && newExpense.costPerItem && (
                    <p className="text-xs text-blue-600">
                      💡 Auto-filled from most recent supply of "{newExpense.items}"
                    </p>
                  )}
                  {newExpense.items && !newExpense.costPerItem && (
                    <p className="text-xs text-orange-600">
                      ⚠️ No recent supply found for "{newExpense.items}" - please enter cost manually
                    </p>
                  )}
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
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        packageSize: e.target.value,
                      })
                    }
                    placeholder="e.g., 1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expense-purchase-unit">Purchase Unit</Label>
                  <Select
                    value={newExpense.purchaseUnit || ""}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, purchaseUnit: value })
                    }
                  >
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
                  {newExpense.items && newExpense.purchaseUnit && (
                    <p className="text-xs text-green-600">
                      ✅ Auto-filled from item definition
                    </p>
                  )}
                </div>
              </div>
              {newExpense.costPerItem &&
                newExpense.packageSize &&
                parseFloat(newExpense.packageSize) > 0 && (
                  <div className="grid gap-2">
                    <Label>Price per Unit (₵)</Label>
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md">
                      <span className="text-lg font-semibold text-blue-700">
                        ₵
                        {(
                          parseFloat(newExpense.costPerItem) /
                          parseFloat(newExpense.packageSize)
                        ).toFixed(2)}
                      </span>
                      <span className="text-sm text-blue-600 ml-2">
                        per {newExpense.purchaseUnit || "unit"}
                      </span>
                    </div>
                  </div>
                )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddExpenseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                console.log("🔵 Add Expense button clicked!");
                handleAddExpense();
              }}>Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.filter(
            (expense) =>
              expense.category === "Supply" &&
              expense.date.split("T")[0] === supplyDateFilter
          ).length > 0 ? (
            expenses
              .filter(
                (expense) =>
                  expense.category === "Supply" &&
                  expense.date.split("T")[0] === supplyDateFilter
              )
              .map((expense) => (
                <Card key={expense.id} className="h-fit">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{expense.id}</h3>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {expense.category}
                          </Badge>
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
                                Are you sure you want to delete "{expense.items}
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
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

                      {expense.purchaseUnit &&
                        expense.packageSize &&
                        expense.pricePerUnit && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-blue-800">
                                  Package:
                                </span>
                                <span className="text-blue-700">
                                  {expense.packageSize} {expense.purchaseUnit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-blue-800">
                                  Price per Unit:
                                </span>
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
                          <span className="font-bold text-base">
                            ₵{expense.total.toFixed(2)}
                          </span>
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
                  <p className="text-lg font-medium mb-2">
                    No supply expenses found for{" "}
                    {new Date(supplyDateFilter).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Try selecting a different date or add a new supply expense.
                  </p>
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
