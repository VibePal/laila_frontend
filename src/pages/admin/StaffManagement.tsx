import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus,
  Edit,
  DollarSign,
  Loader2
} from "lucide-react";
import { 
  createStaff, 
  getStaffFromAPI, 
  updateStaffAPI, 
  deleteStaffAPI,
  createStaffPayment,
  getStaffPaymentsFromAPI,
  updateStaffPaymentAPI,
  deleteStaffPaymentAPI,
  StaffApiResponse,
  StaffPaymentApiResponse,
  ApiResponse 
} from "@/lib/dataService";

interface Staff {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  role: 'staff' | 'admin';
  isActive: boolean;
  createdAt: string;
}

interface StaffPayment {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

const StaffManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("staff-management");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "staff"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Staff payment state
  const [staffPayments, setStaffPayments] = useState<StaffPayment[]>([]);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<StaffPayment | null>(null);
  const [newPayment, setNewPayment] = useState({
    staffId: "",
    amount: "",
    paymentDate: ""
  });
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Load staff data on component mount
  useEffect(() => {
    loadStaff();
    loadStaffPayments();
  }, []);

  // Debug: Log when staffPayments changes
  useEffect(() => {
    console.log('staffPayments state updated:', staffPayments);
  }, [staffPayments]);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const response: ApiResponse<StaffApiResponse[]> = await getStaffFromAPI();
      if (response.success && response.data) {
        setStaff(response.data);
        console.log('Staff loaded:', response.data);
      } else {
        console.error('Failed to load staff:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to load staff members",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const response: ApiResponse<StaffPaymentApiResponse[]> = await getStaffPaymentsFromAPI();
      if (response.success && response.data) {
        // Sort payments by creation date (newest first)
        const sortedPayments = response.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setStaffPayments(sortedPayments);
      } else {
        console.error('Failed to load staff payments:', response.error);
        setStaffPayments([]); // Ensure it's always an array
        toast({
          title: "Error",
          description: response.error || "Failed to load staff payments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading staff payments:', error);
      setStaffPayments([]); // Ensure it's always an array
      toast({
        title: "Error",
        description: "Failed to load staff payments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // Staff management functions
  const handleAddStaff = async () => {
    if (!newStaff.fullName || !newStaff.username || !newStaff.password || !newStaff.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response: ApiResponse<StaffApiResponse> = await createStaff({
        fullName: newStaff.fullName,
        username: newStaff.username,
        password: newStaff.password,
        role: newStaff.role as 'staff' | 'admin'
      });

      if (response.success && response.data) {
        setStaff([...staff, response.data]);
      setNewStaff({ fullName: "", username: "", password: "", role: "staff" });
      setIsAddStaffDialogOpen(false);
        toast({
          title: "Success",
          description: response.message || "Staff member created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create staff member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff || !newStaff.fullName || !newStaff.username || !newStaff.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
              fullName: newStaff.fullName,
              username: newStaff.username,
              role: newStaff.role as 'staff' | 'admin'
      };

      // Only include password if it's provided
      if (newStaff.password) {
        updateData.password = newStaff.password;
      }

      const response: ApiResponse<StaffApiResponse> = await updateStaffAPI(editingStaff.id, updateData);

      if (response.success && response.data) {
        setStaff(staff.map(s => s.id === editingStaff.id ? response.data! : s));
      setEditingStaff(null);
      setNewStaff({ fullName: "", username: "", password: "", role: "staff" });
      setIsEditStaffDialogOpen(false);
        toast({
          title: "Success",
          description: response.message || "Staff member updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update staff member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setIsDeleting(true);
    try {
      const response: ApiResponse<void> = await deleteStaffAPI(staffId);
      
      if (response.success) {
        setStaff(staff.filter(s => s.id !== staffId));
        toast({
          title: "Success",
          description: response.message || "Staff member deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete staff member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStaffStatus = (staffId: string) => {
    setStaff(staff.map(s => 
      s.id === staffId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const openEditStaffDialog = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setNewStaff({
      fullName: staffMember.fullName,
      username: staffMember.username,
      password: "", // Don't pre-fill password for security
      role: staffMember.role
    });
    setIsEditStaffDialogOpen(true);
  };

  // Staff payment functions
  const handleAddPayment = async () => {
    console.log('Creating payment with data:', newPayment);
    
    if (!newPayment.staffId || !newPayment.amount || !newPayment.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate amount is a positive number
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPayment(true);
    try {
      // Convert payment date to ISO string
      const paymentDateISO = new Date(newPayment.paymentDate).toISOString();
      
      const paymentData = {
          staffId: newPayment.staffId,
        amount: amount,
        paymentDate: paymentDateISO
      };
      
      console.log('Sending payment data:', paymentData);
      
      const response: ApiResponse<StaffPaymentApiResponse> = await createStaffPayment(paymentData);

      if (response.success && response.data) {
        console.log('Payment created successfully, adding to list:', response.data);
        console.log('Current staffPayments before update:', staffPayments);
        setStaffPayments([...(staffPayments || []), response.data]);
        setNewPayment({ staffId: "", amount: "", paymentDate: "" });
        setIsAddPaymentDialogOpen(false);
        
        // Also reload payments from API to ensure we have the latest data
        await loadStaffPayments();
        
        toast({
          title: "Success",
          description: response.message || "Staff payment created successfully",
        });
      } else {
        console.error('Payment creation failed:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to create staff payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: "Error",
        description: `Failed to create staff payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !newPayment.staffId || !newPayment.amount || !newPayment.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate amount is a positive number
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPayment(true);
    try {
      // Convert payment date to ISO string
      const paymentDateISO = new Date(newPayment.paymentDate).toISOString();
      
      const paymentData = {
        staffId: newPayment.staffId,
        amount: amount,
        paymentDate: paymentDateISO
      };
      
      console.log('Updating payment with data:', { paymentId: editingPayment.id, paymentData });
      
      const response: ApiResponse<StaffPaymentApiResponse> = await updateStaffPaymentAPI(editingPayment.id, paymentData);

      if (response.success && response.data) {
        console.log('Payment updated successfully:', response.data);
        // Update the payment in the list
        setStaffPayments(staffPayments.map(p => 
          p.id === editingPayment.id ? response.data! : p
        ));
        setEditingPayment(null);
        setNewPayment({ staffId: "", amount: "", paymentDate: "" });
        setIsEditPaymentDialogOpen(false);
        
        // Also reload payments from API to ensure we have the latest data
        await loadStaffPayments();
        
        toast({
          title: "Success",
          description: response.message || "Staff payment updated successfully",
        });
      } else {
        console.error('Payment update failed:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to update staff payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment update error:', error);
      toast({
        title: "Error",
        description: `Failed to update staff payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setIsDeletingPayment(true);
    try {
      console.log('Deleting payment:', paymentId);
      
      const response: ApiResponse<void> = await deleteStaffPaymentAPI(paymentId);
      
      if (response.success) {
        // Remove the payment from the list
        setStaffPayments(staffPayments.filter(p => p.id !== paymentId));
        toast({
          title: "Success",
          description: response.message || "Staff payment deleted successfully",
        });
      } else {
        console.error('Payment deletion failed:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to delete staff payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment deletion error:', error);
      toast({
        title: "Error",
        description: `Failed to delete staff payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const openEditPaymentDialog = (payment: StaffPayment) => {
    setEditingPayment(payment);
    setNewPayment({
      staffId: payment.staffId,
      amount: payment.amount.toString(),
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0]
    });
    setIsEditPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 bg-background z-10 pb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="staff-management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="staff-payment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Staff Payment
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="staff-management" className="space-y-6">
          {/* Staff List */}
          <Card>
            <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>Manage all staff accounts and their roles</CardDescription>
            </div>
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>
                    Create a new staff account with username, password, and role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="staff-fullname">Full Name</Label>
                    <Input
                      id="staff-fullname"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-username">Username</Label>
                    <Input
                      id="staff-username"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-password">Password</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-role">Role</Label>
                    <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaff} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Staff"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading staff members...</p>
                        </div>
                ) : staff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((staffMember) => (
                      <div key={staffMember.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium text-lg">{staffMember.fullName}</h3>
                            <p className="text-sm text-muted-foreground">@{staffMember.username}</p>
                      </div>
                          <Badge variant={staffMember.isActive ? "default" : "secondary"} className="text-xs">
                          {staffMember.isActive ? "Active" : "Inactive"}
                        </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Role:</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {staffMember.role}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="text-xs">{staffMember.createdAt}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditStaffDialog(staffMember)}
                            disabled={isUpdating}
                            className="flex-1"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                                className="text-red-600 hover:text-red-700 flex-1"
                                disabled={isDeleting}
                            >
                                Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Staff Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Are you sure you want to delete {staffMember.fullName}'s account? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                  onClick={() => handleDeleteStaff(staffMember.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
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
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No staff members found</p>
                    <p className="text-sm">Add your first staff member to start managing your team.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Staff Dialog */}
          <Dialog open={isEditStaffDialogOpen} onOpenChange={setIsEditStaffDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>
                  Update staff member details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-staff-fullname">Full Name</Label>
                  <Input
                    id="edit-staff-fullname"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-staff-username">Username</Label>
                  <Input
                    id="edit-staff-username"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-staff-password">Password (Optional)</Label>
                  <Input
                    id="edit-staff-password"
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-staff-role">Role</Label>
                  <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditStaffDialogOpen(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={handleEditStaff} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Staff"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="staff-payment" className="space-y-6">
          {/* Payment List */}
          <Card>
            <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Track all staff payments and their details</CardDescription>
            </div>
            <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment for a staff member.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-staff">Select Staff</Label>
                    <Select value={newPayment.staffId} onValueChange={(value) => setNewPayment({...newPayment, staffId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                            {staff.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                No staff members available. Please add staff members first.
                              </div>
                            ) : (
                              staff
                          .filter(staffMember => staffMember.isActive)
                          .map(staffMember => (
                            <SelectItem key={staffMember.id} value={staffMember.id}>
                              {staffMember.fullName} ({staffMember.role})
                            </SelectItem>
                                ))
                            )}
                      </SelectContent>
                    </Select>
                        {staff.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            You need to have staff members before creating payments.
                          </p>
                        )}
                  </div>
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                          min="0"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                      placeholder="Enter payment amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-date">Payment Date</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)} disabled={isCreatingPayment}>
                    Cancel
                  </Button>
                      <Button 
                        onClick={handleAddPayment} 
                        disabled={isCreatingPayment || staff.length === 0}
                      >
                        {isCreatingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Add Payment"
                        )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingPayments ? (
                  <div className="col-span-full text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading payments...</p>
                  </div>
                ) : (staffPayments || []).length > 0 ? (
                  (staffPayments || [])
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((payment) => (
                    <Card key={payment.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{payment.staffName}</h4>
                          <Badge variant="default" className="bg-green-600">
                            ${payment.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Payment Date:</span> {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Recorded:</span> {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPaymentDialog(payment)}
                            disabled={isUpdatingPayment}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 flex-1"
                                disabled={isDeletingPayment}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this payment of ${payment.amount.toFixed(2)} for {payment.staffName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePayment(payment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isDeletingPayment}
                                >
                                  {isDeletingPayment ? (
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
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-12">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No payments found</p>
                    <p className="text-sm">Add your first payment to start tracking staff payments.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Payment Dialog */}
          <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Payment</DialogTitle>
                <DialogDescription>
                  Update payment information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-payment-staff">Select Staff</Label>
                  <Select value={newPayment.staffId} onValueChange={(value) => setNewPayment({...newPayment, staffId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No staff members available. Please add staff members first.
                        </div>
                      ) : (
                        staff
                          .filter(staffMember => staffMember.isActive)
                          .map(staffMember => (
                            <SelectItem key={staffMember.id} value={staffMember.id}>
                              {staffMember.fullName} ({staffMember.role})
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-payment-amount">Amount</Label>
                  <Input
                    id="edit-payment-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="Enter payment amount"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-payment-date">Payment Date</Label>
                  <Input
                    id="edit-payment-date"
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditPaymentDialogOpen(false)} disabled={isUpdatingPayment}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdatePayment} 
                  disabled={isUpdatingPayment || staff.length === 0}
                >
                  {isUpdatingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Payment"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
