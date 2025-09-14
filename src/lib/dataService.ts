// Data service for in-memory storage with localStorage persistence
// This provides a simple backend simulation for the application

// Storage keys for localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'laila_products',
  ORDERS: 'laila_orders',
  EXPENSES: 'laila_expenses',
  OVERHEAD_COSTS: 'laila_overhead_costs'
};

// TypeScript interfaces
export interface Product {
  id: string;
  name: string;
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
  // Backend field names (snake_case)
  product_id?: string;
  product_name?: string;
  unit_price?: number;
  // Alternative field names
  name?: string;
  total?: number;
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
  selectedPackage?: string; // ID of the selected packaging type
  packageName?: string; // Name of the selected packaging type
  // Custom order fields
  additionalPrice?: number;
  colour?: string;
  inscription?: string;
  totalCost?: number;
  // Backend metadata
  createdAt?: string;
  updatedAt?: string;
  // Order type from backend
  orderType?: 'standard' | 'custom';
}

// Interface for creating orders via API (without id field)
export interface CreateOrderRequest {
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
  createdBy: string;
  selectedPackage?: string;
  packageName?: string;
}

// Interface for creating custom orders via API (without id field)
export interface CreateCustomOrderRequest {
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
  createdBy: string;
  selectedPackage?: string;
  packageName?: string;
  additionalPrice?: number;
  colour?: string;
  inscription?: string;
  totalCost?: number;
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

// API interfaces for overhead costs
export interface OverheadCostApiResponse {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  cost_type: 'operational' | 'packaging';
  created_at?: string;
  updated_at?: string;
}

export interface CreateOverheadCostRequest {
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  cost_type: 'operational' | 'packaging';
}

export interface UpdateOverheadCostRequest {
  category?: string;
  description?: string;
  amount?: number;
  date?: string;
  recurring?: boolean;
  frequency?: string;
  cost_type?: 'operational' | 'packaging';
}

export interface OverheadCostStatsResponse {
  total_costs: number;
  total_amount: number;
  operational_costs: number;
  operational_amount: number;
  packaging_costs: number;
  packaging_amount: number;
  recurring_costs: number;
  one_time_costs: number;
  average_amount: number;
  cost_type_breakdown: {
    operational: number;
    packaging: number;
  };
  frequency_breakdown: {
    [key: string]: number;
  };
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

export const updateProductQuantity = (productId: string, quantityChange: number): void => {
  const products = getProducts();
  const updatedProducts = products.map(p => {
    if (p.id === productId) {
      const newQuantity = Math.max(0, p.quantity - quantityChange); // Subtract quantity (for order fulfillment)
      return { ...p, quantity: newQuantity };
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


// Debug function to clear all data
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.OVERHEAD_COSTS);
    console.log('All data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Export storage keys for debugging
export { STORAGE_KEYS };

// Authentication helper functions
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const tokenType = localStorage.getItem("tokenType") || "Bearer";
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `${tokenType} ${token}`;
  }
  
  return headers;
};

// Debug function to check authentication status
export const debugAuthStatus = (): void => {
  const token = getAuthToken();
  const tokenType = localStorage.getItem("tokenType");
  const tokenExpiresIn = localStorage.getItem("tokenExpiresIn");
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");
  
  console.log('=== AUTHENTICATION DEBUG INFO ===');
  console.log('Token exists:', !!token);
  console.log('Token type:', tokenType);
  console.log('Token expires in:', tokenExpiresIn);
  console.log('User role:', userRole);
  console.log('User email:', userEmail);
  console.log('Username:', username);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
  console.log('Full headers:', getAuthHeaders());
  console.log('================================');
};

export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.error('❌ API URL not configured. Please check your environment variables.');
    console.error('❌ Create a .env file in the laila_frontend directory with:');
    console.error('❌ VITE_API_URL=http://localhost:8000');
    console.error('❌ (Replace with your actual backend URL)');
    throw new Error("API URL not configured. Please create a .env file with VITE_API_URL.");
  }

  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  console.log('🔵 Making authenticated request:', {
    url: fullUrl,
    method: options.method || 'GET',
    headers: requestOptions.headers,
    body: options.body
  });

  // Debug auth status before making request
  debugAuthStatus();
  
  // Additional debugging for PATCH requests
  if (options.method === 'PATCH') {
    console.log('🔵 PATCH request debugging:');
    console.log('🔵 Request body:', options.body);
    console.log('🔵 Content-Type header:', requestOptions.headers?.['Content-Type']);
    console.log('🔵 Authorization header:', requestOptions.headers?.['Authorization']);
  }
  
  // Additional debugging for DELETE requests
  if (options.method === 'DELETE') {
    console.log('🔵 DELETE request debugging:');
    console.log('🔵 Authorization header:', requestOptions.headers?.['Authorization']);
    console.log('🔵 Full request headers:', requestOptions.headers);
  }

  console.log('🔵 About to make fetch request to:', fullUrl);
  const response = await fetch(fullUrl, requestOptions);
  console.log('🔵 Fetch request completed, response status:', response.status);
  
  // Log response details for debugging - DON'T consume the body
  if (!response.ok) {
    console.log('❌ Request failed with status:', response.status);
    console.log('❌ Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('❌ Response body will be handled by calling function');
    
    // Note: We don't consume the response body here to allow calling functions
    // to properly handle error responses and parse error details
  }
  
  return response;
};

export const logout = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("tokenExpiresIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
};

export const checkAuthStatus = (): boolean => {
  const token = getAuthToken();
  const tokenExpiresIn = localStorage.getItem("tokenExpiresIn");
  
  console.log("🔵 Checking auth status:");
  console.log("🔵 Token exists:", !!token);
  console.log("🔵 Token expires in:", tokenExpiresIn);
  
  if (!token) {
    console.log("❌ No auth token found");
    return false;
  }
  
  // Only check expiration if we have a valid expiration date
  if (tokenExpiresIn && tokenExpiresIn !== 'null' && tokenExpiresIn !== 'undefined') {
    try {
      const expiresAt = new Date(tokenExpiresIn);
      const now = new Date();
      
      console.log("🔵 Token expires at:", expiresAt);
      console.log("🔵 Current time:", now);
      console.log("🔵 Is expired:", now >= expiresAt);
      
      if (now >= expiresAt) {
        console.log("❌ Auth token has expired");
        logout();
        return false;
      }
    } catch (error) {
      console.log("🔵 Could not parse expiration date, continuing with token:", error);
    }
  } else {
    console.log("🔵 No expiration date found, assuming token is valid");
  }
  
  console.log("✅ Auth token is valid");
  return true;
};

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StaffApiResponse {
  id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export interface StaffPaymentApiResponse {
  id: string;
  staffId: string;
  amount: number;
  paymentDate: string;
  staffName: string;
  createdAt: string;
}

export interface SupplierApiResponse {
  id: string;
  name: string;
  contact: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemApiResponse {
  id: string;
  name: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackagingTypeApiResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OverheadCostTypeApiResponse {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Sales API Response Interfaces
export interface SalesSummaryResponse {
  total_orders: number;
  total_sales: number;
  total_revenue: number;
  date_range: string;
  period: string;
}

export interface PaymentBreakdownItem {
  payment_method: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ProductBreakdownItem {
  product_category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface SalesOrder {
  id: string;
  order_type: string;
  customer_name: string;
  customer_contact: string;
  delivery_type: string;
  payment_type: string;
  total: number;
  order_date: string;
  order_time: string;
  items: any[]; // You can define a more specific interface if needed
}

// Financial API Response Interfaces
export interface FinancialSummaryResponse {
  total_revenue: number;
  total_orders: number;
  supply_expenses: number;
  staff_payments: number;
  overhead_costs: number;
  total_expenses: number;
  net_profit: number;
  date_range: string;
  period: string;
}

export interface FinancialRevenueResponse {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_by_payment_method: Record<string, number>;
  revenue_by_order_type: Record<string, number>;
}

export interface FinancialExpensesResponse {
  supply_expenses: number;
  staff_payments: number;
  overhead_costs: number;
  total_expenses: number;
  expense_categories: Record<string, number>;
}

export interface FinancialProfitResponse {
  net_profit: number;
  profit_margin: number;
  revenue: number;
  expenses: number;
  profitability_ratio: number;
}

export interface FinancialBreakdownResponse {
  revenue: FinancialRevenueResponse;
  expenses: FinancialExpensesResponse;
  profit: FinancialProfitResponse;
}

// Recipe API interfaces
export interface RecipeIngredientApiRequest {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface RecipeIngredientApiResponse {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
}

export interface RecipeApiRequest {
  name: string;
  yieldQuantity: number;
  yieldUnitLabel: string;
  totalCost: number;
  costPerUnit: number;
  ingredients: RecipeIngredientApiRequest[];
}

export interface RecipeApiResponse {
  id: string;
  name: string;
  yield_quantity: number;
  yield_unit_label: string;
  ingredients: RecipeIngredientApiResponse[];
  total_cost: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeCostSummaryApiResponse {
  total_recipes: number;
  total_cost: number;
  average_cost_per_recipe: number;
  recipes: Array<{
    id: string;
    name: string;
    cost_per_unit: number;
    total_cost: number;
  }>;
}

// Staff API operations
export const createStaff = async (staffData: {
  fullName: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
}): Promise<ApiResponse<StaffApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/staff/', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: 'Staff member created successfully'
    };
  } catch (error) {
    console.error('Error creating staff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create staff member'
    };
  }
};

export const getStaffFromAPI = async (): Promise<ApiResponse<StaffApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/staff/', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff members'
    };
  }
};

export const updateStaffAPI = async (staffId: string, staffData: {
  fullName?: string;
  username?: string;
  password?: string;
  role?: 'admin' | 'staff';
  isActive?: boolean;
}): Promise<ApiResponse<StaffApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: 'Staff member updated successfully'
    };
  } catch (error) {
    console.error('Error updating staff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update staff member'
    };
  }
};

export const deleteStaffAPI = async (staffId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/staff/${staffId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: 'Staff member deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting staff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete staff member'
    };
  }
};

// Staff Payment API operations
export const createStaffPayment = async (paymentRequestData: {
  staffId: string;
  amount: number;
  paymentDate: string;
}): Promise<ApiResponse<StaffPaymentApiResponse>> => {
  try {
    console.log('Creating staff payment with data:', paymentRequestData);
    
    const response = await makeAuthenticatedRequest('/api/v1/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentRequestData),
    });

    console.log('Payment creation response status:', response.status);
    console.log('Payment creation response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Payment creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Payment creation success:', data);
    
    // Handle different response formats
    let paymentData;
    if (Array.isArray(data)) {
      // If API returns array of all payments, get the last one (newest)
      paymentData = data[data.length - 1];
    } else if (data.items && Array.isArray(data.items)) {
      // If API returns paginated response with items array, get the last one (newest)
      paymentData = data.items[data.items.length - 1];
    } else {
      // If API returns single payment object
      paymentData = data;
    }
    
    return {
      success: true,
      data: paymentData,
      message: 'Staff payment created successfully'
    };
  } catch (error) {
    console.error('Error creating staff payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create staff payment'
    };
  }
};

