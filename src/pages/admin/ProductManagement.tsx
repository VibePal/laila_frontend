import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

import { 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  updateProductAvailability, 
  getSupplyExpensesFromAPI,
  getItemsFromAPI,
  createRecipeAPI,
  getRecipesFromAPI,
  deleteRecipeAPI,
  recalculateRecipeCostsAPI,
  createProductAPI,
  getProductsFromAPI,
  getProductByIdFromAPI,
  updateProductAPI,
  deleteProductAPI,
  getProductsByDateFromAPI,
  toggleProductAvailabilityAPI,
  Product, 
  Expense,
  ItemApiResponse,
  RecipeApiResponse,
  RecipeApiRequest,
  ProductApiRequest,
  ProductApiResponse
} from "@/lib/dataService";


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

  ingredients: RecipeIngredient[];

  totalCost: number;

  costPerUnit: number;

}



const ProductManagement = () => {
  const { toast } = useToast();
  const [activeProductTab, setActiveProductTab] = useState("products");

  const [products, setProducts] = useState<Product[]>([]);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [items, setItems] = useState<ItemApiResponse[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({

    name: "",

    unitPrice: "",

    quantity: "",

    date: new Date().toISOString().split('T')[0]

  });

  // Custom product state
  const [isCustomProductDialogOpen, setIsCustomProductDialogOpen] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    quantity: ""
  });

  const [productDateFilter, setProductDateFilter] = useState(new Date().toISOString().split('T')[0]);



  // Recipe state

  const [recipes, setRecipes] = useState<RecipeApiResponse[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");

  const [isAddRecipeDialogOpen, setIsAddRecipeDialogOpen] = useState(false);

  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
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

  const loadProducts = async () => {
    try {
      const response = await getProductsFromAPI();
      if (response.success && response.data) {
        // Convert API response to local Product format for compatibility
        const productsData: Product[] = response.data.map(apiProduct => ({
          id: apiProduct.id,
          name: apiProduct.name,
          unitPrice: apiProduct.unitPrice,
          costPerUnit: apiProduct.costPerUnit,
          quantity: apiProduct.quantity,
          isAvailable: apiProduct.isAvailable,
          isActive: apiProduct.isActive,
          date: apiProduct.date
        }));
        setProducts(productsData);
      } else {
        console.error("❌ Error loading products:", response.error);
        // Fallback to local storage if API fails
    const productsData = getProducts();
    setProducts(productsData);
      }
    } catch (error) {
      console.error("❌ Exception loading products:", error);
      // Fallback to local storage if API fails
      const productsData = getProducts();
      setProducts(productsData);
    }
  };

  const loadProductsByDate = async (date: string) => {
    try {
      const response = await getProductsByDateFromAPI(date);
      if (response.success && response.data) {
        // Convert API response to local Product format for compatibility
        const productsData: Product[] = response.data.map(apiProduct => ({
          id: apiProduct.id,
          name: apiProduct.name,
          unitPrice: apiProduct.unitPrice,
          costPerUnit: apiProduct.costPerUnit,
          quantity: apiProduct.quantity,
          isAvailable: apiProduct.isAvailable,
          isActive: apiProduct.isActive,
          date: apiProduct.date
        }));
        setProducts(productsData);
      } else {
        console.error("❌ Error loading products by date:", response.error);
        // Fallback to loading all products if date filter fails
        await loadProducts();
      }
    } catch (error) {
      console.error("❌ Exception loading products by date:", error);
      // Fallback to loading all products if date filter fails
      await loadProducts();
    }
  };



  const loadExpenses = async () => {
    try {
      console.log("🔵 ProductManagement: Loading expenses from API...");
      const response = await getSupplyExpensesFromAPI();
      if (response.success && response.data) {
        console.log("✅ ProductManagement: Expenses loaded successfully:", response.data);
        setExpenses(response.data);
      } else {
        console.error("❌ ProductManagement: Error loading expenses:", response.error);
        setExpenses([]);
      }
    } catch (error) {

      console.error('❌ ProductManagement: Exception loading expenses:', error);
      setExpenses([]);
    }
  };

  const loadItems = async () => {
    console.log("🔵 ProductManagement: Loading items from API...");
    setIsLoadingItems(true);
    try {
      const response = await getItemsFromAPI();
      console.log("🔵 ProductManagement: Items API response:", response);
      if (response.success && response.data) {
        console.log("✅ ProductManagement: Items loaded successfully:", response.data);
        console.log("🔵 ProductManagement: Items count:", response.data.length);
        console.log("🔵 ProductManagement: First item:", response.data[0]);
        setItems(response.data);
      } else {

        console.error("❌ ProductManagement: Error loading items:", response.error);
        setItems([]);
      }

    } catch (error) {

      console.error('❌ ProductManagement: Exception loading items:', error);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadRecipes = async () => {
    console.log("🔵 ProductManagement: Loading recipes from API...");
    setIsLoadingRecipes(true);
    try {
      const response = await getRecipesFromAPI();
      if (response.success && response.data) {
        console.log("✅ ProductManagement: Recipes loaded successfully:", response.data);
        console.log("🔵 ProductManagement: First recipe structure:", response.data[0]);
        if (response.data[0]?.ingredients) {
          console.log("🔵 ProductManagement: First recipe ingredients:", response.data[0].ingredients);
        }
        setRecipes(response.data);
      } else {
        console.error("❌ ProductManagement: Error loading recipes:", response.error);
        setRecipes([]);
      }
    } catch (error) {

      console.error('❌ ProductManagement: Exception loading recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoadingRecipes(false);
    }

  };




  useEffect(() => {
    const loadAllData = async () => {
      await loadProducts();
      await loadExpenses();
      await loadItems();
      await loadRecipes();
    };
    
    loadAllData();
  }, []);






  // Recipe helper functions

  // Helper function to calculate total cost for recipes with old format
  const calculateRecipeTotalCost = (recipe: RecipeApiResponse): number => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;
    
    return recipe.ingredients.reduce((total, ingredient) => {
      if (ingredient.total_cost) {
        // New format - use provided cost
        return total + ingredient.total_cost;
      } else if (ingredient.cost_per_unit && ingredient.quantity) {
        // New format - calculate from cost per unit
        return total + (ingredient.cost_per_unit * ingredient.quantity);
      } else if ((ingredient as any).ingredientId) {
        // Old format - use calculateIngredientCost for proper unit conversion
        const ingredientId = (ingredient as any).ingredientId;
        const quantity = (ingredient as any).quantity || 0;
        const unit = (ingredient as any).unit || 'kg'; // Default to kg if no unit specified
        
        const cost = calculateIngredientCost(ingredientId, quantity, unit);
        console.log(`🔵 calculateRecipeTotalCost: Old format ingredient cost = ₵${cost}`);
        
        return total + cost;
      }
      return total;
    }, 0);
  };

  // Helper function to calculate cost for API ingredients (fallback)
  const calculateApiIngredientCost = (itemName: string, quantity: number, unit: string): number => {
    // Check if parameters are valid
    if (!itemName || typeof itemName !== 'string') {
      console.log('🔵 calculateApiIngredientCost: Invalid itemName:', itemName);
      return 0;
    }
    
    if (!quantity || quantity <= 0) {
      console.log('🔵 calculateApiIngredientCost: Invalid quantity:', quantity);
      return 0;
    }
    
    if (!unit || typeof unit !== 'string') {
      console.log('🔵 calculateApiIngredientCost: Invalid unit:', unit);
      return 0;
    }

    // Find the most recent expense for this item by name
    const suppliesWithSameName = expenses
      .filter(expense => 
        expense.category === "Supply" && 
        expense.items && 
        itemName &&
        expense.items.toLowerCase() === itemName.toLowerCase() &&
        expense.pricePerUnit
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (suppliesWithSameName.length === 0) {
      console.log('🔵 calculateApiIngredientCost: No supplies found for', itemName);
      return 0;
    }

    const mostRecentSupply = suppliesWithSameName[0];
    let basePricePerUnit = mostRecentSupply.pricePerUnit || 0;

    // Handle unit conversion if needed
    if (unit !== mostRecentSupply.purchaseUnit) {
      // Simple conversion logic - you might want to make this more sophisticated
      console.log('🔵 calculateApiIngredientCost: Unit conversion needed from', mostRecentSupply.purchaseUnit, 'to', unit);
    }

    return quantity * basePricePerUnit;
  };

  const calculateIngredientCost = (ingredientId: string, quantity: number, unit: string): number => {

    // Find the item by ID
    const item = items.find(item => item.id === ingredientId);
    if (!item) {
      console.log('🔵 calculateIngredientCost: Item not found for ID:', ingredientId);
      return 0;
    }

    // Find the most recent expense for this item
    const suppliesWithSameName = expenses

      .filter(expense => 

        expense.category === "Supply" && 

        expense.items.toLowerCase() === item.name.toLowerCase() &&
        expense.pricePerUnit

      )

      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('🔵 calculateIngredientCost: Found supplies for', item.name, ':', suppliesWithSameName.length);

    if (suppliesWithSameName.length === 0) {
      console.log('🔵 calculateIngredientCost: No supplies found for', item.name);
      return 0;
    }

    const mostRecentSupply = suppliesWithSameName[0];

    let basePricePerUnit = mostRecentSupply.pricePerUnit || 0;

    console.log(`💰 COST CALCULATION for ${item.name}:`, {
      itemName: item.name,
      quantity: quantity,
      recipeUnit: unit,
      expensePurchaseUnit: mostRecentSupply.purchaseUnit,
      expensePricePerUnit: mostRecentSupply.pricePerUnit,
      expenseCostPerItem: mostRecentSupply.costPerItem,
      expensePackageSize: mostRecentSupply.packageSize
    });

    if (unit !== mostRecentSupply.purchaseUnit) {

      if (mostRecentSupply.purchaseUnit === 'kg' && unit === 'g') {

        basePricePerUnit = mostRecentSupply.pricePerUnit / 1000; // Convert price per kg to price per g
        console.log(`💰 Unit conversion: kg→g, ${mostRecentSupply.pricePerUnit}/kg → ${basePricePerUnit}/g`);

      } else if (mostRecentSupply.purchaseUnit === 'L' && unit === 'ml') {

        basePricePerUnit = mostRecentSupply.pricePerUnit / 1000; // Convert price per L to price per ml
        console.log(`💰 Unit conversion: L→ml, ${mostRecentSupply.pricePerUnit}/L → ${basePricePerUnit}/ml`);

      } else if (mostRecentSupply.purchaseUnit === 'g' && unit === 'kg') {

        basePricePerUnit = mostRecentSupply.pricePerUnit * 1000; // Convert price per g to price per kg
        console.log(`💰 Unit conversion: g→kg, ${mostRecentSupply.pricePerUnit}/g → ${basePricePerUnit}/kg`);

      } else if (mostRecentSupply.purchaseUnit === 'ml' && unit === 'L') {

        basePricePerUnit = mostRecentSupply.pricePerUnit * 1000; // Convert price per ml to price per L
        console.log(`💰 Unit conversion: ml→L, ${mostRecentSupply.pricePerUnit}/ml → ${basePricePerUnit}/L`);

      }

    }

    const totalCost = quantity * basePricePerUnit;
    console.log(`💰 FINAL COST for ${item.name}: ${quantity}${unit} × ₵${basePricePerUnit} = ₵${totalCost}`);
    
    if (totalCost > 1000) {
      console.error(`🚨 ALERT: Suspiciously high cost (₵${totalCost}) for ${item.name}! Check expense data!`);
    }

    return totalCost;

  };



  const calculateRecipeCosts = (recipeIngredients: RecipeIngredient[], yieldQuantity: number) => {

    const ingredientsCost = recipeIngredients.reduce((total, recipeIngredient) => {

      return total + calculateIngredientCost(recipeIngredient.ingredientId, recipeIngredient.quantity, recipeIngredient.unit);

    }, 0);



    const totalCost = ingredientsCost;

    const costPerUnit = yieldQuantity > 0 ? totalCost / yieldQuantity : 0;



    return {

      ingredientsCost,

      totalCost,

      costPerUnit

    };

  };





  // Get supplies from API items with recent pricing from expenses
  const getSuppliesFromAPI = () => {
    return items.map(item => {
      // Find the most recent expense for this item
      const recentExpense = expenses
        .filter(expense => 
          expense.category === "Supply" && 
          expense.items.toLowerCase() === item.name.toLowerCase()
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        id: item.id,
        name: item.name,
        purchaseUnit: item.unit,
        packageSize: recentExpense?.packageSize || 1,
        pricePerUnit: recentExpense?.pricePerUnit || 0,
        supplier: recentExpense?.supplier || "Unknown",
        date: recentExpense?.date || new Date().toISOString()
      };
    }).filter(supply => supply.pricePerUnit > 0); // Only show items with pricing data
  };


  // Recipe management functions

  const handleAddRecipeIngredient = () => {

    if (newRecipeIngredient.ingredientId && newRecipeIngredient.quantity) {

      const quantity = parseFloat(newRecipeIngredient.quantity);

      if (quantity > 0) {

        // Check if ingredient already exists in the recipe
        const existingIngredientIndex = newRecipe.ingredients.findIndex(
          ingredient => ingredient.ingredientId === newRecipeIngredient.ingredientId
        );

        if (existingIngredientIndex >= 0) {
          // Merge quantities for existing ingredient
          const existingIngredient = newRecipe.ingredients[existingIngredientIndex];
          const mergedQuantity = existingIngredient.quantity + quantity;
          
          const updatedIngredients = [...newRecipe.ingredients];
          updatedIngredients[existingIngredientIndex] = {
            ...existingIngredient,
            quantity: mergedQuantity
          };

          setNewRecipe({
            ...newRecipe,
            ingredients: updatedIngredients
          });

          // Show feedback to user
          const item = items.find(item => item.id === newRecipeIngredient.ingredientId);
          toast({
            title: "Ingredient Merged",
            description: `"${item?.name || 'Unknown'}" already exists. Quantities merged: ${existingIngredient.quantity} + ${quantity} = ${mergedQuantity} ${newRecipeIngredient.unit}`,
            variant: "default"
          });
        } else {
          // Add new ingredient
          const recipeIngredient: RecipeIngredient = {
            ingredientId: newRecipeIngredient.ingredientId,
            quantity: quantity,
            unit: newRecipeIngredient.unit
          };

          setNewRecipe({
            ...newRecipe,
            ingredients: [...newRecipe.ingredients, recipeIngredient]
          });

          // Show success feedback
          const item = items.find(item => item.id === newRecipeIngredient.ingredientId);
          toast({
            title: "Ingredient Added",
            description: `"${item?.name || 'Unknown'}" added to recipe: ${quantity} ${newRecipeIngredient.unit}`,
            variant: "default"
          });
        }

        

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



  const handleAddRecipe = async () => {
    if (newRecipe.name && newRecipe.yieldQuantity && newRecipe.ingredients.length > 0) {
      const yieldQuantity = parseFloat(newRecipe.yieldQuantity);

      

      if (yieldQuantity > 0) {

        try {
          // Validate ingredients before sending
          const validIngredients = newRecipe.ingredients.filter(ingredient => 
            ingredient.ingredientId && ingredient.quantity > 0 && ingredient.unit
          );
          
          if (validIngredients.length === 0) {
            alert("Please add at least one valid ingredient with quantity and unit.");
            return;
          }

          // Convert ingredients to API format
          // The backend expects ingredientId to be a supply expense ID, not an item ID
          const apiIngredients = validIngredients.map(ingredient => {
            // Find the most recent supply expense for this item
            const item = items.find(item => item.id === ingredient.ingredientId);
            if (!item) {
              console.error("❌ Item not found for ingredient:", ingredient.ingredientId);
              return null;
            }
            
            const recentExpense = expenses
              .filter(expense => 
                expense.category === "Supply" && 
                expense.items.toLowerCase() === item.name.toLowerCase()
              )
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            if (!recentExpense) {
              console.error("❌ No supply expense found for item:", item.name);
              return null;
            }
            
            console.log("🔵 Using supply expense ID:", recentExpense.id, "for item:", item.name);
            
            return {
              ingredientId: recentExpense.id, // Use supply expense ID, not item ID
              quantity: ingredient.quantity,
              unit: ingredient.unit
            };
          }).filter(ingredient => ingredient !== null);

          if (apiIngredients.length === 0) {
            alert("No valid supply expenses found for the selected ingredients. Please ensure you have added supply expenses for all ingredients.");
            return;
          }

          // Calculate costs for the recipe
          const { totalCost, costPerUnit } = calculateRecipeCosts(
            newRecipe.ingredients,
            yieldQuantity
          );

          const recipeData: RecipeApiRequest = {
            name: newRecipe.name,
            yieldQuantity: yieldQuantity,
            yieldUnitLabel: "unit",
            totalCost: totalCost,
            costPerUnit: costPerUnit,
            ingredients: apiIngredients
          };

          console.log("🔵 Creating recipe with data:", recipeData);
          console.log("🔵 Recipe ingredients being sent:", apiIngredients);
          console.log("🔵 Available items:", items);
          console.log("🔵 Available expenses:", expenses);
          const response = await createRecipeAPI(recipeData);
          
          if (response.success) {
            console.log("✅ Recipe created successfully:", response.data);
            await loadRecipes(); // Reload recipes from API
        

        setNewRecipe({

          name: "",

          yieldQuantity: "",

          ingredients: []

        });

        setIsAddRecipeDialogOpen(false);

          } else {
            console.error("❌ Error creating recipe:", response.error);
            alert(`Error creating recipe: ${response.error}`);
          }
        } catch (error) {
          console.error("❌ Exception creating recipe:", error);
          alert("Failed to create recipe. Please try again.");
        }
      }
    } else {
      alert("Please fill in all required fields and add at least one ingredient.");
    }
  };


  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      console.log("🔵 Deleting recipe with ID:", recipeId);
      const response = await deleteRecipeAPI(recipeId);
      
      if (response.success) {
        console.log("✅ Recipe deleted successfully");
        await loadRecipes(); // Reload recipes from API
      } else {
        console.error("❌ Error deleting recipe:", response.error);
        alert(`Error deleting recipe: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Exception deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };



  const handleRecalculateCosts = async (recipeId: string) => {
    try {
      console.log("🔵 Recalculating costs for recipe:", recipeId);
      const response = await recalculateRecipeCostsAPI(recipeId);
      
      if (response.success) {
        console.log("✅ Recipe costs recalculated successfully:", response.data);
        await loadRecipes(); // Reload recipes to get updated costs
      } else {
        console.error("❌ Error recalculating recipe costs:", response.error);
        alert(`Error recalculating costs: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Exception recalculating recipe costs:", error);
      alert("Failed to recalculate costs. Please try again.");
    }
  };


  // Product management functions

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.unitPrice && newProduct.quantity) {
      const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);

      // Calculate costPerUnit from the selected recipe, default to 0 if no recipe selected
      const costPerUnit = selectedRecipe ? (() => {
        const totalCost = selectedRecipe.total_cost || calculateRecipeTotalCost(selectedRecipe);
        const yieldQuantity = (selectedRecipe as any).yieldQuantity || selectedRecipe.yield_quantity || 1;
        console.log('🔵 Product creation - Recipe cost calculation:', { 
          selectedRecipe, 
          totalCost, 
          yieldQuantity, 
          costPerUnit: totalCost / yieldQuantity 
        });
        return totalCost / yieldQuantity;
      })() : 0;

      // Convert date to ISO format if it's not already
      const isoDate = newProduct.date.includes('T') 
        ? newProduct.date 
        : new Date(newProduct.date).toISOString();

      const productData: ProductApiRequest = {
        name: newProduct.name,
        unitPrice: parseFloat(newProduct.unitPrice),
        costPerUnit: costPerUnit,
        quantity: parseInt(newProduct.quantity),
        isAvailable: true,
        isActive: true,
        date: isoDate
      };

      try {
        console.log("🔵 Creating product with data:", productData);
        const response = await createProductAPI(productData);
        
        if (response.success) {
          console.log("✅ Product created successfully:", response.data);
          await loadProducts(); // Reload products from API
      setNewProduct({ name: "", unitPrice: "", quantity: "", date: new Date().toISOString().split('T')[0] });
      setIsAddDialogOpen(false);
        } else {
          console.error("❌ Error creating product:", response.error);
          alert(`Error creating product: ${response.error}`);
        }
      } catch (error) {
        console.error("❌ Exception creating product:", error);
        alert("Failed to create product. Please try again.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Custom product management functions
  const handleAddCustomProduct = async () => {
    if (customProduct.name && customProduct.costPrice && customProduct.sellingPrice && customProduct.quantity) {
      const costPrice = parseFloat(customProduct.costPrice);
      const sellingPrice = parseFloat(customProduct.sellingPrice);
      const quantity = parseInt(customProduct.quantity);

      if (costPrice < 0 || sellingPrice < 0 || quantity <= 0) {
        toast({
          title: "Validation Error",
          description: "Cost price and selling price must be non-negative, and quantity must be positive.",
          variant: "destructive"
        });
        return;
      }

      if (sellingPrice < costPrice) {
        toast({
          title: "Warning",
          description: "Selling price is less than cost price. This may result in a loss.",
          variant: "destructive"
        });
      }

      const productData: ProductApiRequest = {
        name: customProduct.name,
        unitPrice: sellingPrice,
        costPerUnit: costPrice,
        quantity: quantity,
        isAvailable: true,
        isActive: true,
        date: new Date().toISOString(),
        isCustom: true // Flag to indicate this is a custom product
      };

      try {
        console.log("🔵 Creating custom product with data:", productData);
        const response = await createProductAPI(productData);
        
        if (response.success) {
          console.log("✅ Custom product created successfully:", response.data);
          await loadProducts(); // Reload products from API
          
          // Reset form
          setCustomProduct({ name: "", costPrice: "", sellingPrice: "", quantity: "" });
          setIsCustomProductDialogOpen(false);
          
          toast({
            title: "Custom Product Added",
            description: `"${customProduct.name}" has been added to your products.`,
            variant: "default"
          });
        } else {
          console.error("❌ Error creating custom product:", response.error);
          toast({
            title: "Error",
            description: `Failed to create custom product: ${response.error}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("❌ Exception creating custom product:", error);
        toast({
          title: "Error",
          description: "Failed to create custom product. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (editingProduct && newProduct.name && newProduct.unitPrice && newProduct.quantity) {
      const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);

      // Calculate costPerUnit from the selected recipe, or keep existing if no recipe selected
      const costPerUnit = selectedRecipe ? (() => {
        const totalCost = selectedRecipe.total_cost || calculateRecipeTotalCost(selectedRecipe);
        const yieldQuantity = (selectedRecipe as any).yieldQuantity || selectedRecipe.yield_quantity || 1;
        return totalCost / yieldQuantity;
      })() : editingProduct.costPerUnit;

      // Convert date to ISO format if it's not already
      const isoDate = newProduct.date.includes('T') 
        ? newProduct.date 
        : new Date(newProduct.date).toISOString();

      const productData: Partial<ProductApiRequest> = {
        name: newProduct.name,
        unitPrice: parseFloat(newProduct.unitPrice),
        costPerUnit: costPerUnit,
        quantity: parseInt(newProduct.quantity),
        date: isoDate
      };

      try {
        console.log("🔵 Updating product with data:", { productId: editingProduct.id, productData });
        const response = await updateProductAPI(editingProduct.id, productData);
        
        if (response.success) {
          console.log("✅ Product updated successfully:", response.data);
          await loadProducts(); // Reload products from API
          setEditingProduct(null);
          setNewProduct({ name: "", unitPrice: "", quantity: "", date: new Date().toISOString().split('T')[0] });
          setIsEditDialogOpen(false);
        } else {
          console.error("❌ Error updating product:", response.error);
          alert(`Error updating product: ${response.error}`);
        }
      } catch (error) {
        console.error("❌ Exception updating product:", error);
        
        // Provide more specific error messages and fallback to local storage
        if (error instanceof Error) {
          if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
            // Fallback to local storage when API is not available
            console.log("🔄 API unavailable, falling back to local storage");
            const updatedProduct: Product = {
        ...editingProduct,
        name: newProduct.name,
        unitPrice: parseFloat(newProduct.unitPrice),
        costPerUnit: costPerUnit,
        quantity: parseInt(newProduct.quantity)
      };
      saveProduct(updatedProduct);
      loadProducts();
      setEditingProduct(null);
      setNewProduct({ name: "", unitPrice: "", quantity: "", date: new Date().toISOString().split('T')[0] });
      setIsEditDialogOpen(false);
            alert("Product updated locally (API unavailable). Please check your server connection.");
          } else if (error.message.includes('API URL not configured')) {
            alert("Configuration error: API URL is not set. Please check your environment variables.");
          } else {
            alert(`Failed to update product: ${error.message}`);
          }
        } else {
          alert("Failed to update product. Please try again.");
        }
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };



  const handleToggleAvailability = async (productId: string) => {
    try {
      console.log("🔵 Toggling product availability for:", productId);
      const response = await toggleProductAvailabilityAPI(productId);
      
      if (response.success) {
        console.log("✅ Product availability toggled successfully:", response.data);
        await loadProducts(); // Reload products from API
      } else {
        console.error("❌ Error toggling product availability:", response.error);
        alert(`Error toggling product availability: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Exception toggling product availability:", error);
      
      // Fallback to local storage when API is not available
      if (error instanceof Error && (error.message.includes('NetworkError') || error.message.includes('fetch'))) {
        console.log("🔄 API unavailable, falling back to local storage");
        const product = products.find(p => p.id === productId);
    if (product) {
      updateProductAvailability(productId, !product.isAvailable);
      loadProducts();
          alert("Product availability toggled locally (API unavailable). Please check your server connection.");
        }
      } else {
        alert("Failed to toggle product availability. Please try again.");
      }
    }
  };



  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log("🔵 Deleting product:", productId);
      const response = await deleteProductAPI(productId);
      
      if (response.success) {
        console.log("✅ Product deleted successfully");
        await loadProducts(); // Reload products from API
      } else {
        console.error("❌ Error deleting product:", response.error);
        alert(`Error deleting product: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Exception deleting product:", error);
      
      // Fallback to local storage when API is not available
      if (error instanceof Error && (error.message.includes('NetworkError') || error.message.includes('fetch'))) {
        console.log("🔄 API unavailable, falling back to local storage");
        deleteProduct(productId);
    loadProducts();
        alert("Product deleted locally (API unavailable). Please check your server connection.");
      } else {
        alert("Failed to delete product. Please try again.");
      }
    }
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

              onChange={(e) => {
                setProductDateFilter(e.target.value);
                loadProductsByDate(e.target.value);
              }}

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

          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">

            <DialogHeader>

              <DialogTitle>Add New Product</DialogTitle>

              <DialogDescription>

                Add a new product to your inventory

              </DialogDescription>

            </DialogHeader>

            <div className="grid gap-4 py-4">

              {/* Recipe Selection */}
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

              {/* Recipe Cost Display - Compact */}
              {newProduct.name && (() => {

                const selectedRecipe = recipes.find(recipe => recipe.name === newProduct.name);

                return selectedRecipe ? (

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-blue-600 font-medium">Cost per {selectedRecipe.yield_unit_label || 'unit'}</span>

                      <span className="text-lg font-bold text-blue-700">₵{(() => {
                        const totalCost = selectedRecipe.total_cost || calculateRecipeTotalCost(selectedRecipe);
                        const yieldQuantity = (selectedRecipe as any).yieldQuantity || selectedRecipe.yield_quantity || 1;
                        return (totalCost / yieldQuantity).toFixed(2);
                      })()}</span>

                    </div>

                  </div>

                ) : null;

              })()}

              {/* Form Fields in Grid */}
              <div className="grid grid-cols-2 gap-4">

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

        {/* Custom Product Dialog */}
        <Dialog open={isCustomProductDialogOpen} onOpenChange={setIsCustomProductDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Custom Product
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Custom Product</DialogTitle>
              <DialogDescription>
                Create a custom product with your own cost and selling prices
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-product-name">Product Name *</Label>
                <Input
                  id="custom-product-name"
                  value={customProduct.name}
                  onChange={(e) => setCustomProduct({...customProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-cost-price">Cost Price (₵) *</Label>
                  <Input
                    id="custom-cost-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customProduct.costPrice}
                    onChange={(e) => setCustomProduct({...customProduct, costPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-selling-price">Selling Price (₵) *</Label>
                  <Input
                    id="custom-selling-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customProduct.sellingPrice}
                    onChange={(e) => setCustomProduct({...customProduct, sellingPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="custom-quantity">Quantity *</Label>
                <Input
                  id="custom-quantity"
                  type="number"
                  min="1"
                  value={customProduct.quantity}
                  onChange={(e) => setCustomProduct({...customProduct, quantity: e.target.value})}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Profit/Loss Preview */}
              {customProduct.costPrice && customProduct.sellingPrice && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Cost Price:</span>
                    <span>₵{parseFloat(customProduct.costPrice || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Selling Price:</span>
                    <span>₵{parseFloat(customProduct.sellingPrice || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <span>Profit/Loss per unit:</span>
                    <span className={parseFloat(customProduct.sellingPrice || '0') >= parseFloat(customProduct.costPrice || '0') ? 'text-green-600' : 'text-red-600'}>
                      ₵{(parseFloat(customProduct.sellingPrice || '0') - parseFloat(customProduct.costPrice || '0')).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCustomProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomProduct}>
                Add Custom Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>



      <div className="grid gap-4">

        {(() => {

          const filteredProducts = products.filter(p => p.isActive);

          return filteredProducts.length > 0 ? (

            filteredProducts.map((product) => (

            <Card key={product.id}>

              <CardContent className="p-6">

                <div className="flex items-center justify-between">

                  <div className="flex-1">

                    <div className="flex items-center gap-3 mb-2">

                      <h3 className="font-semibold text-lg">{product.name}</h3>

                      <Badge variant={product.isAvailable ? "default" : "secondary"}>

                        {product.isAvailable ? "Available" : "Not Available"}

                      </Badge>

                      {(product as any).isCustom && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Custom
                        </Badge>
                      )}

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

                                {isLoadingItems ? (
                                  <div className="flex items-center justify-center p-4">
                                    <span className="text-sm text-muted-foreground">Loading items...</span>
                                  </div>
                                ) : getSuppliesFromAPI().length === 0 ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    No items with pricing data available. Please add supply expenses first.
                                  </div>
                                ) : (
                                  getSuppliesFromAPI().map((supply) => (
                                  <SelectItem key={supply.id} value={supply.id}>

                                    <div className="flex flex-col">

                                      <span>{supply.name}</span>

                                      <span className="text-xs text-muted-foreground">

                                        ₵{supply.pricePerUnit?.toFixed(2)} per {supply.purchaseUnit}

                                      </span>

                                    </div>

                          </SelectItem>

                                  ))
                                )}
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

                              const item = items.find(item => item.id === recipeIngredient.ingredientId);
                              const cost = calculateIngredientCost(recipeIngredient.ingredientId, recipeIngredient.quantity, recipeIngredient.unit);

                              return (

                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">

                                  <div className="flex items-center gap-4">

                                    <span className="font-medium">{item?.name || 'Unknown Item'}</span>
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

                  if (isLoadingRecipes) {
                    return (
                      <div className="text-center text-muted-foreground py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading recipes...</p>
                      </div>
                    );
                  }
                  
                  const filteredRecipes = recipes

                    .filter(recipe =>

                      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())

                    )

                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  return filteredRecipes.length > 0 ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {filteredRecipes.map((recipe) => {
                        // Debug: Log recipe data to console
                        console.log('🔵 Rendering recipe card for:', recipe.name, recipe);
                        return (
                      <Card key={recipe.id}>

                        <CardHeader>

                          <div className="flex items-center justify-between">

                            <div>

                              <CardTitle className="text-lg">{recipe.name}</CardTitle>

                              <CardDescription>

                                Yield: {recipe.yield_quantity} {recipe.yield_unit_label} • {recipe.ingredients?.length || 0} ingredients
                              </CardDescription>

                            </div>

                            <div className="flex items-center gap-2">

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRecalculateCosts(recipe.id)}
                                title="Recalculate costs with latest ingredient prices"
                              >
                                🔄
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

                                {recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients.map((recipeIngredient, index) => {
                                  // Debug: Log ingredient data
                                  console.log('🔵 Recipe ingredient data:', recipeIngredient);
                                  
                                  // Handle both old format (ingredientId) and new format (item_id)
                                  let itemName = 'Unknown Item';
                                  let ingredientCost = 0;
                                  
                                  if (recipeIngredient.item_name) {
                                    // New API format
                                    itemName = recipeIngredient.item_name;
                                    ingredientCost = recipeIngredient.total_cost || 
                                      (recipeIngredient.cost_per_unit && recipeIngredient.quantity ? 
                                        recipeIngredient.cost_per_unit * recipeIngredient.quantity : 0);
                                  } else if ((recipeIngredient as any).ingredientId) {
                                    // Old database format - map ingredientId to supply item name from expenses
                                    console.log('🔵 Looking for supply item with ID:', (recipeIngredient as any).ingredientId);
                                    console.log('🔵 Available expenses:', expenses);
                                    console.log('🔵 Expenses length:', expenses.length);
                                    
                                    // Find the supply item in expenses by matching the ingredientId
                                    // The ingredientId in recipes corresponds to supply items in expenses
                                    const supplyExpense = expenses.find(expense => 
                                      expense.category === "Supply" && 
                                      expense.id === (recipeIngredient as any).ingredientId
                                    );
                                    
                                    if (supplyExpense) {
                                      console.log('🔵 Found supply expense:', supplyExpense);
                                      itemName = supplyExpense.items;
                                      // Calculate cost using proper unit conversion
                                      ingredientCost = calculateIngredientCost(
                                        (recipeIngredient as any).ingredientId, 
                                        recipeIngredient.quantity, 
                                        recipeIngredient.unit || 'kg'
                                      );
                                    } else {
                                      console.log('🔵 Supply expense not found, trying alternative lookup');
                                      // Alternative: try to find by looking at all supply expenses
                                      const allSupplyExpenses = expenses.filter(exp => exp.category === "Supply");
                                      console.log('🔵 All supply expenses:', allSupplyExpenses);
                                      
                                      if (allSupplyExpenses.length > 0) {
                                        // Use the first available supply item as fallback
                                        const fallbackExpense = allSupplyExpenses[0];
                                        itemName = fallbackExpense.items;
                                        // Calculate cost using proper unit conversion
                                        ingredientCost = calculateIngredientCost(
                                          (recipeIngredient as any).ingredientId, 
                                          recipeIngredient.quantity, 
                                          recipeIngredient.unit || 'kg'
                                        );
                                        console.log('🔵 Using fallback supply expense:', fallbackExpense);
                                      } else {
                                        // Last resort: use a default name and zero cost
                                        itemName = `Supply Item ${(recipeIngredient as any).ingredientId}`;
                                        ingredientCost = 0;
                                        console.log('🔵 No supply expenses found, using default values');
                                      }
                                    }
                                  }

                                  return (

                                    <div key={index} className="flex justify-between text-sm">

                                      <span>{itemName} ({recipeIngredient.quantity || 0} {recipeIngredient.unit || 'unit'})</span>
                                      <span className="font-medium">₵{(ingredientCost || 0).toFixed(2)}</span>
                                    </div>

                                  );

                                }) : (
                                  <div className="text-sm text-muted-foreground">

                                    {recipe.ingredients ? `No ingredients (${recipe.ingredients.length})` : 'Ingredients not loaded'}

                                  </div>
                                )}

                              </div>

                            </div>



                            {/* Cost Summary */}

                            <div>

                              <h4 className="font-medium mb-3">Cost Summary</h4>

                              <div className="space-y-2 text-sm">

                                <div className="flex justify-between">

                                  <span>Total Cost:</span>

                                  <span>₵{(() => {
                                    const backendCost = recipe.total_cost;
                                    const frontendCost = calculateRecipeTotalCost(recipe);
                                    const finalCost = backendCost || frontendCost;
                                    
                                    console.log(`🔵 Recipe ${recipe.name} cost calculation:`, {
                                      backendCost,
                                      frontendCost,
                                      finalCost,
                                      hasBackendData: !!backendCost
                                    });
                                    
                                    return finalCost.toFixed(2);
                                  })()}</span>
                                </div>

                                <div className="border-t pt-2 flex justify-between font-bold text-lg">

                                  <span>Cost per {recipe.yield_unit_label || 'unit'}:</span>
                                  <span>₵{(() => {
                                    const backendCost = recipe.total_cost;
                                    const frontendCost = calculateRecipeTotalCost(recipe);
                                    const totalCost = backendCost || frontendCost;
                                    const yieldQuantity = (recipe as any).yieldQuantity || recipe.yield_quantity || 1;
                                    console.log('🔵 Cost per unit calculation:', { totalCost, yieldQuantity, recipe });
                                    return (totalCost / yieldQuantity).toFixed(2);
                                  })()}</span>
                                </div>

                              </div>

                            </div>

                          </div>

                        </CardContent>

                      </Card>
                        );
                      })}

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

