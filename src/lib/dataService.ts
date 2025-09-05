// Data service for in-memory storage with localStorage persistence
// This provides a simple backend simulation for the application

// Storage keys for localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'laila_products',
  ORDERS: 'laila_orders',
  STAFF: 'laila_staff',
  EXPENSES: 'laila_expenses',
  OVERHEAD_COSTS: 'laila_overhead_costs',
  PACKAGING_TYPES: 'laila_packaging_types'
};

// TypeScript interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  costPerUnit: number;
  quantity: number;
  isAvailable: boolean;
  isActive: boolean;
  date: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerContact: string;
  deliveryType: 'pickup' | 'delivery';
  hostel?: string;
  paymentType: 'momo' | 'cash';
  deliveryFee: number;
  specialNotes: string;
  items: OrderItem[];
  total: number;
  orderDate: string;
  orderTime: string;
  createdBy: string; // Username of the staff member who created the order
}

export interface Staff {
  id: string;
  username: string;
  password: string;
  role: 'staff' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  supplier: string;
  items: string;
  quantity: number;
  costPerItem: number;
  total: number;
  category: string;
  purchaseUnit?: string;
  packageSize?: number;
  pricePerUnit?: number;
}

export interface OverheadCost {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  costType: 'operational' | 'packaging';
}

export interface PackagingType {
  id: string;
  name: string;
  description?: string;
  price: number;
}

// Generic storage functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error);
  }
};

// Initialize default data if storage is empty
const initializeDefaultData = () => {
  const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);
  const staff = getFromStorage(STORAGE_KEYS.STAFF, []);
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
  const overheadCosts = getFromStorage(STORAGE_KEYS.OVERHEAD_COSTS, []);

  // Only initialize if all storage is empty (first time setup)
  if (products.length === 0 && orders.length === 0 && staff.length === 0 && expenses.length === 0 && overheadCosts.length === 0) {
    console.log('Initializing default data for first time setup');
    
    // Add default admin user if no staff exists
    if (staff.length === 0) {
      const defaultAdmin: Staff = {
        id: "1",
        username: "admin",
        password: "admin123",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      saveToStorage(STORAGE_KEYS.STAFF, [defaultAdmin]);
    }
  }
};

// Product operations
export const getProducts = (): Product[] => {
  return getFromStorage(STORAGE_KEYS.PRODUCTS, []);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  saveToStorage(STORAGE_KEYS.PRODUCTS, products);
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  const updatedProducts = products.map(p => 
    p.id === productId ? { ...p, isActive: false } : p
  );
  saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
};

export const updateProductAvailability = (productId: string, isAvailable: boolean): void => {
  const products = getProducts();
  const updatedProducts = products.map(p => 
    p.id === productId ? { ...p, isAvailable } : p
  );
  saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
};

export const updateProductQuantity = (productId: string, quantityReduction: number): void => {
  const products = getProducts();
  const updatedProducts = products.map(p => {
    if (p.id === productId) {
      const newQuantity = Math.max(0, p.quantity - quantityReduction);
      return { 
        ...p, 
        quantity: newQuantity,
        isAvailable: newQuantity > 0 // Auto-disable if quantity becomes 0
      };
    }
    return p;
  });
  saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
};