export const getStaffPaymentsFromAPI = async (): Promise<ApiResponse<StaffPaymentApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/payments/', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Staff payments API response:', data);
    
    // Handle paginated response format
    let paymentsData;
    if (Array.isArray(data)) {
      // If API returns direct array
      paymentsData = data;
    } else if (data.items && Array.isArray(data.items)) {
      // If API returns paginated response with items array
      paymentsData = data.items;
    } else {
      // Fallback to original data
      paymentsData = data;
    }
    
    return {
      success: true,
      data: paymentsData,
    };
  } catch (error) {
    console.error('Error fetching staff payments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff payments'
    };
  }
};

export const updateStaffPaymentAPI = async (paymentId: string, paymentData: {
  staffId?: string;
  amount?: number;
  paymentDate?: string;
}): Promise<ApiResponse<StaffPaymentApiResponse>> => {
  try {
    console.log('Updating staff payment with data:', { paymentId, paymentData });
    
    const response = await makeAuthenticatedRequest(`/api/v1/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });

    console.log('Payment update response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Payment update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Payment update success:', data);
    
    // Handle different response formats
    let updatedPaymentData;
    if (Array.isArray(data)) {
      // If API returns array of all payments, get the last one (newest)
      updatedPaymentData = data[data.length - 1];
    } else if (data.items && Array.isArray(data.items)) {
      // If API returns paginated response with items array, get the last one (newest)
      updatedPaymentData = data.items[data.items.length - 1];
    } else {
      // If API returns single payment object
      updatedPaymentData = data;
    }
    
    return {
      success: true,
      data: updatedPaymentData,
      message: 'Staff payment updated successfully'
    };
  } catch (error) {
    console.error('Error updating staff payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update staff payment'
    };
  }
};

export const deleteStaffPaymentAPI = async (paymentId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Deleting staff payment:', paymentId);
    
    const response = await makeAuthenticatedRequest(`/api/v1/payments/${paymentId}`, {
      method: 'DELETE',
    });

    console.log('Payment deletion response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Payment deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Payment deletion success');
    return {
      success: true,
      message: 'Staff payment deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting staff payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete staff payment'
    };
  }
};

// Supplier API operations
export const createSupplier = async (supplierData: {
  name: string;
  contact: string;
  address: string;
}): Promise<ApiResponse<SupplierApiResponse>> => {
  try {
    console.log('Creating supplier with data:', supplierData);
    const response = await makeAuthenticatedRequest('/api/v1/suppliers/', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
    
    console.log('Supplier creation response status:', response.status);
    console.log('Supplier creation response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Supplier creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Supplier creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Supplier created successfully'
    };
  } catch (error) {
    console.error('Error creating supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create supplier'
    };
  }
};

export const getSuppliersFromAPI = async (): Promise<ApiResponse<SupplierApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/suppliers/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get suppliers error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Suppliers API response:', data);
    
    // Handle different response formats
    let suppliersData;
    if (Array.isArray(data)) {
      suppliersData = data;
    } else if (data.items && Array.isArray(data.items)) {
      suppliersData = data.items;
    } else {
      suppliersData = data;
    }
    
    return {
      success: true,
      data: suppliersData
    };
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suppliers'
    };
  }
};

export const getSupplierByIdFromAPI = async (supplierId: string): Promise<ApiResponse<SupplierApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/suppliers/${supplierId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get supplier by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Supplier by ID API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting supplier by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get supplier'
    };
  }
};

export const updateSupplierAPI = async (supplierId: string, supplierData: {
  name?: string;
  contact?: string;
  address?: string;
}): Promise<ApiResponse<SupplierApiResponse>> => {
  try {
    console.log('Updating supplier with data:', { supplierId, supplierData });
    const response = await makeAuthenticatedRequest(`/api/v1/suppliers/${supplierId}`, {
      method: 'PATCH',
      body: JSON.stringify(supplierData),
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Supplier update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Supplier update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Supplier updated successfully'
    };
  } catch (error) {
    console.error('Error updating supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update supplier'
    };
  }
};

export const deleteSupplierAPI = async (supplierId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Deleting supplier:', supplierId);
    const response = await makeAuthenticatedRequest(`/api/v1/suppliers/${supplierId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Supplier deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Supplier deletion success');
    return {
      success: true,
      message: 'Supplier deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete supplier'
    };
  }
};

// Items API operations
export const createItem = async (itemData: {
  name: string;
  unit: string;
}): Promise<ApiResponse<ItemApiResponse>> => {
  try {
    console.log('Creating item with data:', itemData);
    const response = await makeAuthenticatedRequest('/api/v1/items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    
    console.log('Item creation response status:', response.status);
    console.log('Item creation response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Item creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Item creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Item created successfully'
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item'
    };
  }
};

export const getItemsFromAPI = async (): Promise<ApiResponse<ItemApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/items/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get items error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Items API response:', data);
    
    // Handle different response formats
    let itemsData;
    if (Array.isArray(data)) {
      itemsData = data;
    } else if (data.items && Array.isArray(data.items)) {
      itemsData = data.items;
    } else {
      itemsData = data;
    }
    
    return {
      success: true,
      data: itemsData
    };
  } catch (error) {
    console.error('Error getting items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get items'
    };
  }
};

export const getItemByIdFromAPI = async (itemId: string): Promise<ApiResponse<ItemApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/items/${itemId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get item by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Item by ID API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting item by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get item'
    };
  }
};

