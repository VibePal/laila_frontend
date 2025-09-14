import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Settings as SettingsIcon, 
  Plus,
  Edit,
  Trash2,
  Building,
  Package,
  ShoppingBag,
  DollarSign,
  Loader2
} from "lucide-react";
import { 
  createSupplier,
  getSuppliersFromAPI,
  updateSupplierAPI,
  deleteSupplierAPI,
  createItem,
  getItemsFromAPI,
  updateItemAPI,
  deleteItemAPI,
  createPackagingType,
  getPackagingTypesFromAPI,
  updatePackagingTypeAPI,
  deletePackagingTypeAPI,
  createOverheadCostType,
  getOverheadCostTypesFromAPI,
  updateOverheadCostTypeAPI,
  deleteOverheadCostTypeAPI,
  SupplierApiResponse,
  ItemApiResponse,
  PackagingTypeApiResponse,
  OverheadCostTypeApiResponse,
  ApiResponse 
} from "@/lib/dataService";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PackagingType {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface OverheadCostType {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("suppliers");
  const { toast } = useToast();
  
  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isEditSupplierDialogOpen, setIsEditSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    address: ""
  });
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [isUpdatingSupplier, setIsUpdatingSupplier] = useState(false);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

  // Items state
  const [items, setItems] = useState<Item[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    unit: ""
  });
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Packaging Types state
  const [packagingTypes, setPackagingTypes] = useState<PackagingType[]>([]);
  const [isAddPackagingDialogOpen, setIsAddPackagingDialogOpen] = useState(false);
  const [isEditPackagingDialogOpen, setIsEditPackagingDialogOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<PackagingType | null>(null);
  const [newPackaging, setNewPackaging] = useState<{
    name: string;
    description: string;
    price: string;
  }>({
    name: "",
    description: "",
    price: ""
  });
  const [isLoadingPackagingTypes, setIsLoadingPackagingTypes] = useState(false);
  const [isCreatingPackagingType, setIsCreatingPackagingType] = useState(false);
  const [isUpdatingPackagingType, setIsUpdatingPackagingType] = useState(false);
  const [isDeletingPackagingType, setIsDeletingPackagingType] = useState(false);

  // Overhead Cost Types state
  const [overheadCostTypes, setOverheadCostTypes] = useState<OverheadCostType[]>([]);
  const [isAddOverheadCostDialogOpen, setIsAddOverheadCostDialogOpen] = useState(false);
  const [isEditOverheadCostDialogOpen, setIsEditOverheadCostDialogOpen] = useState(false);
  const [editingOverheadCost, setEditingOverheadCost] = useState<OverheadCostType | null>(null);
  const [newOverheadCost, setNewOverheadCost] = useState({
    name: ""
  });
  const [isLoadingOverheadCostTypes, setIsLoadingOverheadCostTypes] = useState(false);
  const [isCreatingOverheadCostType, setIsCreatingOverheadCostType] = useState(false);
  const [isUpdatingOverheadCostType, setIsUpdatingOverheadCostType] = useState(false);
  const [isDeletingOverheadCostType, setIsDeletingOverheadCostType] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadSuppliers();
    loadItems();
    loadPackagingTypes();
    loadOverheadCostTypes();
  }, []);

  // Suppliers functions
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

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSupplier(true);
    try {
      const response: ApiResponse<SupplierApiResponse> = await createSupplier({
        name: newSupplier.name.trim(),
        contact: newSupplier.contact.trim(),
        address: newSupplier.address.trim()
      });

      if (response.success && response.data) {
        setSuppliers([...suppliers, response.data]);
        setNewSupplier({ name: "", contact: "", address: "" });
        setIsAddSupplierDialogOpen(false);
        toast({
          title: "Success",
          description: "Supplier created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!editingSupplier || !newSupplier.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingSupplier(true);
    try {
      const response: ApiResponse<SupplierApiResponse> = await updateSupplierAPI(editingSupplier.id, {
        name: newSupplier.name.trim(),
        contact: newSupplier.contact.trim(),
        address: newSupplier.address.trim()
      });

      if (response.success && response.data) {
        const updatedSuppliers = suppliers.map(s => 
          s.id === editingSupplier.id ? response.data! : s
        );
        setSuppliers(updatedSuppliers);
        setEditingSupplier(null);
        setNewSupplier({ name: "", contact: "", address: "" });
        setIsEditSupplierDialogOpen(false);
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSupplier(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    setIsDeletingSupplier(true);
    try {
      const response: ApiResponse<void> = await deleteSupplierAPI(supplierId);
      
      if (response.success) {
        const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
        setSuppliers(updatedSuppliers);
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSupplier(false);
    }
  };

  const openEditSupplierDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address
    });
    setIsEditSupplierDialogOpen(true);
  };

  // Items functions
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

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Item name and unit are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingItem(true);
    try {
      const response: ApiResponse<ItemApiResponse> = await createItem({
        name: newItem.name.trim(),
        unit: newItem.unit.trim()
      });

      if (response.success && response.data) {
        setItems([...items, response.data]);
        setNewItem({ name: "", unit: "" });
        setIsAddItemDialogOpen(false);
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !newItem.name.trim() || !newItem.unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Item name and unit are required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingItem(true);
    try {
      const response: ApiResponse<ItemApiResponse> = await updateItemAPI(editingItem.id, {
        name: newItem.name.trim(),
        unit: newItem.unit.trim()
      });

      if (response.success && response.data) {
        const updatedItems = items.map(item => 
          item.id === editingItem.id ? response.data! : item
        );
        setItems(updatedItems);
        setEditingItem(null);
        setNewItem({ name: "", unit: "" });
        setIsEditItemDialogOpen(false);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setIsDeletingItem(true);
    try {
      const response: ApiResponse<void> = await deleteItemAPI(itemId);
      
      if (response.success) {
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const openEditItemDialog = (item: Item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      unit: item.unit
    });
    setIsEditItemDialogOpen(true);
  };

  // Packaging Types functions
  const loadPackagingTypes = async () => {
    setIsLoadingPackagingTypes(true);
    try {
      const response: ApiResponse<PackagingTypeApiResponse[]> = await getPackagingTypesFromAPI();
      if (response.success && response.data) {
        setPackagingTypes(response.data);
      } else {
        console.error('Failed to load packaging types:', response.error);
        setPackagingTypes([]);
        toast({
          title: "Error",
          description: response.error || "Failed to load packaging types",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading packaging types:', error);
      setPackagingTypes([]);
      toast({
        title: "Error",
        description: "Failed to load packaging types",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPackagingTypes(false);
    }
  };

  const handleAddPackaging = async () => {
    if (!newPackaging.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Packaging type name is required",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(newPackaging.price);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPackagingType(true);
    try {
      const response: ApiResponse<PackagingTypeApiResponse> = await createPackagingType({
        name: newPackaging.name.trim(),
        description: newPackaging.description.trim() || undefined,
        price: price
      });

      if (response.success && response.data) {
        setPackagingTypes([...packagingTypes, response.data]);
        setNewPackaging({ name: "", description: "", price: "" });
        setIsAddPackagingDialogOpen(false);
        toast({
          title: "Success",
          description: "Packaging type created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create packaging type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating packaging type:', error);
      toast({
        title: "Error",
        description: "Failed to create packaging type",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPackagingType(false);
    }
  };

  const handleEditPackaging = async () => {
    if (!editingPackaging || !newPackaging.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Packaging type name is required",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(newPackaging.price);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPackagingType(true);
    try {
      const response: ApiResponse<PackagingTypeApiResponse> = await updatePackagingTypeAPI(editingPackaging.id, {
        name: newPackaging.name.trim(),
        description: newPackaging.description.trim() || undefined,
        price: price
      });

      if (response.success && response.data) {
        const updatedPackagingTypes = packagingTypes.map(packaging => 
          packaging.id === editingPackaging.id ? response.data! : packaging
        );
        setPackagingTypes(updatedPackagingTypes);
        setEditingPackaging(null);
        setNewPackaging({ name: "", description: "", price: "" });
        setIsEditPackagingDialogOpen(false);
        toast({
          title: "Success",
          description: "Packaging type updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update packaging type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating packaging type:', error);
      toast({
        title: "Error",
        description: "Failed to update packaging type",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPackagingType(false);
    }
  };

  const handleDeletePackaging = async (packagingId: string) => {
    setIsDeletingPackagingType(true);
    try {
      const response: ApiResponse<void> = await deletePackagingTypeAPI(packagingId);
      
      if (response.success) {
        const updatedPackagingTypes = packagingTypes.filter(packaging => packaging.id !== packagingId);
        setPackagingTypes(updatedPackagingTypes);
        toast({
          title: "Success",
          description: "Packaging type deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete packaging type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting packaging type:', error);
      toast({
        title: "Error",
        description: "Failed to delete packaging type",
        variant: "destructive",
      });
    } finally {
      setIsDeletingPackagingType(false);
    }
  };

  const openEditPackagingDialog = (packaging: PackagingType) => {
    setEditingPackaging(packaging);
    setNewPackaging({
      name: packaging.name,
      description: packaging.description || "",
      price: packaging.price ? packaging.price.toString() : ""
    });
    setIsEditPackagingDialogOpen(true);
  };

  // Overhead Cost Types functions
  const loadOverheadCostTypes = async () => {
    setIsLoadingOverheadCostTypes(true);
    try {
      const response: ApiResponse<OverheadCostTypeApiResponse[]> = await getOverheadCostTypesFromAPI();
      if (response.success && response.data) {
        setOverheadCostTypes(response.data);
      } else {
        console.error('Failed to load overhead cost types:', response.error);
        setOverheadCostTypes([]);
        toast({
          title: "Error",
          description: response.error || "Failed to load overhead cost types",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading overhead cost types:', error);
      setOverheadCostTypes([]);
      toast({
        title: "Error",
        description: "Failed to load overhead cost types",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOverheadCostTypes(false);
    }
  };

  const handleAddOverheadCost = async () => {
    if (!newOverheadCost.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Overhead cost type name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingOverheadCostType(true);
    try {
      const response: ApiResponse<OverheadCostTypeApiResponse> = await createOverheadCostType({
        name: newOverheadCost.name.trim()
      });

      if (response.success && response.data) {
        setOverheadCostTypes([...overheadCostTypes, response.data]);
        setNewOverheadCost({ name: "" });
        setIsAddOverheadCostDialogOpen(false);
        toast({
          title: "Success",
          description: "Overhead cost type created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create overhead cost type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating overhead cost type:', error);
      toast({
        title: "Error",
        description: "Failed to create overhead cost type",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOverheadCostType(false);
    }
  };

  const handleEditOverheadCost = async () => {
    if (!editingOverheadCost || !newOverheadCost.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Overhead cost type name is required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingOverheadCostType(true);
    try {
      const response: ApiResponse<OverheadCostTypeApiResponse> = await updateOverheadCostTypeAPI(editingOverheadCost.id, {
        name: newOverheadCost.name.trim()
      });

      if (response.success && response.data) {
        const updatedOverheadCostTypes = overheadCostTypes.map(overheadCost => 
          overheadCost.id === editingOverheadCost.id ? response.data! : overheadCost
        );
        setOverheadCostTypes(updatedOverheadCostTypes);
        setEditingOverheadCost(null);
        setNewOverheadCost({ name: "" });
        setIsEditOverheadCostDialogOpen(false);
        toast({
          title: "Success",
          description: "Overhead cost type updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update overhead cost type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating overhead cost type:', error);
      toast({
        title: "Error",
        description: "Failed to update overhead cost type",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingOverheadCostType(false);
    }
  };

  const handleDeleteOverheadCost = async (overheadCostId: string) => {
    setIsDeletingOverheadCostType(true);
    try {
      const response: ApiResponse<void> = await deleteOverheadCostTypeAPI(overheadCostId);
      
      if (response.success) {
        const updatedOverheadCostTypes = overheadCostTypes.filter(overheadCost => overheadCost.id !== overheadCostId);
        setOverheadCostTypes(updatedOverheadCostTypes);
        toast({
          title: "Success",
          description: "Overhead cost type deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete overhead cost type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting overhead cost type:', error);
      toast({
        title: "Error",
        description: "Failed to delete overhead cost type",
        variant: "destructive",
      });
    } finally {
      setIsDeletingOverheadCostType(false);
    }
  };

  const openEditOverheadCostDialog = (overheadCost: OverheadCostType) => {
    setEditingOverheadCost(overheadCost);
    setNewOverheadCost({
      name: overheadCost.name
    });
    setIsEditOverheadCostDialogOpen(true);
  };

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 bg-background z-10 pb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="packaging" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packaging Types
            </TabsTrigger>
            <TabsTrigger value="overhead" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Overhead Costs
            </TabsTrigger>
          </TabsList>
      </div>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
      <div>
                  <CardTitle>Suppliers</CardTitle>
            <CardDescription>
                    Manage your suppliers for the add supply expense form.
            </CardDescription>
      </div>
                <Button onClick={() => setIsAddSupplierDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
          </CardHeader>
          <CardContent>
              {isLoadingSuppliers ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading suppliers...</p>
                </div>
              ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No suppliers added yet.</p>
                  <p className="text-sm">Add your first supplier to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{supplier.name}</h3>
                        {supplier.contact && (
                          <p className="text-sm text-muted-foreground">Contact: {supplier.contact}</p>
                        )}
                        {supplier.address && (
                          <p className="text-sm text-muted-foreground">Address: {supplier.address}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSupplierDialog(supplier)}
                          disabled={isUpdatingSupplier || isDeletingSupplier}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isUpdatingSupplier || isDeletingSupplier}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{supplier.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                disabled={isDeletingSupplier}
                              >
                                {isDeletingSupplier ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
            </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Items</CardTitle>
            <CardDescription>
                    Manage your items for the add supply expense form.
            </CardDescription>
                </div>
                <Button onClick={() => setIsAddItemDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
          </CardHeader>
          <CardContent>
              {isLoadingItems ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet.</p>
                  <p className="text-sm">Add your first item to get started.</p>
            </div>
              ) : (
            <div className="grid gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{item.unit}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditItemDialog(item)}
                          disabled={isUpdatingItem || isDeletingItem}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isUpdatingItem || isDeletingItem}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={isDeletingItem}
                              >
                                {isDeletingItem ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Packaging Types Tab */}
        <TabsContent value="packaging" className="space-y-4">
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Packaging Types</CardTitle>
            <CardDescription>
                    Manage packaging types for selecting categories in packaging costs.
            </CardDescription>
                </div>
                <Button onClick={() => setIsAddPackagingDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Packaging Type
                </Button>
              </div>
          </CardHeader>
          <CardContent>
              {isLoadingPackagingTypes ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading packaging types...</p>
                </div>
              ) : packagingTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No packaging types added yet.</p>
                  <p className="text-sm">Add your first packaging type to get started.</p>
                </div>
              ) : (
            <div className="grid gap-4">
                  {packagingTypes.map((packaging) => (
                    <div key={packaging.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{packaging.name}</h3>
                        {packaging.description && (
                          <p className="text-sm text-muted-foreground mt-1">{packaging.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Price: GHS {(packaging.price || 0).toFixed(2)}</p>
              </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditPackagingDialog(packaging)}
                          disabled={isUpdatingPackagingType || isDeletingPackagingType}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isUpdatingPackagingType || isDeletingPackagingType}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Packaging Type</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{packaging.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePackaging(packaging.id)}
                                disabled={isDeletingPackagingType}
                              >
                                {isDeletingPackagingType ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
              </div>
              </div>
                  ))}
            </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Overhead Costs Tab */}
        <TabsContent value="overhead" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overhead Cost Types</CardTitle>
                  <CardDescription>
                    Manage overhead cost types for categorizing business expenses.
                  </CardDescription>
      </div>
                <Button onClick={() => setIsAddOverheadCostDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Overhead Cost Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOverheadCostTypes ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading overhead cost types...</p>
                </div>
              ) : overheadCostTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No overhead cost types added yet.</p>
                  <p className="text-sm">Add your first overhead cost type to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {overheadCostTypes.map((overheadCost) => (
                    <div key={overheadCost.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{overheadCost.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditOverheadCostDialog(overheadCost)}
                          disabled={isUpdatingOverheadCostType || isDeletingOverheadCostType}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isUpdatingOverheadCostType || isDeletingOverheadCostType}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Overhead Cost Type</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{overheadCost.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteOverheadCost(overheadCost.id)}
                                disabled={isDeletingOverheadCostType}
                              >
                                {isDeletingOverheadCostType ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier for your supply expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplier-name">Supplier Name *</Label>
              <Input
                id="supplier-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label htmlFor="supplier-contact">Contact (Optional)</Label>
              <Input
                id="supplier-contact"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                placeholder="Phone number or email"
              />
            </div>
            <div>
              <Label htmlFor="supplier-address">Address (Optional)</Label>
              <Input
                id="supplier-address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                placeholder="Supplier address"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddSupplierDialogOpen(false)}
              disabled={isCreatingSupplier}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSupplier}
              disabled={isCreatingSupplier}
            >
              {isCreatingSupplier ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Supplier"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditSupplierDialogOpen} onOpenChange={setIsEditSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-supplier-name">Supplier Name *</Label>
              <Input
                id="edit-supplier-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label htmlFor="edit-supplier-contact">Contact (Optional)</Label>
              <Input
                id="edit-supplier-contact"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                placeholder="Phone number or email"
              />
            </div>
            <div>
              <Label htmlFor="edit-supplier-address">Address (Optional)</Label>
              <Input
                id="edit-supplier-address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                placeholder="Supplier address"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditSupplierDialogOpen(false)}
              disabled={isUpdatingSupplier}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSupplier}
              disabled={isUpdatingSupplier}
            >
              {isUpdatingSupplier ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Supplier"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item for your supply expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="item-unit">Unit *</Label>
              <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
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
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddItemDialogOpen(false)}
              disabled={isCreatingItem}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddItem}
              disabled={isCreatingItem}
            >
              {isCreatingItem ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update item information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-item-name">Item Name *</Label>
              <Input
                id="edit-item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="edit-item-unit">Unit *</Label>
              <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
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
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditItemDialogOpen(false)}
              disabled={isUpdatingItem}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditItem}
              disabled={isUpdatingItem}
            >
              {isUpdatingItem ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Item"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Packaging Type Dialog */}
      <Dialog open={isAddPackagingDialogOpen} onOpenChange={setIsAddPackagingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Packaging Type</DialogTitle>
            <DialogDescription>
              Add a new packaging type for your packaging costs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packaging-name">Packaging Type Name *</Label>
              <Input
                id="packaging-name"
                value={newPackaging.name}
                onChange={(e) => setNewPackaging({...newPackaging, name: e.target.value})}
                placeholder="e.g., Boxes, Bags, Ribbons"
              />
            </div>
            <div>
              <Label htmlFor="packaging-description">Description (Optional)</Label>
              <Input
                id="packaging-description"
                value={newPackaging.description}
                onChange={(e) => setNewPackaging({...newPackaging, description: e.target.value})}
                placeholder="Brief description of the packaging type"
              />
            </div>
            <div>
              <Label htmlFor="packaging-price">Price *</Label>
              <Input
                id="packaging-price"
                type="number"
                value={newPackaging.price}
                onChange={(e) => setNewPackaging({...newPackaging, price: e.target.value})}
                placeholder="Enter price"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddPackagingDialogOpen(false)}
              disabled={isCreatingPackagingType}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPackaging}
              disabled={isCreatingPackagingType}
            >
              {isCreatingPackagingType ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Packaging Type"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Packaging Type Dialog */}
      <Dialog open={isEditPackagingDialogOpen} onOpenChange={setIsEditPackagingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Packaging Type</DialogTitle>
            <DialogDescription>
              Update packaging type information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-packaging-name">Packaging Type Name *</Label>
              <Input
                id="edit-packaging-name"
                value={newPackaging.name}
                onChange={(e) => setNewPackaging({...newPackaging, name: e.target.value})}
                placeholder="e.g., Boxes, Bags, Ribbons"
              />
            </div>
            <div>
              <Label htmlFor="edit-packaging-description">Description (Optional)</Label>
              <Input
                id="edit-packaging-description"
                value={newPackaging.description}
                onChange={(e) => setNewPackaging({...newPackaging, description: e.target.value})}
                placeholder="Brief description of the packaging type"
              />
            </div>
            <div>
              <Label htmlFor="edit-packaging-price">Price *</Label>
              <Input
                id="edit-packaging-price"
                type="number"
                value={newPackaging.price}
                onChange={(e) => setNewPackaging({...newPackaging, price: e.target.value})}
                placeholder="Enter price"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditPackagingDialogOpen(false)}
              disabled={isUpdatingPackagingType}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditPackaging}
              disabled={isUpdatingPackagingType}
            >
              {isUpdatingPackagingType ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Packaging Type"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Overhead Cost Type Dialog */}
      <Dialog open={isAddOverheadCostDialogOpen} onOpenChange={setIsAddOverheadCostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Overhead Cost Type</DialogTitle>
            <DialogDescription>
              Add a new overhead cost type for categorizing business expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="overhead-cost-name">Overhead Cost Type Name *</Label>
              <Input
                id="overhead-cost-name"
                value={newOverheadCost.name}
                onChange={(e) => setNewOverheadCost({...newOverheadCost, name: e.target.value})}
                placeholder="e.g., Rent, Utilities, Insurance"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddOverheadCostDialogOpen(false)}
              disabled={isCreatingOverheadCostType}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddOverheadCost}
              disabled={isCreatingOverheadCostType}
            >
              {isCreatingOverheadCostType ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Overhead Cost Type"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Overhead Cost Type Dialog */}
      <Dialog open={isEditOverheadCostDialogOpen} onOpenChange={setIsEditOverheadCostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Overhead Cost Type</DialogTitle>
            <DialogDescription>
              Update overhead cost type information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-overhead-cost-name">Overhead Cost Type Name *</Label>
              <Input
                id="edit-overhead-cost-name"
                value={newOverheadCost.name}
                onChange={(e) => setNewOverheadCost({...newOverheadCost, name: e.target.value})}
                placeholder="e.g., Rent, Utilities, Insurance"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOverheadCostDialogOpen(false)}
              disabled={isUpdatingOverheadCostType}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditOverheadCost}
              disabled={isUpdatingOverheadCostType}
            >
              {isUpdatingOverheadCostType ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Overhead Cost Type"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
};

export default Settings;