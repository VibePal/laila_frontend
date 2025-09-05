import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Package, 
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  purchaseUnit: 'kg' | 'g' | 'L' | 'ml' | 'piece';
  packageSize: number;
  packagePrice: number;
  pricePerUnit: string;
}

const CostMaster = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isAddIngredientDialogOpen, setIsAddIngredientDialogOpen] = useState(false);
  const [isEditIngredientDialogOpen, setIsEditIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    purchaseUnit: "kg" as 'kg' | 'g' | 'L' | 'ml' | 'piece',
    packageSize: "",
    packagePrice: ""
  });

  // Load data
  const loadIngredients = () => {
    try {
      const savedIngredients = localStorage.getItem('ingredients');
      if (savedIngredients) {
        setIngredients(JSON.parse(savedIngredients));
      } else {
        setIngredients([]);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const saveIngredients = (ingredientsList: Ingredient[]) => {
    try {
      localStorage.setItem('ingredients', JSON.stringify(ingredientsList));
    } catch (error) {
      console.error('Error saving ingredients:', error);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  // Helper function to calculate price per unit
  const calculatePricePerUnit = (purchaseUnit: string, packageSize: number, packagePrice: number): string => {
    if (packageSize <= 0) return "0.00";
    
    const pricePerUnit = packagePrice / packageSize;
    
    switch (purchaseUnit) {
      case 'kg':
        const pricePerGram = pricePerUnit / 1000;
        return `₵${pricePerUnit.toFixed(2)}/kg (₵${pricePerGram.toFixed(4)}/g)`;
      case 'g':
        return `₵${pricePerUnit.toFixed(4)}/g`;
      case 'L':
        const pricePerMl = pricePerUnit / 1000;
        return `₵${pricePerUnit.toFixed(2)}/L (₵${pricePerMl.toFixed(4)}/ml)`;
      case 'ml':
        return `₵${pricePerUnit.toFixed(4)}/ml`;
      case 'piece':
        return `₵${pricePerUnit.toFixed(2)}/piece`;
      default:
        return `₵${pricePerUnit.toFixed(2)}`;
    }
  };

  // Ingredient management functions
  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.packageSize && newIngredient.packagePrice) {
      const packageSize = parseFloat(newIngredient.packageSize);
      const packagePrice = parseFloat(newIngredient.packagePrice);
      
      if (packageSize > 0 && packagePrice >= 0) {
        const ingredient: Ingredient = {
          id: Date.now().toString(),
          name: newIngredient.name,
          purchaseUnit: newIngredient.purchaseUnit,
          packageSize: packageSize,
          packagePrice: packagePrice,
          pricePerUnit: calculatePricePerUnit(newIngredient.purchaseUnit, packageSize, packagePrice)
        };
        
        const updatedIngredients = [...ingredients, ingredient];
        setIngredients(updatedIngredients);
        saveIngredients(updatedIngredients);
        
        setNewIngredient({ name: "", purchaseUnit: "kg", packageSize: "", packagePrice: "" });
        setIsAddIngredientDialogOpen(false);
      }
    }
  };

  const handleEditIngredient = () => {
    if (editingIngredient && newIngredient.name && newIngredient.packageSize && newIngredient.packagePrice) {
      const packageSize = parseFloat(newIngredient.packageSize);
      const packagePrice = parseFloat(newIngredient.packagePrice);
      
      if (packageSize > 0 && packagePrice >= 0) {
        const updatedIngredient: Ingredient = {
          ...editingIngredient,
          name: newIngredient.name,
          purchaseUnit: newIngredient.purchaseUnit,
          packageSize: packageSize,
          packagePrice: packagePrice,
          pricePerUnit: calculatePricePerUnit(newIngredient.purchaseUnit, packageSize, packagePrice)
        };
        
        const updatedIngredients = ingredients.map(ing => 
          ing.id === editingIngredient.id ? updatedIngredient : ing
        );
        setIngredients(updatedIngredients);
        saveIngredients(updatedIngredients);
        
        setEditingIngredient(null);
        setNewIngredient({ name: "", purchaseUnit: "kg", packageSize: "", packagePrice: "" });
        setIsEditIngredientDialogOpen(false);
      }
    }
  };

  const handleDeleteIngredient = (ingredientId: string) => {
    const updatedIngredients = ingredients.filter(ing => ing.id !== ingredientId);
    setIngredients(updatedIngredients);
    saveIngredients(updatedIngredients);
  };

  const openEditIngredientDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient({
      name: ingredient.name,
      purchaseUnit: ingredient.purchaseUnit,
      packageSize: ingredient.packageSize.toString(),
      packagePrice: ingredient.packagePrice.toString()
    });
    setIsEditIngredientDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Cost Master</h2>
        <p className="text-muted-foreground">Manage your ingredient costs and pricing</p>
      </div>

      {/* Ingredient Manager Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Ingredient Manager</CardTitle>
              <CardDescription>Manage all ingredients and their pricing</CardDescription>
            </div>
            <Dialog open={isAddIngredientDialogOpen} onOpenChange={setIsAddIngredientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Ingredient</DialogTitle>
                  <DialogDescription>
                    Add a new ingredient with its pricing information. Price per unit will be calculated automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ingredient-name">Ingredient Name</Label>
                    <Input
                      id="ingredient-name"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                      placeholder="Enter ingredient name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ingredient-unit">Purchase Unit</Label>
                    <Select value={newIngredient.purchaseUnit} onValueChange={(value) => setNewIngredient({...newIngredient, purchaseUnit: value as 'kg' | 'g' | 'L' | 'ml' | 'piece'})}>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="ingredient-size">Package Size</Label>
                      <Input
                        id="ingredient-size"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newIngredient.packageSize}
                        onChange={(e) => setNewIngredient({...newIngredient, packageSize: e.target.value})}
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ingredient-price">Package Price (₵)</Label>
                      <Input
                        id="ingredient-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newIngredient.packagePrice}
                        onChange={(e) => setNewIngredient({...newIngredient, packagePrice: e.target.value})}
                        placeholder="e.g., 5.00"
                      />
                    </div>
                  </div>
                  {newIngredient.packageSize && newIngredient.packagePrice && (
                    <div className="grid gap-2">
                      <Label>Price per Unit (Calculated)</Label>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        {calculatePricePerUnit(
                          newIngredient.purchaseUnit, 
                          parseFloat(newIngredient.packageSize) || 0, 
                          parseFloat(newIngredient.packagePrice) || 0
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddIngredientDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddIngredient}>
                    Add Ingredient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ingredients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Purchase Unit</th>
                      <th className="text-left p-3 font-medium">Package Size</th>
                      <th className="text-left p-3 font-medium">Package Price</th>
                      <th className="text-left p-3 font-medium">Price per Unit</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr key={ingredient.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{ingredient.name}</td>
                        <td className="p-3">{ingredient.purchaseUnit}</td>
                        <td className="p-3">{ingredient.packageSize}</td>
                        <td className="p-3">₵{ingredient.packagePrice.toFixed(2)}</td>
                        <td className="p-3 text-sm">{ingredient.pricePerUnit}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditIngredientDialog(ingredient)}
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
                                  <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{ingredient.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteIngredient(ingredient.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No ingredients found</p>
                <p className="text-sm">Add your first ingredient to start managing costs.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Ingredient Dialog */}
      <Dialog open={isEditIngredientDialogOpen} onOpenChange={setIsEditIngredientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update the ingredient information. Price per unit will be recalculated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ingredient-name">Ingredient Name</Label>
              <Input
                id="edit-ingredient-name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                placeholder="Enter ingredient name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ingredient-unit">Purchase Unit</Label>
              <Select value={newIngredient.purchaseUnit} onValueChange={(value) => setNewIngredient({...newIngredient, purchaseUnit: value as 'kg' | 'g' | 'L' | 'ml' | 'piece'})}>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-ingredient-size">Package Size</Label>
                <Input
                  id="edit-ingredient-size"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newIngredient.packageSize}
                  onChange={(e) => setNewIngredient({...newIngredient, packageSize: e.target.value})}
                  placeholder="e.g., 1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ingredient-price">Package Price (₵)</Label>
                <Input
                  id="edit-ingredient-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newIngredient.packagePrice}
                  onChange={(e) => setNewIngredient({...newIngredient, packagePrice: e.target.value})}
                  placeholder="e.g., 5.00"
                />
              </div>
            </div>
            {newIngredient.packageSize && newIngredient.packagePrice && (
              <div className="grid gap-2">
                <Label>Price per Unit (Calculated)</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {calculatePricePerUnit(
                    newIngredient.purchaseUnit, 
                    parseFloat(newIngredient.packageSize) || 0, 
                    parseFloat(newIngredient.packagePrice) || 0
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditIngredientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditIngredient}>
              Update Ingredient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostMaster;
