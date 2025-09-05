import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Package, 
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { getProducts, saveProduct, deleteProduct, updateProductAvailability, getExpenses, Product, Expense } from "@/lib/dataService";

// Recipe interfaces
interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'piece';
}

interface Recipe {
  id: string;
  name: string;
  yieldQuantity: number;
  yieldUnitLabel: string;
  packagingCost: number;
  overheadCost: number;
  ingredients: RecipeIngredient[];
  totalCost: number;
  costPerUnit: number;
}

const ProductManagement = () => {
  const [activeProductTab, setActiveProductTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    unitPrice: "",
    quantity: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [productDateFilter, setProductDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [isAddRecipeDialogOpen, setIsAddRecipeDialogOpen] = useState(false);
  const [isEditRecipeDialogOpen, setIsEditRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    yieldQuantity: "",
    ingredients: [] as RecipeIngredient[]
  });
  const [newRecipeIngredient, setNewRecipeIngredient] = useState({
    ingredientId: "",
    quantity: "",
    unit: "g" as 'kg' | 'g' | 'L' | 'ml' | 'piece'
  });

  // Load data
  const loadProducts = () => {
    const productsData = getProducts();
    setProducts(productsData);
  };

  const loadExpenses = () => {
    try {
      const expensesData = getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadRecipes = () => {
    try {
      const savedRecipes = localStorage.getItem('recipes');
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const saveRecipes = (recipesList: Recipe[]) => {
    try {
      localStorage.setItem('recipes', JSON.stringify(recipesList));
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadExpenses();
    loadRecipes();
    initializeDummyData();
  }, []);

  // Initialize dummy data for testing
  const initializeDummyData = () => {
    // Check if dummy data already exists
    const existingExpenses = getExpenses();
    if (existingExpenses.length === 0) {
      const dummyExpenses = [
        {
          id: "EXP-001",
          date: new Date().toISOString().split('T')[0],
          supplier: "Local Market",
          items: "Flour",
          quantity: 5,
          costPerItem: 25.00,
          total: 125.00,
          category: "Supply",
          purchaseUnit: "kg",
          packageSize: 5,
          pricePerUnit: 5.00
        },
        {
          id: "EXP-002",
          date: new Date().toISOString().split('T')[0],
          supplier: "Local Market",
          items: "Sugar",
          quantity: 3,
          costPerItem: 30.00,
          total: 90.00,
          category: "Supply",
          purchaseUnit: "kg",
          packageSize: 3,
          pricePerUnit: 10.00
        },
        {
          id: "EXP-003",
          date: new Date().toISOString().split('T')[0],
          supplier: "Local Market",
          items: "Eggs",
          quantity: 30,
          costPerItem: 45.00,
          total: 1350.00,
          category: "Supply",
          purchaseUnit: "piece",
          packageSize: 30,
          pricePerUnit: 1.50
        },
        {
          id: "EXP-004",
          date: new Date().toISOString().split('T')[0],
          supplier: "Local Market",
          items: "Butter",
          quantity: 2,
          costPerItem: 40.00,
          total: 80.00,
          category: "Supply",
          purchaseUnit: "kg",
          packageSize: 2,
          pricePerUnit: 20.00
        },
        {
          id: "EXP-005",
          date: new Date().toISOString().split('T')[0],
          supplier: "Local Market",
          items: "Milk",
          quantity: 5,
          costPerItem: 35.00,
          total: 175.00,
          category: "Supply",
          purchaseUnit: "L",
          packageSize: 5,
          pricePerUnit: 7.00
        }
      ];

      // Save dummy expenses to localStorage
      dummyExpenses.forEach(expense => {
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        existingExpenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(existingExpenses));
      });

      // Reload expenses
      loadExpenses();
    }

    // Check if dummy recipes already exist
    const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    if (existingRecipes.length === 0) {
      const dummyRecipes = [
        {
          id: "REC-001",
          name: "Chocolate Cake",
          yieldQuantity: 1,
          yieldUnitLabel: "cake",
          packagingCost: 5.00,
          overheadCost: 10.00,
          ingredients: [
            { ingredientId: "EXP-001", quantity: 0.5, unit: "kg" },
            { ingredientId: "EXP-002", quantity: 0.3, unit: "kg" },
            { ingredientId: "EXP-003", quantity: 3, unit: "piece" },
            { ingredientId: "EXP-004", quantity: 0.2, unit: "kg" }
          ],
          totalCost: 45.50,
          costPerUnit: 45.50
        },
        {
          id: "REC-002",
          name: "Vanilla Cupcakes",
          yieldQuantity: 12,
          yieldUnitLabel: "cupcakes",
          packagingCost: 3.00,
          overheadCost: 8.00,
          ingredients: [
            { ingredientId: "EXP-001", quantity: 0.3, unit: "kg" },
            { ingredientId: "EXP-002", quantity: 0.2, unit: "kg" },
            { ingredientId: "EXP-003", quantity: 2, unit: "piece" },
            { ingredientId: "EXP-004", quantity: 0.1, unit: "kg" }
          ],
          totalCost: 28.50,
          costPerUnit: 2.38
        }
      ];

      // Save dummy recipes to localStorage
      localStorage.setItem('recipes', JSON.stringify(dummyRecipes));
      
      // Reload recipes
      loadRecipes();
    }
  };

  // Recipe helper functions
  const calculateIngredientCost = (ingredientId: string, quantity: number, unit: string): number => {
    const supply = expenses.find(expense => 
      expense.id === ingredientId && 
      expense.category === "Supply" && 
      expense.pricePerUnit
    );
    
    if (!supply || !supply.pricePerUnit) return 0;

    const suppliesWithSameName = expenses
      .filter(expense => 
        expense.category === "Supply" && 
        expense.items === supply.items && 
        expense.purchaseUnit === supply.purchaseUnit &&
        expense.pricePerUnit
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const mostRecentSupply = suppliesWithSameName[0];
    let basePricePerUnit = mostRecentSupply.pricePerUnit || 0;
    
    if (unit !== mostRecentSupply.purchaseUnit) {
      if (mostRecentSupply.purchaseUnit === 'kg' && unit === 'g') {
        basePricePerUnit = mostRecentSupply.pricePerUnit / 1000;
      } else if (mostRecentSupply.purchaseUnit === 'L' && unit === 'ml') {
        basePricePerUnit = mostRecentSupply.pricePerUnit / 1000;
      } else if (mostRecentSupply.purchaseUnit === 'g' && unit === 'kg') {
        basePricePerUnit = mostRecentSupply.pricePerUnit * 1000;
      } else if (mostRecentSupply.purchaseUnit === 'ml' && unit === 'L') {
        basePricePerUnit = mostRecentSupply.pricePerUnit * 1000;
      }
    }

    return quantity * basePricePerUnit;
  };

  const calculateRecipeCosts = (recipeIngredients: RecipeIngredient[], packagingCost: number, overheadCost: number, yieldQuantity: number) => {
    const ingredientsCost = recipeIngredients.reduce((total, recipeIngredient) => {
      return total + calculateIngredientCost(recipeIngredient.ingredientId, recipeIngredient.quantity, recipeIngredient.unit);
    }, 0);

    const totalCost = ingredientsCost + packagingCost + overheadCost;
    const costPerUnit = yieldQuantity > 0 ? totalCost / yieldQuantity : 0;

    return {
      ingredientsCost,
      totalCost,
      costPerUnit
    };
  };

  const getSuppliesFromExpenses = () => {
    return expenses
      .filter(expense => expense.category === "Supply" && expense.purchaseUnit && expense.packageSize && expense.pricePerUnit)
      .map(expense => ({
        id: expense.id,
        name: expense.items,
        purchaseUnit: expense.purchaseUnit,
        packageSize: expense.packageSize,
        pricePerUnit: expense.pricePerUnit,
        supplier: expense.supplier,
        date: expense.date
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((supply, index, self) => 
        index === self.findIndex(s => s.name === supply.name && s.purchaseUnit === supply.purchaseUnit)
      );
  };

  // Recipe management functions
  const handleAddRecipeIngredient = () => {
    if (newRecipeIngredient.ingredientId && newRecipeIngredient.quantity) {
      const quantity = parseFloat(newRecipeIngredient.quantity);
      if (quantity > 0) {
        const recipeIngredient: RecipeIngredient = {
          ingredientId: newRecipeIngredient.ingredientId,
          quantity: quantity,
          unit: newRecipeIngredient.unit
        };
        
        setNewRecipe({
          ...newRecipe,
          ingredients: [...newRecipe.ingredients, recipeIngredient]
        });
        
        setNewRecipeIngredient({
          ingredientId: "",
          quantity: "",
          unit: "g"
        });
      }
    }
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    });
  };

  const handleAddRecipe = () => {
    if (newRecipe.name && newRecipe.yieldQuantity) {
      const yieldQuantity = parseFloat(newRecipe.yieldQuantity);
      
      if (yieldQuantity > 0) {
        const { totalCost, costPerUnit } = calculateRecipeCosts(
          newRecipe.ingredients,
          0,
          0,
          yieldQuantity
        );

        const recipe: Recipe = {
          id: Date.now().toString(),
          name: newRecipe.name,
          yieldQuantity: yieldQuantity,
          yieldUnitLabel: "unit",
          packagingCost: 0,
          overheadCost: 0,
          ingredients: newRecipe.ingredients,
          totalCost: totalCost,
          costPerUnit: costPerUnit
        };
        
        const updatedRecipes = [...recipes, recipe];
        setRecipes(updatedRecipes);
        saveRecipes(updatedRecipes);
        
        setNewRecipe({
          name: "",
          yieldQuantity: "",
          ingredients: []
        });
        setIsAddRecipeDialogOpen(false);
      }
    }
  };

  const handleEditRecipe = () => {
    if (editingRecipe && newRecipe.name && newRecipe.yieldQuantity) {
      const yieldQuantity = parseFloat(newRecipe.yieldQuantity);
      
      if (yieldQuantity > 0) {
        const { totalCost, costPerUnit } = calculateRecipeCosts(
          newRecipe.ingredients,
          0,
          0,
          yieldQuantity
        );

        const updatedRecipe: Recipe = {
          ...editingRecipe,
          name: newRecipe.name,
          yieldQuantity: yieldQuantity,
          yieldUnitLabel: "unit",
          packagingCost: 0,
          overheadCost: 0,
          ingredients: newRecipe.ingredients,
          totalCost: totalCost,
          costPerUnit: costPerUnit
        };
        
        const updatedRecipes = recipes.map(recipe => 
          recipe.id === editingRecipe.id ? updatedRecipe : recipe
        );
        setRecipes(updatedRecipes);
        saveRecipes(updatedRecipes);
        
        setEditingRecipe(null);
        setNewRecipe({
          name: "",
          yieldQuantity: "",
          ingredients: []
        });
        setIsEditRecipeDialogOpen(false);
      }
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  const openEditRecipeDialog = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      yieldQuantity: recipe.yieldQuantity.toString(),
      ingredients: recipe.ingredients
    });
    setIsEditRecipeDialogOpen(true);
  };

  // Product management functions
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.unitPrice && newProduct.quantity) {
      const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);
      const category = selectedRecipe ? `Recipe - ${selectedRecipe.name}` : "Custom Product";
      const costPerUnit = selectedRecipe ? selectedRecipe.costPerUnit : 0;
      
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        category: category,
        unitPrice: parseFloat(newProduct.unitPrice),
        costPerUnit: costPerUnit,
        quantity: parseInt(newProduct.quantity),
        isAvailable: true,
        isActive: true,
        date: newProduct.date
      };
      
      saveProduct(product);
      loadProducts();
      
      setNewProduct({ name: "", unitPrice: "", quantity: "", date: new Date().toISOString().split('T')[0] });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditProduct = () => {
    if (editingProduct && newProduct.name && newProduct.unitPrice && newProduct.quantity) {
      const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);
      const category = selectedRecipe ? `Recipe - ${selectedRecipe.name}` : "Custom Product";
      const costPerUnit = selectedRecipe ? selectedRecipe.costPerUnit : editingProduct.costPerUnit;
      
      const updatedProduct: Product = {
        ...editingProduct,
        name: newProduct.name,
        category: category,
        unitPrice: parseFloat(newProduct.unitPrice),
        costPerUnit: costPerUnit,
        quantity: parseInt(newProduct.quantity)
      };
      
      saveProduct(updatedProduct);
      loadProducts();
      
      setEditingProduct(null);
      setNewProduct({ name: "", unitPrice: "", quantity: "", date: new Date().toISOString().split('T')[0] });
      setIsEditDialogOpen(false);
    }
  };

  const handleToggleAvailability = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProductAvailability(productId, !product.isAvailable);
      loadProducts();
    }
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    loadProducts();
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      unitPrice: product.unitPrice.toString(),
      quantity: product.quantity.toString(),
      date: product.date || new Date().toISOString().split('T')[0]
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <Tabs value={activeProductTab} onValueChange={setActiveProductTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="recipe-master">Recipe Master</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        <Tabs value={activeProductTab} onValueChange={setActiveProductTab} className="w-full h-full">

        <TabsContent value="products" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="product-date-filter">Select Date</Label>
            <Input
              id="product-date-filter"
              type="date"
              value={productDateFilter}
              onChange={(e) => setProductDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory. Fill in all the required fields.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipe-select">Select Recipe</Label>
                <Select value={newProduct.name} onValueChange={(value) => {
                  setNewProduct({
                    ...newProduct, 
                    name: value
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipe" />
                    </SelectTrigger>
                    <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.name}>
                        {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
              {newProduct.name && (() => {
                const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);
                return selectedRecipe ? (
                  <div className="grid gap-2">
                    <Label>Recipe Cost</Label>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Cost per {selectedRecipe.yieldUnitLabel}</p>
                          <p className="text-xs text-blue-500">Based on ingredient costs and overhead</p>
              </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">₵{selectedRecipe.costPerUnit.toFixed(2)}</p>
                          <p className="text-xs text-blue-500">Total: ₵{selectedRecipe.totalCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
              
                <div className="grid gap-2">
                <Label htmlFor="unitPrice">Selling Price (₵)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity Available</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-date">Date</Label>
                <Input
                  id="product-date"
                  type="date"
                  value={newProduct.date}
                  onChange={(e) => setNewProduct({...newProduct, date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(() => {
          const filteredProducts = products.filter(p => p.isActive && p.date === productDateFilter);
          return filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant={product.isAvailable ? "default" : "secondary"}>
                        {product.isAvailable ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Unit Price:</span> ₵{product.unitPrice.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Cost per Unit:</span> ₵{product.costPerUnit.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {product.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`availability-${product.id}`} className="text-sm">Available</Label>
                      <Switch
                        id={`availability-${product.id}`}
                        checked={product.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(product.id)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                <p className="text-lg font-medium mb-2">No products found for {productDateFilter}</p>
                <p className="text-sm">Add your first product for this date to get started with inventory management.</p>
              </div>
            </CardContent>
          </Card>
        );
        })()}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="edit-unitPrice">Selling Price (₵)</Label>
                  <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={newProduct.unitPrice}
                  onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity Available</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-date">Date</Label>
              <Input
                id="edit-product-date"
                type="date"
                value={newProduct.date}
                onChange={(e) => setNewProduct({...newProduct, date: e.target.value})}
              />
            </div>
          </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct}>
                Update Product
              </Button>
            </div>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="recipe-master" className="space-y-6">

          {/* Recipes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search recipes..."
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Dialog open={isAddRecipeDialogOpen} onOpenChange={setIsAddRecipeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Recipe</DialogTitle>
                      <DialogDescription>
                        Create a new recipe with ingredients and costs. All costs will be calculated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Recipe Basic Info */}
                      <div className="grid gap-2">
                        <Label htmlFor="recipe-name">Recipe Name</Label>
                        <Input
                          id="recipe-name"
                          value={newRecipe.name}
                          onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                          placeholder="Enter recipe name"
                        />
                      </div>


                      {/* Ingredients Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Ingredients</h4>
                        
                        {/* Add Ingredient Form */}
                        <div className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
            <div className="grid gap-2">
                            <Label htmlFor="recipe-ingredient">Supply Item</Label>
                            <Select value={newRecipeIngredient.ingredientId} onValueChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, ingredientId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supply item" />
                  </SelectTrigger>
                  <SelectContent>
                                {getSuppliesFromExpenses().map((supply) => (
                                  <SelectItem key={supply.id} value={supply.id}>
                                    <div className="flex flex-col">
                                      <span>{supply.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ₵{supply.pricePerUnit?.toFixed(2)} per {supply.purchaseUnit}
                                      </span>
                                    </div>
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                            <Label htmlFor="recipe-quantity">Quantity</Label>
                <Input
                              id="recipe-quantity"
                  type="number"
                min="0"
                  step="0.01"
                              value={newRecipeIngredient.quantity}
                              onChange={(e) => setNewRecipeIngredient({...newRecipeIngredient, quantity: e.target.value})}
                  placeholder="0"
                  />
                </div>
              <div className="grid gap-2">
                            <Label htmlFor="recipe-unit">Unit</Label>
                            <Select value={newRecipeIngredient.unit} onValueChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, unit: value as 'kg' | 'g' | 'L' | 'ml' | 'piece'})}>
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
                          <div className="flex items-end">
                            <Button onClick={handleAddRecipeIngredient} className="w-full">
                              Add
                            </Button>
                          </div>
                        </div>

                        {/* Ingredients List */}
                        {newRecipe.ingredients.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Added Ingredients:</h5>
                            {newRecipe.ingredients.map((recipeIngredient, index) => {
                              const supply = expenses.find(expense => expense.id === recipeIngredient.ingredientId && expense.category === "Supply");
                              const cost = calculateIngredientCost(recipeIngredient.ingredientId, recipeIngredient.quantity, recipeIngredient.unit);
                              return (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <span className="font-medium">{supply?.items || 'Unknown Supply'}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {recipeIngredient.quantity} {recipeIngredient.unit}
                                    </span>
                                    <span className="text-sm font-medium">₵{cost.toFixed(2)}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveRecipeIngredient(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Yield Quantity */}
                      <div className="grid gap-2">
                        <Label htmlFor="recipe-yield-quantity">Yield Quantity</Label>
                        <Input
                          id="recipe-yield-quantity"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newRecipe.yieldQuantity}
                          onChange={(e) => setNewRecipe({...newRecipe, yieldQuantity: e.target.value})}
                          placeholder="e.g., 12"
                        />
                      </div>



                      {/* Cost Summary */}
                      {newRecipe.ingredients.length > 0 && newRecipe.yieldQuantity && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-medium">Cost Summary</h4>
                          {(() => {
                            const yieldQuantity = parseFloat(newRecipe.yieldQuantity) || 0;
                            const { ingredientsCost, totalCost, costPerUnit } = calculateRecipeCosts(
                              newRecipe.ingredients,
                              0,
                              0,
                              yieldQuantity
                            );
                            
                            return (
                              <div className="space-y-3">
                                {/* Ingredients Cost - Always shown first */}
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                  <span className="text-sm font-medium text-blue-700">Ingredients Cost:</span>
                                  <span className="text-lg font-bold text-blue-700">₵{ingredientsCost.toFixed(2)}</span>
                                </div>
                                

                                
                                {/* Total Cost - Updated when additional costs are added */}
                                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-t">
                                  <span className="text-sm font-medium">Total Cost:</span>
                                  <span className="text-lg font-bold">₵{totalCost.toFixed(2)}</span>
                                </div>
                                
                                {/* Cost per Unit */}
                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                  <span className="text-sm text-muted-foreground">Cost per unit:</span>
                                  <span className="text-xl font-bold">₵{costPerUnit.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
          </div>
            <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsAddRecipeDialogOpen(false)}>
                Cancel
              </Button>
                      <Button onClick={handleAddRecipe}>
                        Add Recipe
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const filteredRecipes = recipes
                    .filter(recipe =>
                      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())
                    )
                    .sort((a, b) => parseInt(b.id.replace(/\D/g, '')) - parseInt(a.id.replace(/\D/g, '')));
                  return filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRecipes.map((recipe) => (
                      <Card key={recipe.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{recipe.name}</CardTitle>
                              <CardDescription>
                                Yield: {recipe.yieldQuantity} {recipe.yieldUnitLabel}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditRecipeDialog(recipe)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Ingredients List */}
                            <div>
                              <h4 className="font-medium mb-3">Ingredients</h4>
                              <div className="space-y-2">
                                {recipe.ingredients.map((recipeIngredient, index) => {
                                  const supply = expenses.find(expense => expense.id === recipeIngredient.ingredientId && expense.category === "Supply");
                                  const cost = calculateIngredientCost(recipeIngredient.ingredientId, recipeIngredient.quantity, recipeIngredient.unit);
                                  return (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{supply?.items || 'Unknown Supply'} ({recipeIngredient.quantity} {recipeIngredient.unit})</span>
                                      <span className="font-medium">₵{cost.toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Cost Summary */}
                            <div>
                              <h4 className="font-medium mb-3">Cost Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Ingredients Cost:</span>
                                  <span>₵{recipe.totalCost.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                  <span>Cost per {recipe.yieldUnitLabel}:</span>
                                  <span>₵{recipe.costPerUnit.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {recipeSearch ? 'No recipes found matching your search' : 'No recipes found'}
                    </p>
                    <p className="text-sm">
                      {recipeSearch ? 'Try adjusting your search terms' : 'Add your first recipe to start managing costs.'}
                    </p>
                  </div>
                );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default ProductManagement;