// Order operations
export const getOrders = (): Order[] => {
  try {
    return getFromStorage(STORAGE_KEYS.ORDERS, []);
  } catch (error) {
    console.error('Error getting orders from storage:', error);
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  try {
    const orders = getOrders();
    orders.unshift(order); // Add to beginning of array
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    console.log('DataService: Order saved', { orderId: order.id, totalOrders: orders.length });
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const updateOrder = (order: Order): void => {
  try {
    const orders = getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
      saveToStorage(STORAGE_KEYS.ORDERS, orders);
      console.log('DataService: Order updated', { orderId: order.id });
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = (orderId: string): void => {
  try {
    const orders = getOrders();
    const updatedOrders = orders.filter(o => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, updatedOrders);
    console.log('DataService: Order deleted', { orderId, totalOrders: updatedOrders.length });
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Staff operations
export const getStaff = (): Staff[] => {
  return getFromStorage(STORAGE_KEYS.STAFF, []);
};

export const saveStaff = (staffMember: Staff): void => {
  const staff = getStaff();
  const existingIndex = staff.findIndex(s => s.id === staffMember.id);
  
  if (existingIndex >= 0) {
    staff[existingIndex] = staffMember;
  } else {
    staff.push(staffMember);
  }
  
  saveToStorage(STORAGE_KEYS.STAFF, staff);
};

export const updateStaffStatus = (staffId: string, isActive: boolean): void => {
  const staff = getStaff();
  const updatedStaff = staff.map(s => 
    s.id === staffId ? { ...s, isActive } : s
  );
  saveToStorage(STORAGE_KEYS.STAFF, updatedStaff);
};

// Expense operations
export const getExpenses = (): Expense[] => {
  return getFromStorage(STORAGE_KEYS.EXPENSES, []);
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.unshift(expense); // Add to beginning of array so new expenses show at top
  }
  
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
};

export const deleteExpense = (expenseId: string): void => {
  const expenses = getExpenses();
  const updatedExpenses = expenses.filter(e => e.id !== expenseId);
  saveToStorage(STORAGE_KEYS.EXPENSES, updatedExpenses);
};

// Overhead Cost operations
export const getOverheadCosts = (): OverheadCost[] => {
  return getFromStorage(STORAGE_KEYS.OVERHEAD_COSTS, []);
};

export const addOverheadCost = (overheadCost: OverheadCost): void => {
  const overheadCosts = getOverheadCosts();
  overheadCosts.unshift(overheadCost); // Add to beginning of array
  saveToStorage(STORAGE_KEYS.OVERHEAD_COSTS, overheadCosts);
};

export const updateOverheadCost = (overheadCost: OverheadCost): void => {
  const overheadCosts = getOverheadCosts();
  const existingIndex = overheadCosts.findIndex(c => c.id === overheadCost.id);
  
  if (existingIndex >= 0) {
    overheadCosts[existingIndex] = overheadCost;
    saveToStorage(STORAGE_KEYS.OVERHEAD_COSTS, overheadCosts);
  }
};

export const deleteOverheadCost = (overheadCostId: string): void => {
  const overheadCosts = getOverheadCosts();
  const updatedOverheadCosts = overheadCosts.filter(c => c.id !== overheadCostId);
  saveToStorage(STORAGE_KEYS.OVERHEAD_COSTS, updatedOverheadCosts);
};

// Packaging Types operations
export const getPackagingTypes = (): PackagingType[] => {
  return getFromStorage(STORAGE_KEYS.PACKAGING_TYPES, []);
};

export const savePackagingType = (packagingType: PackagingType): void => {
  const packagingTypes = getPackagingTypes();
  const existingIndex = packagingTypes.findIndex(p => p.id === packagingType.id);
  
  if (existingIndex >= 0) {
    packagingTypes[existingIndex] = packagingType;
  } else {
    packagingTypes.push(packagingType);
  }
  
  saveToStorage(STORAGE_KEYS.PACKAGING_TYPES, packagingTypes);
};

export const deletePackagingType = (packagingTypeId: string): void => {
  const packagingTypes = getPackagingTypes();
  const updatedPackagingTypes = packagingTypes.filter(p => p.id !== packagingTypeId);
  saveToStorage(STORAGE_KEYS.PACKAGING_TYPES, updatedPackagingTypes);
};

// Debug function to clear all data
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.OVERHEAD_COSTS);
    localStorage.removeItem(STORAGE_KEYS.PACKAGING_TYPES);
    console.log('All data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Initialize data service
initializeDefaultData();

// Export storage keys for debugging
export { STORAGE_KEYS };
