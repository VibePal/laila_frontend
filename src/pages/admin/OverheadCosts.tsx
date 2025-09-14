import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign, Calendar, Building2 } from "lucide-react";
import { getAllOverheadCosts, createOverheadCost, updateOverheadCostAPI, deleteOverheadCostAPI, getOverheadCostTypesFromAPI, getPackagingTypesFromAPI, OverheadCostTypeApiResponse, PackagingTypeApiResponse, OverheadCostApiResponse, CreateOverheadCostRequest, UpdateOverheadCostRequest, ApiResponse } from "@/lib/dataService";

interface OverheadCost {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  costType: 'operational' | 'packaging';
}

const OverheadCosts = () => {
  const [overheadCosts, setOverheadCosts] = useState<OverheadCostApiResponse[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
    recurring: false,
    frequency: "",
    costType: "operational" as 'operational' | 'packaging'
  });
  
  // API-loaded categories
  const [overheadCostTypes, setOverheadCostTypes] = useState<OverheadCostTypeApiResponse[]>([]);
  const [packagingTypes, setPackagingTypes] = useState<PackagingTypeApiResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState<'operational' | 'packaging'>('operational');


  const frequencies = [
    "Monthly",
    "Quarterly",
    "Annually",
    "One-time"
  ];

  useEffect(() => {
    loadOverheadCosts();
    loadCategories();
  }, []);

  const loadOverheadCosts = async () => {
    setIsLoading(true);
    try {
      const response: ApiResponse<OverheadCostApiResponse[]> = await getAllOverheadCosts();
      
      if (response.success && response.data) {
        setOverheadCosts(response.data);
      } else {
        console.error('Failed to load overhead costs:', response.error);
        setOverheadCosts([]); // Ensure it's always an array
      }
    } catch (error) {
      console.error("Error loading overhead costs:", error);
      setOverheadCosts([]); // Ensure it's always an array
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      // Load overhead cost types for operational costs
      const overheadResponse: ApiResponse<OverheadCostTypeApiResponse[]> = await getOverheadCostTypesFromAPI();
      if (overheadResponse.success && overheadResponse.data) {
        setOverheadCostTypes(overheadResponse.data);
      }

      // Load packaging types for packaging costs
      const packagingResponse: ApiResponse<PackagingTypeApiResponse[]> = await getPackagingTypesFromAPI();
      if (packagingResponse.success && packagingResponse.data) {
        setPackagingTypes(packagingResponse.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        // Update existing overhead cost
        const updateData: UpdateOverheadCostRequest = {
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          recurring: formData.recurring,
          frequency: formData.frequency || undefined,
          cost_type: formData.costType
        };
        
        const response = await updateOverheadCostAPI(editingId, updateData);
        if (!response.success) {
          console.error('Failed to update overhead cost:', response.error);
          return;
        }
      } else {
        // Create new overhead cost
        const createData: CreateOverheadCostRequest = {
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          recurring: formData.recurring,
          frequency: formData.frequency || undefined,
          cost_type: formData.costType
        };
        
        const response = await createOverheadCost(createData);
        if (!response.success) {
          console.error('Failed to create overhead cost:', response.error);
          return;
        }
      }

      // Reset form and reload data
      setFormData({
        category: "",
        description: "",
        amount: "",
        date: "",
        recurring: false,
        frequency: "",
        costType: "operational"
      });
      setIsAdding(false);
      setEditingId(null);
      await loadOverheadCosts();
    } catch (error) {
      console.error("Error saving overhead cost:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cost: OverheadCostApiResponse) => {
    setEditingId(cost.id);
    setFormData({
      category: cost.category,
      description: cost.description,
      amount: cost.amount.toString(),
      date: cost.date,
      recurring: cost.recurring,
      frequency: cost.frequency || "",
      costType: cost.cost_type || "operational"
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this overhead cost?")) {
      try {
        const response = await deleteOverheadCostAPI(id);
        if (response.success) {
          await loadOverheadCosts();
        } else {
          console.error('Failed to delete overhead cost:', response.error);
        }
      } catch (error) {
        console.error("Error deleting overhead cost:", error);
      }
    }
  };

  const getTotalMonthlyCost = (costType?: 'operational' | 'packaging') => {
    if (!Array.isArray(overheadCosts)) return 0;
    return overheadCosts.reduce((total, cost) => {
      if (costType && cost.cost_type !== costType) return total;
      if (cost.recurring) {
        switch (cost.frequency) {
          case "Monthly":
            return total + cost.amount;
          case "Quarterly":
            return total + (cost.amount / 3);
          case "Annually":
            return total + (cost.amount / 12);
          default:
            return total;
        }
      }
      return total;
    }, 0);
  };

  const getTotalOneTimeCost = (costType?: 'operational' | 'packaging') => {
    if (!Array.isArray(overheadCosts)) return 0;
    return overheadCosts.reduce((total, cost) => {
      if (costType && cost.cost_type !== costType) return total;
      if (!cost.recurring) {
        return total + cost.amount;
      }
      return total;
    }, 0);
  };

  const getFilteredCosts = (costType: 'operational' | 'packaging') => {
    if (!Array.isArray(overheadCosts)) return [];
    return overheadCosts.filter(cost => cost.cost_type === costType);
  };

    return (
    <div className="space-y-6">


      

             {/* Add/Edit Form Modal */}
       <Dialog open={isAdding} onOpenChange={setIsAdding}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>{editingId ? "Edit" : "Add"} Overhead Cost</DialogTitle>
             <DialogDescription>
               {editingId ? "Update the overhead cost details" : "Enter the details for the new overhead cost"}
             </DialogDescription>
           </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select
                   value={formData.category}
                   onValueChange={(value) => setFormData({ ...formData, category: value })}
                   disabled={isLoadingCategories}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                   </SelectTrigger>
                   <SelectContent>
                     {activeTab === 'operational' ? (
                       overheadCostTypes.map((type) => (
                         <SelectItem key={type.id} value={type.name}>
                           {type.name}
                         </SelectItem>
                       ))
                     ) : (
                       packagingTypes.map((type) => (
                         <SelectItem key={type.id} value={type.name}>
                           {type.name}
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
               </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="amount">Amount (₵)</Label>
                 <Input
                   id="amount"
                   type="number"
                   step="0.01"
                   value={formData.amount}
                   onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                   placeholder="0.00"
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="date">Date</Label>
                 <Input
                   id="date"
                   type="date"
                   value={formData.date}
                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                   required
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="description">Description (Optional)</Label>
               <Textarea
                 id="description"
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 placeholder="Enter description of the overhead cost (optional)"
                 rows={3}
               />
             </div>



             <div className="flex gap-2 justify-end">
               <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? "Saving..." : (editingId ? "Update" : "Add")} Cost
               </Button>
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => {
                   setIsAdding(false);
                   setEditingId(null);
                   setFormData({
                     category: "",
                     description: "",
                     amount: "",
                     date: "",
                     recurring: false,
                     frequency: "",
                     costType: "operational"
                   });
                 }}
               >
                 Cancel
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>

             {/* Costs Table with Tabs */}
       <Card>
         <CardContent>
          <Tabs defaultValue="operational" className="w-full" onValueChange={(value) => setActiveTab(value as 'operational' | 'packaging')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="operational">Operational Costs</TabsTrigger>
              <TabsTrigger value="packaging">Packaging Costs</TabsTrigger>
            </TabsList>
            
                         <TabsContent value="operational" className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Electricity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">₵{getTotalMonthlyCost('operational').toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Water</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">₵{getTotalOneTimeCost('operational').toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Rent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">₵{getTotalMonthlyCost('operational').toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Button onClick={() => {
                    setFormData({ ...formData, costType: 'operational', category: "" });
                    setIsAdding(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Operational Cost
                  </Button>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="dateFilter" className="text-sm font-medium">Filter by Date:</Label>
                    <Input
                      id="dateFilter"
                      type="date"
                      className="w-auto"
                    />
                  </div>
                </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading operational costs...
                      </TableCell>
                    </TableRow>
                  ) : getFilteredCosts('operational').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No operational costs found. Add your first cost to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredCosts('operational').map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Badge variant="outline">{cost.category}</Badge>
                        </TableCell>
                        <TableCell>{cost.description || <span className="text-muted-foreground italic">No description</span>}</TableCell>
                        <TableCell>₵{cost.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(cost)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cost.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="packaging" className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Packaging Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">₵{(getTotalMonthlyCost('packaging') + getTotalOneTimeCost('packaging')).toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button onClick={() => {
                  setFormData({ ...formData, costType: 'packaging', category: "" });
                  setIsAdding(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Packaging Cost
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor="packagingDateFilter" className="text-sm font-medium">Filter by Date:</Label>
                  <Input
                    id="packagingDateFilter"
                    type="date"
                    className="w-auto"
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading packaging costs...
                      </TableCell>
                    </TableRow>
                  ) : getFilteredCosts('packaging').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No packaging costs found. Add your first cost to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredCosts('packaging').map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Badge variant="outline">{cost.category}</Badge>
                        </TableCell>
                        <TableCell>{cost.description || <span className="text-muted-foreground italic">No description</span>}</TableCell>
                        <TableCell>₵{cost.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(cost)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cost.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverheadCosts;