export const updateItemAPI = async (itemId: string, itemData: {
  name?: string;
  unit?: string;
}): Promise<ApiResponse<ItemApiResponse>> => {
  try {
    console.log('Updating item with data:', { itemId, itemData });
    const response = await makeAuthenticatedRequest(`/api/v1/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Item update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Item update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Item updated successfully'
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item'
    };
  }
};

export const deleteItemAPI = async (itemId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Deleting item:', itemId);
    const response = await makeAuthenticatedRequest(`/api/v1/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Item deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Item deletion success');
    return {
      success: true,
      message: 'Item deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item'
    };
  }
};

// Packaging Types API operations
export const createPackagingType = async (packagingTypeData: {
  name: string;
  description?: string;
  price: number;
}): Promise<ApiResponse<PackagingTypeApiResponse>> => {
  try {
    console.log('Creating packaging type with data:', packagingTypeData);
    const response = await makeAuthenticatedRequest('/api/v1/packaging-types/', {
      method: 'POST',
      body: JSON.stringify(packagingTypeData),
    });
    
    console.log('Packaging type creation response status:', response.status);
    console.log('Packaging type creation response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Packaging type creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Packaging type creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Packaging type created successfully'
    };
  } catch (error) {
    console.error('Error creating packaging type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create packaging type'
    };
  }
};

export const getPackagingTypesFromAPI = async (): Promise<ApiResponse<PackagingTypeApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/packaging-types/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get packaging types error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Packaging types API response:', data);
    
    // Handle different response formats
    let packagingTypesData;
    if (Array.isArray(data)) {
      packagingTypesData = data;
    } else if (data.items && Array.isArray(data.items)) {
      packagingTypesData = data.items;
    } else {
      packagingTypesData = data;
    }
    
    return {
      success: true,
      data: packagingTypesData
    };
  } catch (error) {
    console.error('Error getting packaging types:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get packaging types'
    };
  }
};

