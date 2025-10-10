import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, ShoppingCart, RefreshCw } from "lucide-react";
import { getProductsFromAPI, getPackagingTypesFromAPI, saveOrder, saveStandardOrderToAPI, saveCustomOrderToAPI, updateProductQuantities, Product, Order, CreateOrderRequest, CreateCustomOrderRequest, ProductApiResponse, PackagingTypeApiResponse } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";


interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const CreateOrder = () => {
  const { toast } = useToast();
  
  // Standard Order State
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [hostel, setHostel] = useState("");
  const [paymentType, setPaymentType] = useState<'momo' | 'cash'>('cash');
  const [deliveryFee, setDeliveryFee] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  
  // Custom Order State
  const [customOrderSelectedProduct, setCustomOrderSelectedProduct] = useState("");
  const [customOrderProductQuantity, setCustomOrderProductQuantity] = useState("");
  const [customOrderItems, setCustomOrderItems] = useState<OrderItem[]>([]);
  const [customOrderAdditionalPrice, setCustomOrderAdditionalPrice] = useState("");
  const [customOrderTotalCost, setCustomOrderTotalCost] = useState("");
  const [customOrderColour, setCustomOrderColour] = useState("");
  const [customOrderInscription, setCustomOrderInscription] = useState("");
  const [customOrderCustomerName, setCustomOrderCustomerName] = useState("");
  const [customOrderCustomerContact, setCustomOrderCustomerContact] = useState("");
  const [customOrderIsDelivery, setCustomOrderIsDelivery] = useState(false);
  const [customOrderHostel, setCustomOrderHostel] = useState("");
  const [customOrderPaymentType, setCustomOrderPaymentType] = useState<'momo' | 'cash'>('cash');
  const [customOrderDeliveryFee, setCustomOrderDeliveryFee] = useState("");
  const [customOrderSpecialNotes, setCustomOrderSpecialNotes] = useState("");
  const [customOrderSelectedPackage, setCustomOrderSelectedPackage] = useState("");
  const [customOrderPackageQuantity, setCustomOrderPackageQuantity] = useState("");
  const [customOrderPackages, setCustomOrderPackages] = useState<OrderItem[]>([]);
  
  const [availableProducts, setAvailableProducts] = useState<ProductApiResponse[]>([]);
  const [availablePackages, setAvailablePackages] = useState<PackagingTypeApiResponse[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageQuantity, setPackageQuantity] = useState("");
  const [orderPackages, setOrderPackages] = useState<OrderItem[]>([]);
  const [productsLastUpdated, setProductsLastUpdated] = useState<Date | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    loadProducts();
    loadPackages();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await getProductsFromAPI();
      if (response.success && response.data) {
        setAvailableProducts(response.data);
        setProductsLastUpdated(new Date());
      } else {
        console.error('Error loading products:', response.error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await getPackagingTypesFromAPI();
      if (response.success && response.data) {
        setAvailablePackages(response.data);
      } else {
        console.error('Error loading packages:', response.error);
        alert('Error loading packages. Please try again.');
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      alert('Error loading packages. Please try again.');
    }
  };

  const addOrderItem = async () => {
    if (!selectedProduct || !productQuantity) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter quantity",
      });
      return;
    }

    const quantity = parseInt(productQuantity);
    if (quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    // Check if product data is stale (older than 10 seconds)
    const isCacheStale = !productsLastUpdated || (Date.now() - productsLastUpdated.getTime() > 10000);
    
    // Only fetch fresh data if cache is stale
    if (isCacheStale) {
      setIsLoadingProducts(true);
      try {
        const response = await getProductsFromAPI();
        if (!response.success || !response.data) {
          toast({
            title: "Error",
            description: "Failed to verify product availability. Please try again.",
            variant: "destructive"
          });
          setIsLoadingProducts(false);
          return;
        }
        setAvailableProducts(response.data);
        setProductsLastUpdated(new Date());
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify product availability. Please try again.",
          variant: "destructive"
        });
        setIsLoadingProducts(false);
        return;
      } finally {
        setIsLoadingProducts(false);
      }
    }
    
    // Validate with current data (fresh or cached if < 10 seconds old)
    const product = availableProducts.find(p => p.id === selectedProduct);
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
      });
      return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);
    const existingQuantity = existingItemIndex >= 0 ? orderItems[existingItemIndex].quantity : 0;
    const totalQuantity = existingQuantity + quantity;
    
    // Check if product has enough quantity available for the total
    if (product.quantity < totalQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available for ${product.name}. You already have ${existingQuantity} unit(s) in the order.`,
        variant: "destructive"
      });
      return;
    }
    
    // Validation passed - add the item
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.unitPrice,
        subtotal: quantity * product.unitPrice
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset form
    setSelectedProduct("");
    setProductQuantity("");
  };

  const removeOrderItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const addOrderPackage = () => {
    if (!selectedPackage || !packageQuantity) {
      alert('Please select a package and enter quantity');
      return;
    }

    const packageItem = availablePackages.find(p => p.id === selectedPackage);
    if (!packageItem) {
      alert('Package not found');
      return;
    }

    const quantity = parseInt(packageQuantity);
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const existingPackageIndex = orderPackages.findIndex(pkg => pkg.productId === selectedPackage);
    
    if (existingPackageIndex >= 0) {
      // Update existing package
      const updatedPackages = [...orderPackages];
      updatedPackages[existingPackageIndex].quantity += quantity;
      updatedPackages[existingPackageIndex].subtotal = updatedPackages[existingPackageIndex].quantity * updatedPackages[existingPackageIndex].unitPrice;
      setOrderPackages(updatedPackages);
    } else {
      // Add new package
      const newPackage: OrderItem = {
        productId: packageItem.id,
        productName: packageItem.name,
        quantity: quantity,
        unitPrice: packageItem.price,
        subtotal: quantity * packageItem.price
      };
      setOrderPackages([...orderPackages, newPackage]);
    }

    // Reset form
    setSelectedPackage("");
    setPackageQuantity("");
  };

  const removeOrderPackage = (packageId: string) => {
    setOrderPackages(orderPackages.filter(pkg => pkg.productId !== packageId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculatePackageSubtotal = () => {
    return orderPackages.reduce((sum, pkg) => sum + pkg.subtotal, 0);
  };

  const calculateTotal = () => {
    const productSubtotal = calculateSubtotal();
    const packageSubtotal = calculatePackageSubtotal();
    const delivery = isDelivery ? parseFloat(deliveryFee) || 0 : 0;
    return productSubtotal + packageSubtotal + delivery;
  };

  const addCustomOrderItem = async () => {
    if (!customOrderSelectedProduct || !customOrderProductQuantity) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter quantity",
      });
      return;
    }

    const quantity = parseInt(customOrderProductQuantity);
    if (quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    // Check if product data is stale (older than 10 seconds)
    const isCacheStale = !productsLastUpdated || (Date.now() - productsLastUpdated.getTime() > 10000);
    
    // Only fetch fresh data if cache is stale
    if (isCacheStale) {
      setIsLoadingProducts(true);
      try {
        const response = await getProductsFromAPI();
        if (!response.success || !response.data) {
          toast({
            title: "Error",
            description: "Failed to verify product availability. Please try again.",
            variant: "destructive"
          });
          setIsLoadingProducts(false);
          return;
        }
        setAvailableProducts(response.data);
        setProductsLastUpdated(new Date());
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify product availability. Please try again.",
          variant: "destructive"
        });
        setIsLoadingProducts(false);
        return;
      } finally {
        setIsLoadingProducts(false);
      }
    }
    
    // Validate with current data (fresh or cached if < 10 seconds old)
    const product = availableProducts.find(p => p.id === customOrderSelectedProduct);
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
      });
      return;
    }

    const existingItemIndex = customOrderItems.findIndex(item => item.productId === customOrderSelectedProduct);
    const existingQuantity = existingItemIndex >= 0 ? customOrderItems[existingItemIndex].quantity : 0;
    const totalQuantity = existingQuantity + quantity;
    
    // Check if product has enough quantity available for the total
    if (product.quantity < totalQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available for ${product.name}. You already have ${existingQuantity} unit(s) in the order.`,
        variant: "destructive"
      });
      return;
    }
    
    // Validation passed - add the item
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...customOrderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setCustomOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.unitPrice,
        subtotal: quantity * product.unitPrice
      };
      setCustomOrderItems([...customOrderItems, newItem]);
    }

    // Reset form
    setCustomOrderSelectedProduct("");
    setCustomOrderProductQuantity("");
  };

  const removeCustomOrderItem = (productId: string) => {
    setCustomOrderItems(customOrderItems.filter(item => item.productId !== productId));
  };

  const addCustomOrderPackage = () => {
    if (!customOrderSelectedPackage || !customOrderPackageQuantity) {
      alert('Please select a package and enter quantity');
      return;
    }

    const packageItem = availablePackages.find(p => p.id === customOrderSelectedPackage);
    if (!packageItem) {
      alert('Package not found');
      return;
    }

    const quantity = parseInt(customOrderPackageQuantity);
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const existingPackageIndex = customOrderPackages.findIndex(pkg => pkg.productId === customOrderSelectedPackage);
    
    if (existingPackageIndex >= 0) {
      // Update existing package
      const updatedPackages = [...customOrderPackages];
      updatedPackages[existingPackageIndex].quantity += quantity;
      updatedPackages[existingPackageIndex].subtotal = updatedPackages[existingPackageIndex].quantity * updatedPackages[existingPackageIndex].unitPrice;
      setCustomOrderPackages(updatedPackages);
    } else {
      // Add new package
      const newPackage: OrderItem = {
        productId: packageItem.id,
        productName: packageItem.name,
        quantity: quantity,
        unitPrice: packageItem.price,
        subtotal: quantity * packageItem.price
      };
      setCustomOrderPackages([...customOrderPackages, newPackage]);
    }

    // Reset form
    setCustomOrderSelectedPackage("");
    setCustomOrderPackageQuantity("");
  };

  const removeCustomOrderPackage = (packageId: string) => {
    setCustomOrderPackages(customOrderPackages.filter(pkg => pkg.productId !== packageId));
  };

  const calculateCustomOrderSubtotal = () => {
    return customOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateCustomOrderPackageSubtotal = () => {
    return customOrderPackages.reduce((sum, pkg) => sum + pkg.subtotal, 0);
  };

  const calculateCustomOrderTotal = () => {
    const productSubtotal = calculateCustomOrderSubtotal();
    const packageSubtotal = calculateCustomOrderPackageSubtotal();
    const additionalPrice = parseFloat(customOrderAdditionalPrice) || 0;
    const totalCost = parseFloat(customOrderTotalCost) || 0;
    const delivery = customOrderIsDelivery ? parseFloat(customOrderDeliveryFee) || 0 : 0;
    return productSubtotal + packageSubtotal + additionalPrice + totalCost + delivery;
  };

  const submitStandardOrder = async () => {
    if (!customerName || !customerContact || (orderItems.length === 0 && orderPackages.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item or package",
      });
      return;
    }

    if (isDelivery && !hostel) {
      toast({
        title: "Validation Error",
        description: "Please enter hostel for delivery orders",
      });
      return;
    }

    // Combine products and packages
    const allOrderItems = [...orderItems, ...orderPackages];
    
    const orderRequest: CreateOrderRequest = {
      customerName,
      customerContact,
      deliveryType: isDelivery ? 'delivery' : 'pickup',
      hostel: isDelivery ? hostel : undefined,
      paymentType,
      deliveryFee: isDelivery ? parseFloat(deliveryFee) || 0 : 0,
      specialNotes,
      items: allOrderItems,
      total: calculateTotal(),
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString(),
      selectedPackage: selectedPackage !== "none" ? selectedPackage : undefined,
      packageName: selectedPackage !== "none" ? availablePackages.find(p => p.id === selectedPackage)?.name : undefined,
      // DON'T send createdBy - let backend set it from authentication token
    };

    try {
      const savedOrder = await saveStandardOrderToAPI(orderRequest);
      
      // Update product quantities
      const productItems = allOrderItems.filter(item => !item.productName.includes('Package')); // Filter out packages
      if (productItems.length > 0) {
        await updateProductQuantities(productItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })));
        
        // Reload products to show updated quantities
        await loadProducts();
      }
      
      toast({
        title: "Success",
        description: `Order created successfully! Order ID: ${savedOrder.id}`,
      });
      
      // Reset form
      setCustomerName("");
      setCustomerContact("");
      setIsDelivery(false);
      setHostel("");
      setPaymentType('cash');
      setDeliveryFee("");
      setSpecialNotes("");
      setOrderItems([]);
      setSelectedProduct("");
      setProductQuantity("");
      setOrderPackages([]);
      setSelectedPackage("");
      setPackageQuantity("");
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : "Error creating order. Please try again.";
      
      // If it's a stock error, refresh products to show accurate inventory
      if (errorMessage.includes('Insufficient quantity') || errorMessage.includes('Available:')) {
        await loadProducts();
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const submitCustomOrder = async () => {
    if (!customOrderCustomerName || !customOrderCustomerContact || (customOrderItems.length === 0 && customOrderPackages.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item or package",
      });
      return;
    }

    if (customOrderIsDelivery && !customOrderHostel) {
      toast({
        title: "Validation Error",
        description: "Please enter hostel for delivery orders",
      });
      return;
    }

    // Create custom order items with color and inscription details
    const customOrderItemsWithDetails = customOrderItems.map(item => ({
      ...item,
      productName: `${item.productName}${customOrderColour ? ` (${customOrderColour})` : ''}${customOrderInscription ? ` - "${customOrderInscription}"` : ''}`
    }));

    // Combine products and packages
    const allOrderItems = [...customOrderItemsWithDetails, ...customOrderPackages];

    const customOrderRequest: CreateCustomOrderRequest = {
      customerName: customOrderCustomerName,
      customerContact: customOrderCustomerContact,
      deliveryType: customOrderIsDelivery ? 'delivery' : 'pickup',
      hostel: customOrderIsDelivery ? customOrderHostel : undefined,
      paymentType: customOrderPaymentType,
      deliveryFee: customOrderIsDelivery ? parseFloat(customOrderDeliveryFee) || 0 : 0,
      specialNotes: customOrderSpecialNotes,
      items: allOrderItems,
      total: calculateCustomOrderTotal(),
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString(),
      selectedPackage: customOrderSelectedPackage !== "none" ? customOrderSelectedPackage : undefined,
      packageName: customOrderSelectedPackage !== "none" ? availablePackages.find(p => p.id === customOrderSelectedPackage)?.name : undefined,
      additionalPrice: parseFloat(customOrderAdditionalPrice) || 0,
      colour: customOrderColour,
      inscription: customOrderInscription,
      totalCost: parseFloat(customOrderTotalCost) || 0,
      // DON'T send createdBy - let backend set it from authentication token
    };

    try {
      const savedOrder = await saveCustomOrderToAPI(customOrderRequest);
      
      // Update product quantities
      const productItems = allOrderItems.filter(item => !item.productName.includes('Package')); // Filter out packages
      if (productItems.length > 0) {
        await updateProductQuantities(productItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })));
        
        // Reload products to show updated quantities
        await loadProducts();
      }
      
      toast({
        title: "Success",
        description: `Custom order created successfully! Order ID: ${savedOrder.id}`,
      });
      
      // Reset form
      setCustomOrderItems([]);
      setCustomOrderSelectedProduct("");
      setCustomOrderProductQuantity("");
      setCustomOrderPackages([]);
      setCustomOrderSelectedPackage("");
      setCustomOrderPackageQuantity("");
      setCustomOrderAdditionalPrice("");
      setCustomOrderTotalCost("");
      setCustomOrderColour("");
      setCustomOrderInscription("");
      setCustomOrderCustomerName("");
      setCustomOrderCustomerContact("");
      setCustomOrderIsDelivery(false);
      setCustomOrderHostel("");
      setCustomOrderPaymentType('cash');
      setCustomOrderDeliveryFee("");
      setCustomOrderSpecialNotes("");
    } catch (error) {
      console.error('Error creating custom order:', error);
      const errorMessage = error instanceof Error ? error.message : "Error creating custom order. Please try again.";
      
      // If it's a stock error, refresh products to show accurate inventory
      if (errorMessage.includes('Insufficient quantity') || errorMessage.includes('Available:')) {
        await loadProducts();
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Create New Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="custom-orders">Custom Orders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="space-y-6 mt-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer-name">Customer Name *</Label>
                        <Input
                          id="customer-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-contact">Contact Number *</Label>
                        <Input
                          id="customer-contact"
                          value={customerContact}
                          onChange={(e) => setCustomerContact(e.target.value)}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="delivery-mode"
                          checked={isDelivery}
                          onCheckedChange={setIsDelivery}
                        />
                        <Label htmlFor="delivery-mode">Delivery</Label>
                      </div>
                      {isDelivery && (
                        <>
                          <div className="flex-1">
                            <Label htmlFor="hostel">Hostel *</Label>
                            <Input
                              id="hostel"
                              value={hostel}
                              onChange={(e) => setHostel(e.target.value)}
                              placeholder="Enter hostel name"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="delivery-fee">Delivery Fee (₵)</Label>
                            <Input
                              id="delivery-fee"
                              type="number"
                              value={deliveryFee}
                              onChange={(e) => setDeliveryFee(e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Add Products</h3>
                      <div className="flex items-center gap-2">
                        {productsLastUpdated && (
                          <span className="text-xs text-muted-foreground">
                            Last updated: {productsLastUpdated.toLocaleTimeString()}
                          </span>
                        )}
                        <Button 
                          onClick={loadProducts} 
                          variant="outline" 
                          size="sm"
                          disabled={isLoadingProducts}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="product-select">Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₵{product.unitPrice.toFixed(2)} (Qty: {product.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addOrderItem} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                    
                    {/* Products List */}
                    {orderItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Selected Products</h4>
                        {orderItems.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                ₵{item.unitPrice.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₵{item.subtotal.toFixed(2)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeOrderItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Package Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="package-select">Package</Label>
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} {pkg.description && `- ${pkg.description}`} - ₵{pkg.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="package-quantity">Quantity</Label>
                        <Input
                          id="package-quantity"
                          type="number"
                          value={packageQuantity}
                          onChange={(e) => setPackageQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addOrderPackage} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>
                    
                    {/* Packages List */}
                    {orderPackages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Selected Packages</h4>
                        {orderPackages.map((pkg) => (
                          <div key={pkg.productId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{pkg.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                ₵{pkg.unitPrice.toFixed(2)} × {pkg.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₵{pkg.subtotal.toFixed(2)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeOrderPackage(pkg.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Order Total */}
                  {(orderItems.length > 0 || orderPackages.length > 0) && (
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        {orderItems.length > 0 && (
                          <div className="flex justify-between">
                            <span>Products Subtotal:</span>
                            <span>₵{calculateSubtotal().toFixed(2)}</span>
                          </div>
                        )}
                        {orderPackages.length > 0 && (
                          <div className="flex justify-between">
                            <span>Packages Subtotal:</span>
                            <span>₵{calculatePackageSubtotal().toFixed(2)}</span>
                          </div>
                        )}
                        {isDelivery && parseFloat(deliveryFee) > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span>₵{parseFloat(deliveryFee).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>₵{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Notes */}
                  <div className="space-y-4">
                    <Label htmlFor="special-notes">Special Notes</Label>
                    <Textarea
                      id="special-notes"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Any special instructions or notes..."
                      rows={3}
                    />
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-4">
                    <Label htmlFor="payment-type">Payment Type</Label>
                    <Select value={paymentType} onValueChange={(value: 'momo' | 'cash') => setPaymentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="momo">MoMo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button onClick={submitStandardOrder} className="w-full" size="lg">
                    Create Order
                  </Button>
                </TabsContent>
                
                <TabsContent value="custom-orders" className="space-y-6 mt-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="custom-customer-name">Customer Name *</Label>
                        <Input
                          id="custom-customer-name"
                          value={customOrderCustomerName}
                          onChange={(e) => setCustomOrderCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-customer-contact">Contact Number *</Label>
                        <Input
                          id="custom-customer-contact"
                          value={customOrderCustomerContact}
                          onChange={(e) => setCustomOrderCustomerContact(e.target.value)}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="custom-delivery-mode"
                          checked={customOrderIsDelivery}
                          onCheckedChange={setCustomOrderIsDelivery}
                        />
                        <Label htmlFor="custom-delivery-mode">Delivery</Label>
                      </div>
                      {customOrderIsDelivery && (
                        <>
                          <div className="flex-1">
                            <Label htmlFor="custom-hostel">Hostel *</Label>
                            <Input
                              id="custom-hostel"
                              value={customOrderHostel}
                              onChange={(e) => setCustomOrderHostel(e.target.value)}
                              placeholder="Enter hostel name"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="custom-delivery-fee">Delivery Fee (₵)</Label>
                            <Input
                              id="custom-delivery-fee"
                              type="number"
                              value={customOrderDeliveryFee}
                              onChange={(e) => setCustomOrderDeliveryFee(e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Add Products</h3>
                      <div className="flex items-center gap-2">
                        {productsLastUpdated && (
                          <span className="text-xs text-muted-foreground">
                            Last updated: {productsLastUpdated.toLocaleTimeString()}
                          </span>
                        )}
                        <Button 
                          onClick={loadProducts} 
                          variant="outline" 
                          size="sm"
                          disabled={isLoadingProducts}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="custom-product-select">Product</Label>
                        <Select value={customOrderSelectedProduct} onValueChange={setCustomOrderSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₵{product.unitPrice.toFixed(2)} (Qty: {product.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="custom-quantity">Quantity</Label>
                        <Input
                          id="custom-quantity"
                          type="number"
                          value={customOrderProductQuantity}
                          onChange={(e) => setCustomOrderProductQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addCustomOrderItem} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                    
                    {/* Products List */}
                    {customOrderItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Selected Products</h4>
                        {customOrderItems.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                ₵{item.unitPrice.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₵{item.subtotal.toFixed(2)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCustomOrderItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Package Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="custom-package-select">Package</Label>
                        <Select value={customOrderSelectedPackage} onValueChange={setCustomOrderSelectedPackage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} {pkg.description && `- ${pkg.description}`} - ₵{pkg.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="custom-package-quantity">Quantity</Label>
                        <Input
                          id="custom-package-quantity"
                          type="number"
                          value={customOrderPackageQuantity}
                          onChange={(e) => setCustomOrderPackageQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addCustomOrderPackage} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>
                    
                    {/* Packages List */}
                    {customOrderPackages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Selected Packages</h4>
                        {customOrderPackages.map((pkg) => (
                          <div key={pkg.productId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{pkg.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                ₵{pkg.unitPrice.toFixed(2)} × {pkg.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₵{pkg.subtotal.toFixed(2)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCustomOrderPackage(pkg.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Custom Order Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Custom Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="custom-additional-price">Additional Price (₵)</Label>
                        <Input
                          id="custom-additional-price"
                          type="number"
                          value={customOrderAdditionalPrice}
                          onChange={(e) => setCustomOrderAdditionalPrice(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-total-cost">Total Cost (₵)</Label>
                        <Input
                          id="custom-total-cost"
                          type="number"
                          value={customOrderTotalCost}
                          onChange={(e) => setCustomOrderTotalCost(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="custom-colour">Colour</Label>
                        <Input
                          id="custom-colour"
                          value={customOrderColour}
                          onChange={(e) => setCustomOrderColour(e.target.value)}
                          placeholder="Enter colour preference"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-inscription">Inscription (E.g. Happy Birthday, Ewura Ama)</Label>
                        <Input
                          id="custom-inscription"
                          value={customOrderInscription}
                          onChange={(e) => setCustomOrderInscription(e.target.value)}
                          placeholder="Enter inscription text"
                        />
                      </div>
                    </div>
                  </div>


                  {/* Custom Order Total */}
                  {(customOrderItems.length > 0 || customOrderPackages.length > 0) && (
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        {customOrderItems.length > 0 && (
                          <div className="flex justify-between">
                            <span>Products Subtotal:</span>
                            <span>₵{calculateCustomOrderSubtotal().toFixed(2)}</span>
                          </div>
                        )}
                        {customOrderPackages.length > 0 && (
                          <div className="flex justify-between">
                            <span>Packages Subtotal:</span>
                            <span>₵{calculateCustomOrderPackageSubtotal().toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(customOrderAdditionalPrice) > 0 && (
                          <div className="flex justify-between">
                            <span>Additional:</span>
                            <span>₵{parseFloat(customOrderAdditionalPrice).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(customOrderTotalCost) > 0 && (
                          <div className="flex justify-between">
                            <span>Total Cost:</span>
                            <span>₵{parseFloat(customOrderTotalCost).toFixed(2)}</span>
                          </div>
                        )}
                        {customOrderIsDelivery && parseFloat(customOrderDeliveryFee) > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span>₵{parseFloat(customOrderDeliveryFee).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>₵{calculateCustomOrderTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Notes for Custom Order */}
                  <div className="space-y-4">
                    <Label htmlFor="custom-special-notes">Special Notes</Label>
                    <Textarea
                      id="custom-special-notes"
                      value={customOrderSpecialNotes}
                      onChange={(e) => setCustomOrderSpecialNotes(e.target.value)}
                      placeholder="Any special instructions, delivery time, or additional notes..."
                      rows={3}
                    />
                  </div>

                  {/* Payment Type for Custom Order */}
                  <div className="space-y-4">
                    <Label htmlFor="custom-payment-type">Payment Type</Label>
                    <Select value={customOrderPaymentType} onValueChange={(value: 'momo' | 'cash') => setCustomOrderPaymentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="momo">MoMo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button for Custom Order */}
                  <Button onClick={submitCustomOrder} className="w-full" size="lg">
                    Create Custom Order
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;