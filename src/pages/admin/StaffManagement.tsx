import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, 
  Plus,
  Edit,
  DollarSign
} from "lucide-react";

interface Staff {
  id: string;
  fullName: string;
  username: string;
  password: string;
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

  // Staff payment state
  const [staffPayments, setStaffPayments] = useState<StaffPayment[]>([]);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    staffId: "",
    amount: "",
    paymentDate: ""
  });

  // Staff management functions
  const handleAddStaff = () => {
    if (newStaff.fullName && newStaff.username && newStaff.password && newStaff.role) {
      const staffMember: Staff = {
        id: Date.now().toString(),
        fullName: newStaff.fullName,
        username: newStaff.username,
        password: newStaff.password,
        role: newStaff.role as 'staff' | 'admin',
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStaff([...staff, staffMember]);
      setNewStaff({ fullName: "", username: "", password: "", role: "staff" });
      setIsAddStaffDialogOpen(false);
    }
  };

  const handleEditStaff = () => {
    if (editingStaff && newStaff.fullName && newStaff.username && newStaff.password && newStaff.role) {
      const updatedStaff = staff.map(s => 
        s.id === editingStaff.id 
          ? {
              ...s,
              fullName: newStaff.fullName,
              username: newStaff.username,
              password: newStaff.password,
              role: newStaff.role as 'staff' | 'admin'
            }
          : s
      );
      setStaff(updatedStaff);
      setEditingStaff(null);
      setNewStaff({ fullName: "", username: "", password: "", role: "staff" });
      setIsEditStaffDialogOpen(false);
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
      password: staffMember.password,
      role: staffMember.role
    });
    setIsEditStaffDialogOpen(true);
  };

  // Staff payment functions
  const handleAddPayment = () => {
    if (newPayment.staffId && newPayment.amount && newPayment.paymentDate) {
      const selectedStaff = staff.find(s => s.id === newPayment.staffId);
      if (selectedStaff) {
        const payment: StaffPayment = {
          id: Date.now().toString(),
          staffId: newPayment.staffId,
          staffName: selectedStaff.fullName,
          amount: parseFloat(newPayment.amount),
          paymentDate: newPayment.paymentDate,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setStaffPayments([...staffPayments, payment]);
        setNewPayment({ staffId: "", amount: "", paymentDate: "" });
        setIsAddPaymentDialogOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        <TabsContent value="staff-management" className="space-y-6">
          {/* Header with Add Staff Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Staff Management</h3>
              <p className="text-muted-foreground">Create and manage staff accounts</p>
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
                  <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaff}>
                    Add Staff
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Manage all staff accounts and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staff.length > 0 ? (
                  staff.map((staffMember) => (
                    <div key={staffMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{staffMember.fullName}</p>
                          <p className="text-sm text-muted-foreground">Username: {staffMember.username}</p>
                          <p className="text-sm text-muted-foreground">Role: {staffMember.role}</p>
                          <p className="text-sm text-muted-foreground">Created: {staffMember.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                          {staffMember.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditStaffDialog(staffMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={staffMember.isActive ? "text-red-600" : "text-green-600"}
                            >
                              {staffMember.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {staffMember.isActive ? "Deactivate" : "Activate"} Staff Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to {staffMember.isActive ? "deactivate" : "activate"} {staffMember.username}'s account?
                                {staffMember.isActive ? " They will no longer be able to access the system." : " They will be able to access the system again."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleToggleStaffStatus(staffMember.id)}
                                className={staffMember.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                              >
                                {staffMember.isActive ? "Deactivate" : "Activate"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
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
                  <Label htmlFor="edit-staff-password">Password</Label>
                  <Input
                    id="edit-staff-password"
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    placeholder="Enter password"
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
                <Button variant="outline" onClick={() => setIsEditStaffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditStaff}>
                  Update Staff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="staff-payment" className="space-y-6">
          {/* Header with Add Payment Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Staff Payment</h3>
              <p className="text-muted-foreground">Manage staff payments and payroll</p>
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
                        {staff
                          .filter(staffMember => staffMember.isActive)
                          .map(staffMember => (
                            <SelectItem key={staffMember.id} value={staffMember.id}>
                              {staffMember.fullName} ({staffMember.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
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
                  <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPayment}>
                    Add Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payment List */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track all staff payments and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffPayments.length > 0 ? (
                  staffPayments.map((payment) => (
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
                            <span className="font-medium">Payment Date:</span> {payment.paymentDate}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Recorded:</span> {payment.createdAt}
                          </p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