export const getPackagingTypeByIdFromAPI = async (packagingTypeId: string): Promise<ApiResponse<PackagingTypeApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/packaging-types/${packagingTypeId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get packaging type by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Packaging type by ID API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting packaging type by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get packaging type'
    };
  }
};

export const updatePackagingTypeAPI = async (packagingTypeId: string, packagingTypeData: {
  name?: string;
  description?: string;
  price?: number;
}): Promise<ApiResponse<PackagingTypeApiResponse>> => {
  try {
    console.log('Updating packaging type with data:', { packagingTypeId, packagingTypeData });
    const response = await makeAuthenticatedRequest(`/api/v1/packaging-types/${packagingTypeId}`, {
      method: 'PATCH',
      body: JSON.stringify(packagingTypeData),
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Packaging type update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Packaging type update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Packaging type updated successfully'
    };
  } catch (error) {
    console.error('Error updating packaging type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update packaging type'
    };
  }
};

export const deletePackagingTypeAPI = async (packagingTypeId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Deleting packaging type:', packagingTypeId);
    const response = await makeAuthenticatedRequest(`/api/v1/packaging-types/${packagingTypeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Packaging type deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Packaging type deletion success');
    return {
      success: true,
      message: 'Packaging type deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting packaging type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete packaging type'
    };
  }
};

// Overhead Cost Types API operations
export const createOverheadCostType = async (overheadCostTypeData: {
  name: string;
}): Promise<ApiResponse<OverheadCostTypeApiResponse>> => {
  try {
    console.log('Creating overhead cost type with data:', overheadCostTypeData);
    const response = await makeAuthenticatedRequest('/api/v1/overhead-cost-types/', {
      method: 'POST',
      body: JSON.stringify(overheadCostTypeData),
    });
    
    console.log('Overhead cost type creation response status:', response.status);
    console.log('Overhead cost type creation response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Overhead cost type creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Overhead cost type creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Overhead cost type created successfully'
    };
  } catch (error) {
    console.error('Error creating overhead cost type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create overhead cost type'
    };
  }
};

export const getOverheadCostTypesFromAPI = async (): Promise<ApiResponse<OverheadCostTypeApiResponse[]>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/overhead-cost-types/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get overhead cost types error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Overhead cost types API response:', data);
    
    // Handle different response formats
    let overheadCostTypesData;
    if (Array.isArray(data)) {
      overheadCostTypesData = data;
    } else if (data.items && Array.isArray(data.items)) {
      overheadCostTypesData = data.items;
    } else {
      overheadCostTypesData = data;
    }
    
    return {
      success: true,
      data: overheadCostTypesData
    };
  } catch (error) {
    console.error('Error getting overhead cost types:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overhead cost types'
    };
  }
};

// Overhead Costs API functions
export const createOverheadCost = async (overheadCostData: CreateOverheadCostRequest): Promise<ApiResponse<OverheadCostApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/overhead-costs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(overheadCostData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Create overhead cost error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Create overhead cost API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error creating overhead cost:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create overhead cost'
    };
  }
};

export const getAllOverheadCosts = async (params?: {
  cost_type?: 'operational' | 'packaging';
  skip?: number;
  limit?: number;
}): Promise<ApiResponse<OverheadCostApiResponse[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.cost_type) {
      queryParams.append('cost_type', params.cost_type);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/api/v1/overhead-costs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get all overhead costs error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle the actual API response format: { success: true, data: [...], total_count: X }
    let overheadCostsData;
    if (data.success && data.data && Array.isArray(data.data)) {
      overheadCostsData = data.data;
    } else if (Array.isArray(data)) {
      overheadCostsData = data;
    } else if (data.items && Array.isArray(data.items)) {
      overheadCostsData = data.items;
    } else if (data.overhead_costs && Array.isArray(data.overhead_costs)) {
      overheadCostsData = data.overhead_costs;
    } else {
      overheadCostsData = data;
    }
    
    return {
      success: true,
      data: overheadCostsData
    };
  } catch (error) {
    console.error('Error getting all overhead costs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overhead costs'
    };
  }
};

export const getOverheadCostById = async (overheadCostId: string): Promise<ApiResponse<OverheadCostApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-costs/${overheadCostId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get overhead cost by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Get overhead cost by ID API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting overhead cost by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overhead cost'
    };
  }
};

export const updateOverheadCostAPI = async (overheadCostId: string, updateData: UpdateOverheadCostRequest): Promise<ApiResponse<OverheadCostApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-costs/${overheadCostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Update overhead cost error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Update overhead cost API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error updating overhead cost:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update overhead cost'
    };
  }
};

export const deleteOverheadCostAPI = async (overheadCostId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-costs/${overheadCostId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Delete overhead cost error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Delete overhead cost API response: Success');
    
    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    console.error('Error deleting overhead cost:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete overhead cost'
    };
  }
};

export const getOverheadCostStats = async (params?: {
  cost_type?: 'operational' | 'packaging';
}): Promise<ApiResponse<OverheadCostStatsResponse>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.cost_type) {
      queryParams.append('cost_type', params.cost_type);
    }

    const url = `/api/v1/overhead-costs/stats/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get overhead cost stats error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Get overhead cost stats API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting overhead cost stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overhead cost statistics'
    };
  }
};

