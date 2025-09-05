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
import { 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Building,
  Package,
  ShoppingBag,
  DollarSign
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

interface Item {
  id: string;
  name: string;
  unit: string;
}

interface PackagingType {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface OverheadCostType {
  id: string;
  name: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("suppliers");
  
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

  // Items state
  const [items, setItems] = useState<Item[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    unit: ""
  });

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

  // Overhead Cost Types state
  const [overheadCostTypes, setOverheadCostTypes] = useState<OverheadCostType[]>([]);
  const [isAddOverheadCostDialogOpen, setIsAddOverheadCostDialogOpen] = useState(false);
  const [isEditOverheadCostDialogOpen, setIsEditOverheadCostDialogOpen] = useState(false);
  const [editingOverheadCost, setEditingOverheadCost] = useState<OverheadCostType | null>(null);
  const [newOverheadCost, setNewOverheadCost] = useState({
    name: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadSuppliers();
    loadItems();
    loadPackagingTypes();
    loadOverheadCostTypes();
  }, []);

  // Suppliers functions
  const loadSuppliers = () => {
    try {
      const savedSuppliers = localStorage.getItem('laila_suppliers');
      if (savedSuppliers) {
        setSuppliers(JSON.parse(savedSuppliers));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const saveSuppliers = (suppliersList: Supplier[]) => {
    try {
      localStorage.setItem('laila_suppliers', JSON.stringify(suppliersList));
    } catch (error) {
      console.error('Error saving suppliers:', error);
    }
  };

  const handleAddSupplier = () => {
    if (newSupplier.name.trim()) {
      const supplier: Supplier = {
        id: Date.now().toString(),
        name: newSupplier.name.trim(),
        contact: newSupplier.contact.trim() || undefined,
        address: newSupplier.address.trim() || undefined
      };
      
      const updatedSuppliers = [...suppliers, supplier];
      setSuppliers(updatedSuppliers);
      saveSuppliers(updatedSuppliers);
      
      setNewSupplier({ name: "", contact: "", address: "" });
      setIsAddSupplierDialogOpen(false);
    }
  };

  const handleEditSupplier = () => {
    if (editingSupplier && newSupplier.name.trim()) {
      const updatedSupplier: Supplier = {
        ...editingSupplier,
        name: newSupplier.name.trim(),
        contact: newSupplier.contact.trim() || undefined,
        address: newSupplier.address.trim() || undefined
      };
      
      const updatedSuppliers = suppliers.map(supplier => 
        supplier.id === editingSupplier.id ? updatedSupplier : supplier
      );
      setSuppliers(updatedSuppliers);
      saveSuppliers(updatedSuppliers);
      
      setEditingSupplier(null);
      setNewSupplier({ name: "", contact: "", address: "" });
      setIsEditSupplierDialogOpen(false);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
  };

  const openEditSupplierDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contact: supplier.contact || "",
      address: supplier.address || ""
    });
    setIsEditSupplierDialogOpen(true);
  };

  // Items functions
  const loadItems = () => {
    try {
      const savedItems = localStorage.getItem('laila_items');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItems = (itemsList: Item[]) => {
    try {
      localStorage.setItem('laila_items', JSON.stringify(itemsList));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.unit.trim()) {
      const item: Item = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        unit: newItem.unit.trim()
      };
      
      const updatedItems = [...items, item];
      setItems(updatedItems);
      saveItems(updatedItems);
      
      setNewItem({ name: "", unit: "" });
      setIsAddItemDialogOpen(false);
    }
  };

  const handleEditItem = () => {
    if (editingItem && newItem.name.trim() && newItem.unit.trim()) {
      const updatedItem: Item = {
        ...editingItem,
        name: newItem.name.trim(),
        unit: newItem.unit.trim()
      };
      
      const updatedItems = items.map(item => 
        item.id === editingItem.id ? updatedItem : item
      );
      setItems(updatedItems);
      saveItems(updatedItems);
      
      setEditingItem(null);
      setNewItem({ name: "", unit: "" });
      setIsEditItemDialogOpen(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    saveItems(updatedItems);
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
  const loadPackagingTypes = () => {
    try {
      const savedPackagingTypes = localStorage.getItem('laila_packaging_types');
      if (savedPackagingTypes) {
        setPackagingTypes(JSON.parse(savedPackagingTypes));
      }
    } catch (error) {
      console.error('Error loading packaging types:', error);
    }
  };

  const savePackagingTypes = (packagingTypesList: PackagingType[]) => {
    try {
      localStorage.setItem('laila_packaging_types', JSON.stringify(packagingTypesList));
    } catch (error) {
      console.error('Error saving packaging types:', error);
    }
  };

  const handleAddPackaging = () => {
    if (newPackaging.name.trim()) {
      const packagingType: PackagingType = {
        id: Date.now().toString(),
        name: newPackaging.name.trim(),
        description: newPackaging.description.trim() || undefined,
        price: parseFloat(newPackaging.price) || 0
      };
      
      const updatedPackagingTypes = [...packagingTypes, packagingType];
      setPackagingTypes(updatedPackagingTypes);
      savePackagingTypes(updatedPackagingTypes);
      
      setNewPackaging({ name: "", description: "", price: "" });
      setIsAddPackagingDialogOpen(false);
    }
  };

  const handleEditPackaging = () => {
    if (editingPackaging && newPackaging.name.trim()) {
      const updatedPackaging: PackagingType = {
        ...editingPackaging,
        name: newPackaging.name.trim(),
        description: newPackaging.description.trim() || undefined,
        price: parseFloat(newPackaging.price) || 0
      };
      
      const updatedPackagingTypes = packagingTypes.map(packaging => 
        packaging.id === editingPackaging.id ? updatedPackaging : packaging
      );
      setPackagingTypes(updatedPackagingTypes);
      savePackagingTypes(updatedPackagingTypes);
      
      setEditingPackaging(null);
      setNewPackaging({ name: "", description: "", price: "" });
      setIsEditPackagingDialogOpen(false);
    }
  };

  const handleDeletePackaging = (packagingId: string) => {
    const updatedPackagingTypes = packagingTypes.filter(packaging => packaging.id !== packagingId);
    setPackagingTypes(updatedPackagingTypes);
    savePackagingTypes(updatedPackagingTypes);
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
  const loadOverheadCostTypes = () => {
    try {
      const savedOverheadCostTypes = localStorage.getItem('laila_overhead_cost_types');
      if (savedOverheadCostTypes) {
        setOverheadCostTypes(JSON.parse(savedOverheadCostTypes));
      }
    } catch (error) {
      console.error('Error loading overhead cost types:', error);
    }
  };

  const saveOverheadCostTypes = (overheadCostTypesList: OverheadCostType[]) => {
    try {
      localStorage.setItem('laila_overhead_cost_types', JSON.stringify(overheadCostTypesList));
    } catch (error) {
      console.error('Error saving overhead cost types:', error);
    }
  };

  const handleAddOverheadCost = () => {
    if (newOverheadCost.name.trim()) {
      const overheadCostType: OverheadCostType = {
        id: Date.now().toString(),
        name: newOverheadCost.name.trim()
      };
      
      const updatedOverheadCostTypes = [...overheadCostTypes, overheadCostType];
      setOverheadCostTypes(updatedOverheadCostTypes);
      saveOverheadCostTypes(updatedOverheadCostTypes);
      
      setNewOverheadCost({ name: "" });
      setIsAddOverheadCostDialogOpen(false);
    }
  };

  const handleEditOverheadCost = () => {
    if (editingOverheadCost && newOverheadCost.name.trim()) {
      const updatedOverheadCost: OverheadCostType = {
        ...editingOverheadCost,
        name: newOverheadCost.name.trim()
      };
      
      const updatedOverheadCostTypes = overheadCostTypes.map(overheadCost => 
        overheadCost.id === editingOverheadCost.id ? updatedOverheadCost : overheadCost
      );
      setOverheadCostTypes(updatedOverheadCostTypes);
      saveOverheadCostTypes(updatedOverheadCostTypes);
      
      setEditingOverheadCost(null);
      setNewOverheadCost({ name: "" });
      setIsEditOverheadCostDialogOpen(false);
    }
  };

  const handleDeleteOverheadCost = (overheadCostId: string) => {
    const updatedOverheadCostTypes = overheadCostTypes.filter(overheadCost => overheadCost.id !== overheadCostId);
    setOverheadCostTypes(updatedOverheadCostTypes);
    saveOverheadCostTypes(updatedOverheadCostTypes);
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
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application constants and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {suppliers.length === 0 ? (
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
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
                              <AlertDialogAction onClick={() => handleDeleteSupplier(supplier.id)}>
                                Delete
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
              {items.length === 0 ? (
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
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
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                Delete
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
              {packagingTypes.length === 0 ? (
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
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
                              <AlertDialogAction onClick={() => handleDeletePackaging(packaging.id)}>
                                Delete
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
              {overheadCostTypes.length === 0 ? (
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
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
                              <AlertDialogAction onClick={() => handleDeleteOverheadCost(overheadCost.id)}>
                                Delete
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
            <Button variant="outline" onClick={() => setIsAddSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>
              Add Supplier
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
            <Button variant="outline" onClick={() => setIsEditSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSupplier}>
              Update Supplier
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
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
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
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>
              Update Item
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
            <Button variant="outline" onClick={() => setIsAddPackagingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPackaging}>
              Add Packaging Type
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
            <Button variant="outline" onClick={() => setIsEditPackagingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPackaging}>
              Update Packaging Type
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
            <Button variant="outline" onClick={() => setIsAddOverheadCostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOverheadCost}>
              Add Overhead Cost Type
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
            <Button variant="outline" onClick={() => setIsEditOverheadCostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditOverheadCost}>
              Update Overhead Cost Type
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