export const getOverheadCostTypeByIdFromAPI = async (overheadCostTypeId: string): Promise<ApiResponse<OverheadCostTypeApiResponse>> => {
  try {
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-cost-types/${overheadCostTypeId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Get overhead cost type by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Overhead cost type by ID API response:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting overhead cost type by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overhead cost type'
    };
  }
};

export const updateOverheadCostTypeAPI = async (overheadCostTypeId: string, overheadCostTypeData: {
  name?: string;
}): Promise<ApiResponse<OverheadCostTypeApiResponse>> => {
  try {
    console.log('Updating overhead cost type with data:', { overheadCostTypeId, overheadCostTypeData });
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-cost-types/${overheadCostTypeId}`, {
      method: 'PATCH',
      body: JSON.stringify(overheadCostTypeData),
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Overhead cost type update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Overhead cost type update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Overhead cost type updated successfully'
    };
  } catch (error) {
    console.error('Error updating overhead cost type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update overhead cost type'
    };
  }
};

export const deleteOverheadCostTypeAPI = async (overheadCostTypeId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Deleting overhead cost type:', overheadCostTypeId);
    const response = await makeAuthenticatedRequest(`/api/v1/overhead-cost-types/${overheadCostTypeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Overhead cost type deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Overhead cost type deletion success');
    return {
      success: true,
      message: 'Overhead cost type deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting overhead cost type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete overhead cost type'
    };
  }
};

// Supply Expense API operations
export const getSupplyExpensesFromAPI = async (): Promise<ApiResponse<Expense[]>> => {
  try {
    console.log('🔵 getSupplyExpensesFromAPI called');
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/supply-expenses/`);
    
    const response = await makeAuthenticatedRequest('/api/v1/supply-expenses/', {
      method: 'GET',
    });

    console.log('🔵 Get supply expenses response status:', response.status);
    console.log('🔵 Get supply expenses response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Get supply expenses error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('🔵 Supply expenses API response:', data);
    
    // Handle different response formats
    let expensesData;
    if (Array.isArray(data)) {
      expensesData = data;
      console.log('🔵 Response is direct array, using as-is');
    } else if (data.items && Array.isArray(data.items)) {
      expensesData = data.items;
      console.log('🔵 Response has items array, using items');
    } else {
      expensesData = data;
      console.log('🔵 Response is single object, using as-is');
    }
    
    console.log('✅ Final expenses data:', expensesData);
    return {
      success: true,
      data: expensesData
    };
  } catch (error) {
    console.error('❌ Error getting supply expenses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get supply expenses'
    };
  }
};

export const createSupplyExpense = async (expenseData: {
  date: string;
  supplier: string;
  items: string;
  quantity: number;
  costPerItem: number;
  category: string;
  purchaseUnit?: string;
  packageSize?: number;
}): Promise<ApiResponse<Expense>> => {
  try {
    console.log('🔵 createSupplyExpense called with data:', expenseData);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/supply-expenses/`);
    
    const response = await makeAuthenticatedRequest('/api/v1/supply-expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });

    console.log('🔵 Supply expense creation response status:', response.status);
    console.log('🔵 Supply expense creation response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Supply expense creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Supply expense creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Supply expense created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating supply expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create supply expense'
    };
  }
};

export const updateSupplyExpenseAPI = async (expenseId: string, expenseData: {
  date?: string;
  supplier?: string;
  items?: string;
  quantity?: number;
  costPerItem?: number;
  category?: string;
  purchaseUnit?: string;
  packageSize?: number;
}): Promise<ApiResponse<Expense>> => {
  try {
    console.log('🔵 updateSupplyExpenseAPI called with:', { expenseId, expenseData });
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/supply-expenses/${expenseId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/supply-expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(expenseData),
    });

    console.log('🔵 Supply expense update response status:', response.status);
    console.log('🔵 Supply expense update response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Supply expense update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Supply expense update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Supply expense updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating supply expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update supply expense'
    };
  }
};

export const deleteSupplyExpenseAPI = async (expenseId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('🔵 deleteSupplyExpenseAPI called with expenseId:', expenseId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/supply-expenses/${expenseId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/supply-expenses/${expenseId}`, {
      method: 'DELETE',
    });

    console.log('🔵 Supply expense deletion response status:', response.status);
    console.log('🔵 Supply expense deletion response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Supply expense deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Supply expense deletion success');
    return {
      success: true,
      message: 'Supply expense deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting supply expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete supply expense'
    };
  }
};

// Recipe API operations
export const createRecipeAPI = async (recipeData: RecipeApiRequest): Promise<ApiResponse<RecipeApiResponse>> => {
  try {
    console.log('🔵 createRecipeAPI called with data:', recipeData);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/`);
    console.log('🔵 Request body will be:', JSON.stringify(recipeData, null, 2));
    
    const response = await makeAuthenticatedRequest('/api/v1/recipes/', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });

    console.log('🔵 Recipe creation response status:', response.status);
    console.log('🔵 Recipe creation response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Clone the response to avoid "body already consumed" error
        const responseClone = response.clone();
        const errorData = await responseClone.json();
        console.error('❌ Recipe creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
        
        // Log detailed error information for 422 errors
        if (response.status === 422) {
          console.error('❌ Validation errors:', errorData);
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map((err: any) => 
              `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
            ).join(', ');
            errorMessage = `Validation errors: ${validationErrors}`;
          }
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Recipe creation success:', data);
    return {
      success: true,
      data: data,
      message: 'Recipe created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create recipe'
    };
  }
};

export const getRecipesFromAPI = async (): Promise<ApiResponse<RecipeApiResponse[]>> => {
  try {
    console.log('🔵 getRecipesFromAPI called');
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/`);
    
    const response = await makeAuthenticatedRequest('/api/v1/recipes/', {
      method: 'GET',
    });

    console.log('🔵 Get recipes response status:', response.status);
    console.log('🔵 Get recipes response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Get recipes error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Get recipes success:', data);
    
    // Handle different response formats
    let recipesData;
    if (Array.isArray(data)) {
      recipesData = data;
    } else if (data.items && Array.isArray(data.items)) {
      recipesData = data.items;
    } else {
      recipesData = data;
    }
    
    return {
      success: true,
      data: recipesData
    };
  } catch (error) {
    console.error('❌ Error getting recipes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recipes'
    };
  }
};

export const getRecipeByIdFromAPI = async (recipeId: string): Promise<ApiResponse<RecipeApiResponse>> => {
  try {
    console.log('🔵 getRecipeByIdFromAPI called with recipeId:', recipeId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/${recipeId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/recipes/${recipeId}`, {
      method: 'GET',
    });

    console.log('🔵 Get recipe by ID response status:', response.status);
    console.log('🔵 Get recipe by ID response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Get recipe by ID error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Get recipe by ID success:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error getting recipe by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recipe'
    };
  }
};

export const updateRecipeAPI = async (recipeId: string, recipeData: Partial<RecipeApiRequest>): Promise<ApiResponse<RecipeApiResponse>> => {
  try {
    console.log('🔵 updateRecipeAPI called with:', { recipeId, recipeData });
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/${recipeId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/recipes/${recipeId}`, {
      method: 'PATCH',
      body: JSON.stringify(recipeData),
    });

    console.log('🔵 Recipe update response status:', response.status);
    console.log('🔵 Recipe update response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Recipe update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Recipe update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Recipe updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recipe'
    };
  }
};

export const deleteRecipeAPI = async (recipeId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('🔵 deleteRecipeAPI called with recipeId:', recipeId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/${recipeId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/recipes/${recipeId}`, {
      method: 'DELETE',
    });

    console.log('🔵 Recipe deletion response status:', response.status);
    console.log('🔵 Recipe deletion response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Recipe deletion error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Recipe deletion success');
    return {
      success: true,
      message: 'Recipe deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete recipe'
    };
  }
};

export const recalculateRecipeCostsAPI = async (recipeId: string): Promise<ApiResponse<RecipeApiResponse>> => {
  try {
    console.log('🔵 recalculateRecipeCostsAPI called with recipeId:', recipeId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/${recipeId}/calculate-costs`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/recipes/${recipeId}/calculate-costs`, {
      method: 'POST',
    });

    console.log('🔵 Recipe cost recalculation response status:', response.status);
    console.log('🔵 Recipe cost recalculation response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Recipe cost recalculation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Recipe cost recalculation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Recipe costs recalculated successfully'
    };
  } catch (error) {
    console.error('❌ Error recalculating recipe costs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to recalculate recipe costs'
    };
  }
};

export const getRecipeCostSummaryAPI = async (): Promise<ApiResponse<RecipeCostSummaryApiResponse>> => {
  try {
    console.log('🔵 getRecipeCostSummaryAPI called');
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/recipes/summary/costs`);
    
    const response = await makeAuthenticatedRequest('/api/v1/recipes/summary/costs', {
      method: 'GET',
    });

    console.log('🔵 Recipe cost summary response status:', response.status);
    console.log('🔵 Recipe cost summary response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Recipe cost summary error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Recipe cost summary success:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error getting recipe cost summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recipe cost summary'
    };
  }
};

// Product API functions
export interface ProductApiRequest {
  name: string;
  unitPrice: number;
  costPerUnit: number;
  quantity: number;
  isAvailable: boolean;
  isActive: boolean;
  date: string;
}

export interface ProductApiResponse {
  id: string;
  name: string;
  unitPrice: number;
  costPerUnit: number;
  quantity: number;
  isAvailable: boolean;
  isActive: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export const createProductAPI = async (productData: ProductApiRequest): Promise<ApiResponse<ProductApiResponse>> => {
  try {
    console.log('🔵 createProductAPI called with data:', productData);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/`);
    
    const response = await makeAuthenticatedRequest('/api/v1/products/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    console.log('🔵 Product creation response status:', response.status);
    console.log('🔵 Product creation response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Product creation error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Product creation success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Product created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product'
    };
  }
};

export const getProductsFromAPI = async (): Promise<ApiResponse<ProductApiResponse[]>> => {
  try {
    console.log('🔵 getProductsFromAPI called');
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/`);
    
    const response = await makeAuthenticatedRequest('/api/v1/products/', {
      method: 'GET',
    });

    console.log('🔵 Products fetch response status:', response.status);
    console.log('🔵 Products fetch response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Products fetch error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Products fetch success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Products fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
};

export const getProductByIdFromAPI = async (productId: string): Promise<ApiResponse<ProductApiResponse>> => {
  try {
    console.log('🔵 getProductByIdFromAPI called with productId:', productId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/${productId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/products/${productId}`, {
      method: 'GET',
    });

    console.log('🔵 Product fetch response status:', response.status);
    console.log('🔵 Product fetch response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Product fetch error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Product fetch success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Product fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    };
  }
};

export const updateProductAPI = async (productId: string, productData: Partial<ProductApiRequest>): Promise<ApiResponse<ProductApiResponse>> => {
  try {
    console.log('🔵 updateProductAPI called with:', { productId, productData });
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/${productId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    console.log('🔵 Product update response status:', response.status);
    console.log('🔵 Product update response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Product update error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Product update success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Product updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product'
    };
  }
};

export const deleteProductAPI = async (productId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('🔵 deleteProductAPI called with productId:', productId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/${productId}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/products/${productId}`, {
      method: 'DELETE',
    });

    console.log('🔵 Product delete response status:', response.status);
    console.log('🔵 Product delete response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Product delete error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Product delete success');
    
    return {
      success: true,
      data: undefined,
      message: 'Product deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product'
    };
  }
};

export const getProductsByDateFromAPI = async (date: string): Promise<ApiResponse<ProductApiResponse[]>> => {
  try {
    console.log('🔵 getProductsByDateFromAPI called with date:', date);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/by-date/${date}`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/products/by-date/${date}`, {
      method: 'GET',
    });

    console.log('🔵 Products by date fetch response status:', response.status);
    console.log('🔵 Products by date fetch response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Products by date fetch error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Products by date fetch success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Products by date fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching products by date:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products by date'
    };
  }
};

export const toggleProductAvailabilityAPI = async (productId: string): Promise<ApiResponse<ProductApiResponse>> => {
  try {
    console.log('🔵 toggleProductAvailabilityAPI called with productId:', productId);
    console.log('🔵 API URL will be:', `${import.meta.env.VITE_API_URL}/api/v1/products/${productId}/availability`);
    
    const response = await makeAuthenticatedRequest(`/api/v1/products/${productId}/availability`, {
      method: 'PATCH',
    });

    console.log('🔵 Product availability toggle response status:', response.status);
    console.log('🔵 Product availability toggle response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Product availability toggle error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Product availability toggle success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Product availability toggled successfully'
    };
  } catch (error) {
    console.error('❌ Error toggling product availability:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle product availability'
    };
  }
};

// Save standard order to API
export const saveStandardOrderToAPI = async (order: CreateOrderRequest): Promise<Order> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/orders/standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Save standard order error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const savedOrder = await response.json();
    return savedOrder;
  } catch (error) {
    console.error('Error saving standard order:', error);
    throw error;
  }
};

// Save custom order to API
export const saveCustomOrderToAPI = async (order: CreateCustomOrderRequest): Promise<Order> => {
  try {
    const response = await makeAuthenticatedRequest('/api/v1/custom-orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Save custom order error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const savedOrder = await response.json();
    return savedOrder;
  } catch (error) {
    console.error('Error saving custom order:', error);
    throw error;
  }
};

// Update product quantities after order creation
export const updateProductQuantities = async (orderItems: { productId: string; quantity: number }[]): Promise<void> => {
  try {
    for (const item of orderItems) {
      const response = await makeAuthenticatedRequest(`/api/v1/products/${item.productId}/reduce-quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: item.quantity }),
      });

      if (!response.ok) {
        console.error(`Failed to update quantity for product ${item.productId}`);
      }
    }
  } catch (error) {
    console.error('Error updating product quantities:', error);
    // Don't throw error here as order was already created successfully
  }
};

// Get all orders from API
export const getAllOrdersFromAPI = async (): Promise<ApiResponse<Order[]>> => {
  try {
    console.log('🔵 getAllOrdersFromAPI: Starting API call to /api/v1/orders/all');
    const response = await makeAuthenticatedRequest('/api/v1/orders/all', {
      method: 'GET',
    });

    console.log('🔵 getAllOrdersFromAPI: Response status:', response.status);
    console.log('🔵 getAllOrdersFromAPI: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('❌ Get all orders error response:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
        const responseText = await response.text().catch(() => '');
        console.error('❌ Raw error response:', responseText);
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const rawResponse = await response.json();
    console.log('🔵 getAllOrdersFromAPI: Raw API response:', rawResponse);
    console.log('🔵 getAllOrdersFromAPI: Response type:', typeof rawResponse);
    console.log('🔵 getAllOrdersFromAPI: Is array:', Array.isArray(rawResponse));
    
    // Handle the expected backend response format
    let ordersData: Order[] = [];
    
    if (rawResponse && typeof rawResponse === 'object' && rawResponse.orders && Array.isArray(rawResponse.orders)) {
      // Expected backend format: { orders: [...], total_count: X, order_types: {...} }
      const backendOrders = rawResponse.orders;
      console.log('🔵 getAllOrdersFromAPI: Found orders array, count:', backendOrders.length);
      console.log('🔵 getAllOrdersFromAPI: Total count from backend:', rawResponse.total_count);
      console.log('🔵 getAllOrdersFromAPI: Order types summary:', rawResponse.order_types);
      
      // Map backend field names to frontend interface
      ordersData = backendOrders.map((backendOrder: any) => {
        console.log('🔵 Mapping backend order:', backendOrder);
        console.log('🔵 Backend order created_by field:', backendOrder.created_by);
        console.log('🔵 Backend order created_by_username field:', backendOrder.created_by_username);
        console.log('🔵 Backend order username field:', backendOrder.username);
        console.log('🔵 Backend order staff_username field:', backendOrder.staff_username);
        console.log('🔵 Backend order items field:', backendOrder.items);
        
        return {
          id: backendOrder.id,
          customerName: backendOrder.customer_name,
          customerContact: backendOrder.customer_contact,
          deliveryType: backendOrder.delivery_type,
          hostel: backendOrder.hostel,
          paymentType: backendOrder.payment_type,
          deliveryFee: backendOrder.delivery_fee,
          specialNotes: backendOrder.special_notes,
          items: (backendOrder.items || []).map((item: any) => ({
            productId: item.productId || item.product_id || item.id || '',
            productName: item.productName || item.product_name || item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.unit_price || item.price || 0,
            subtotal: item.subtotal || item.total || (item.unitPrice || item.unit_price || item.price || 0) * (item.quantity || 1),
            // Keep original backend fields for debugging
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            name: item.name,
            total: item.total
          })),
          total: backendOrder.total,
          orderDate: backendOrder.order_date,
          orderTime: backendOrder.order_time,
          // Try different possible field names for created_by
          createdBy: backendOrder.created_by || backendOrder.created_by_username || backendOrder.username || backendOrder.staff_username || 'Unknown',
          selectedPackage: backendOrder.selected_package,
          packageName: backendOrder.package_name,
          // Custom order fields
          additionalPrice: backendOrder.additional_price,
          colour: backendOrder.colour,
          inscription: backendOrder.inscription,
          totalCost: backendOrder.total_cost,
          // Backend metadata
          createdAt: backendOrder.created_at,
          updatedAt: backendOrder.updated_at,
          // Use order_type from backend if available, otherwise determine from custom fields
          orderType: backendOrder.order_type || (backendOrder.additional_price || backendOrder.colour || backendOrder.inscription || backendOrder.total_cost ? 'custom' : 'standard')
        };
      });
      
      console.log('🔵 getAllOrdersFromAPI: Mapped orders data:', ordersData);
    } else if (Array.isArray(rawResponse)) {
      // Direct array response (fallback)
      ordersData = rawResponse;
      console.log('🔵 getAllOrdersFromAPI: Using direct array response, count:', ordersData.length);
    } else if (rawResponse && typeof rawResponse === 'object') {
      // Check for other common response wrapper patterns
      if (rawResponse.data && Array.isArray(rawResponse.data)) {
        ordersData = rawResponse.data;
        console.log('🔵 getAllOrdersFromAPI: Using response.data, count:', ordersData.length);
      } else if (rawResponse.items && Array.isArray(rawResponse.items)) {
        ordersData = rawResponse.items;
        console.log('🔵 getAllOrdersFromAPI: Using response.items, count:', ordersData.length);
      } else if (rawResponse.results && Array.isArray(rawResponse.results)) {
        ordersData = rawResponse.results;
        console.log('🔵 getAllOrdersFromAPI: Using response.results, count:', ordersData.length);
      } else {
        console.log('🔵 getAllOrdersFromAPI: Unknown response structure, keys:', Object.keys(rawResponse));
        console.log('🔵 getAllOrdersFromAPI: Full response structure:', JSON.stringify(rawResponse, null, 2));
      }
    }

    console.log('✅ getAllOrdersFromAPI: Final orders data:', ordersData);
    console.log('✅ getAllOrdersFromAPI: Final count:', ordersData.length);
    
    return {
      success: true,
      data: ordersData,
      message: `Orders fetched successfully (${ordersData.length} orders)`
    };
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    };
  }
};

// Sales API Functions
export const getSalesSummary = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<SalesSummaryResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/sales/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting sales summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getSalesPaymentBreakdown = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<PaymentBreakdownItem[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/sales/breakdown/payment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting sales payment breakdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getSalesProductBreakdown = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<ProductBreakdownItem[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/sales/breakdown/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting sales product breakdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getSalesOrders = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
  skip?: number;
  limit?: number;
}): Promise<ApiResponse<SalesOrder[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/api/v1/sales/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting sales orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const exportSalesData = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/sales/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting sales data:', error);
    throw error;
  }
};

// Financial API Functions
export const getFinancialSummary = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<FinancialSummaryResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/financial/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting financial summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getFinancialRevenue = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<FinancialRevenueResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/financial/revenue${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting financial revenue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getFinancialExpenses = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<FinancialExpensesResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/financial/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting financial expenses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getFinancialProfit = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<FinancialProfitResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/financial/profit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting financial profit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getFinancialBreakdown = async (params?: {
  date?: string;
  period?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<FinancialBreakdownResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }

    const url = `/api/v1/financial/breakdown${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (parseError) {
        const responseText = await response.text().catch(() => '');
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error getting financial breakdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};