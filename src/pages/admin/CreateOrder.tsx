import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Check, Printer, ChevronsUpDown, Check as CheckIcon } from "lucide-react";
import { getProducts, saveOrder, updateProductQuantity, getPackagingTypes, Product, Order, PackagingType } from "@/lib/dataService";

// Get current user from localStorage or session
const getCurrentUser = (): string => {
  // This would typically come from your authentication system
  // For now, we'll use a simple approach
  const currentUser = localStorage.getItem('currentUser') || 'admin';
  return currentUser;
};

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const CreateOrder = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [hostel, setHostel] = useState("");
  const [paymentType, setPaymentType] = useState<'momo' | 'cash'>('cash');
  const [deliveryFee, setDeliveryFee] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [customOrderPrice, setCustomOrderPrice] = useState("");
  const [customOrderAdditionalPrice, setCustomOrderAdditionalPrice] = useState("");
  const [customOrderColors, setCustomOrderColors] = useState("");
  const [customOrderInscription, setCustomOrderInscription] = useState("");
  const [customOrderProduct, setCustomOrderProduct] = useState("");
  const [customOrderProductQuantity, setCustomOrderProductQuantity] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availablePackages, setAvailablePackages] = useState<PackagingType[]>([]);
  const [packageQuantity, setPackageQuantity] = useState("");

  const loadData = () => {
    try {
      const productsData = getProducts();
      const packagesData = getPackagingTypes();
      setAvailableProducts(productsData);
      setAvailablePackages(packagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => 
    availableProducts.filter(product => 
      product.isAvailable && 
      product.isActive && 
      product.quantity > 0
    ), [availableProducts]
  );
  
  const searchFilteredProducts = useMemo(() => {
    if (productSearchValue.trim() === "") {
      return filteredProducts;
    }
    const searchTerm = productSearchValue.toLowerCase();
    return filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }, [filteredProducts, productSearchValue]);

  useEffect(() => {
    loadData();
  }, []);

  const addProductToOrder = () => {
    const quantity = parseInt(productQuantity) || 0;
    if (selectedProduct && quantity > 0) {
      if (selectedProduct === "custom-order") {
        if (!customOrderPrice || parseFloat(customOrderPrice) <= 0) {
          alert("Please enter a valid price for the custom order");
          return;
        }
        
        const customOrderName = "Custom Order";
        const customOrderId = `custom-${Date.now()}`;
        const basePrice = parseFloat(customOrderPrice);
        const additionalPrice = parseFloat(customOrderAdditionalPrice) || 0;
        const unitPrice = basePrice + additionalPrice;
        
        const customDetails = [];
        if (customOrderColors) customDetails.push(`Colors: ${customOrderColors}`);
        if (customOrderInscription) customDetails.push(`Inscription: ${customOrderInscription}`);
        if (additionalPrice > 0) customDetails.push(`Additional: ₵${additionalPrice.toFixed(2)}`);
        
        const productName = customDetails.length > 0 
          ? `${customOrderName} - ${customDetails.join(', ')}`
          : customOrderName;
        
        const newItem: OrderItem = {
          productId: customOrderId,
          productName: productName,
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: unitPrice * quantity
        };
        
        setOrderItems([...orderItems, newItem]);
        setSelectedProduct("");
        setProductQuantity("");
        setCustomOrderPrice("");
        setCustomOrderAdditionalPrice("");
        setCustomOrderColors("");
        setCustomOrderInscription("");
        setCustomOrderProduct("");
        setCustomOrderProductQuantity("");
        setProductSearchValue("");
        return;
      }
      
      const product = availableProducts.find(p => p.id === selectedProduct);
      if (product && product.isAvailable && product.quantity > 0) {
        if (quantity > product.quantity) {
          alert(`Insufficient quantity. Available: ${product.quantity}, Requested: ${quantity}`);
          return;
        }
        
        const existingItem = orderItems.find(item => item.productId === selectedProduct);
        
        if (existingItem) {
          const totalRequested = existingItem.quantity + quantity;
          if (totalRequested > product.quantity) {
            alert(`Insufficient quantity. Available: ${product.quantity}, Total requested: ${totalRequested}`);
            return;
          }
          
          setOrderItems(orderItems.map(item => 
            item.productId === selectedProduct 
              ? { ...item, quantity: totalRequested, subtotal: totalRequested * item.unitPrice }
              : item
          ));
        } else {
          const newItem: OrderItem = {
            productId: selectedProduct,
            productName: product.name,
            quantity: quantity,
            unitPrice: product.unitPrice,
            subtotal: product.unitPrice * quantity
          };
          setOrderItems([...orderItems, newItem]);
        }
        
        setSelectedProduct("");
        setProductQuantity("");
        setProductSearchValue("");
      }
    }
  };

  const addPackageToOrder = () => {
    const quantity = parseInt(packageQuantity) || 0;
    if (selectedPackages[0] && quantity > 0) {
      const pkg = availablePackages.find(p => p.id === selectedPackages[0]);
      if (pkg && pkg.isAvailable) {
        const existingItem = orderItems.find(item => item.productId === selectedPackages[0]);
        
        if (existingItem) {
          const totalRequested = existingItem.quantity + quantity;
          
          setOrderItems(orderItems.map(item => 
            item.productId === selectedPackages[0] 
              ? { ...item, quantity: totalRequested, subtotal: totalRequested * item.unitPrice }
              : item
          ));
        } else {
          const newItem: OrderItem = {
            productId: selectedPackages[0],
            productName: pkg.name,
            quantity: quantity,
            unitPrice: pkg.unitPrice,
            subtotal: pkg.unitPrice * quantity
          };
          setOrderItems([...orderItems, newItem]);
        }
        
        setSelectedPackages([""]);
        setPackageQuantity("");
      }
    }
  };

  const addProductToCustomOrder = () => {
    const quantity = parseInt(customOrderProductQuantity) || 0;
    if (customOrderProduct && quantity > 0) {
      const product = availableProducts.find(p => p.id === customOrderProduct);
      if (product && product.isAvailable && product.quantity > 0) {
        if (quantity > product.quantity) {
          alert(`Insufficient quantity. Available: ${product.quantity}, Requested: ${quantity}`);
          return;
        }
        
        const existingItem = orderItems.find(item => item.productId === customOrderProduct);
        
        if (existingItem) {
          const totalRequested = existingItem.quantity + quantity;
          if (totalRequested > product.quantity) {
            alert(`Insufficient quantity. Available: ${product.quantity}, Total requested: ${totalRequested}`);
            return;
          }
          
          setOrderItems(orderItems.map(item => 
            item.productId === customOrderProduct 
              ? { ...item, quantity: totalRequested, subtotal: 0 } // Free for custom order
              : item
          ));
        } else {
          const newItem: OrderItem = {
            productId: customOrderProduct,
            productName: `${product.name} (Custom Order - Free)`,
            quantity: quantity,
            unitPrice: 0, // Free for custom order
            subtotal: 0
          };
          setOrderItems([...orderItems, newItem]);
        }
        
        // Reset custom order product selection
        setCustomOrderProduct("");
        setCustomOrderProductQuantity("");
      }
    }
  };

  const removeProductFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      const product = availableProducts.find(p => p.id === productId);
      const isCustomOrderProduct = orderItems.find(item => item.productId === productId)?.productName.includes('(Custom Order - Free)');
      
      // Only check quantity for regular products, not custom order products
      if (product && !isCustomOrderProduct && newQuantity > product.quantity) {
        alert(`Insufficient quantity. Available: ${product.quantity}, Requested: ${newQuantity}`);
        return;
      }
      
      setOrderItems(orderItems.map(item => 
        item.productId === productId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              subtotal: isCustomOrderProduct ? 0 : newQuantity * item.unitPrice 
            }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    // Only include products in subtotal, not packages or custom order products (which are free)
    return orderItems
      .filter(item => 
        !availablePackages.some(pkg => pkg.id === item.productId) &&
        !item.productName.includes('(Custom Order - Free)')
      )
      .reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (parseFloat(deliveryFee) || 0);
  };

  const handleSaveOrder = () => {
    const hasProducts = orderItems.some(item => 
      !availablePackages.some(pkg => pkg.id === item.productId) &&
      !item.productName.includes('(Custom Order - Free)')
    );
    
    if (!hasProducts || !customerName || !customerContact) {
      alert("Please fill in all required fields and add at least one product.");
      return;
    }

    for (const item of orderItems) {
      const product = availableProducts.find(p => p.id === item.productId);
      if (product && item.quantity > product.quantity) {
        alert(`Insufficient quantity for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName,
      customerContact,
      deliveryType: isDelivery ? 'delivery' : 'pickup',
      hostel: isDelivery ? hostel : undefined,
      paymentType,
      deliveryFee: parseFloat(deliveryFee) || 0,
      specialNotes,
      items: orderItems,
      total: calculateTotal(),
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString(),
      createdBy: getCurrentUser()
    };

    saveOrder(newOrder);
    
    orderItems.forEach(item => {
      updateProductQuantity(item.productId, item.quantity);
    });
    
    loadData();
    
    setOrderItems([]);
    setCustomerName("");
    setCustomerContact("");
    setIsDelivery(false);
    setHostel("");
    setPaymentType('cash');
    setDeliveryFee("");
    setSpecialNotes("");
    setSelectedPackages([]);
    setProductSearchValue("");
    setCustomOrderProduct("");
    setCustomOrderProductQuantity("");
    setCustomOrderPrice("");
    setCustomOrderAdditionalPrice("");
    setCustomOrderColors("");
    setCustomOrderInscription("");
    
    alert("Order saved successfully! Receipt will be printed.");
    printReceipt(newOrder);
  };

  const printReceipt = (order: Order) => {
    const receiptContent = `
      ========================================
      LAILA'S CAKES - RECEIPT
      ========================================
      Order ID: ${order.id}
      Date: ${order.orderDate}
      Time: ${order.orderTime}
      
      Customer: ${order.customerName}
      Contact: ${order.customerContact}
      ${order.deliveryType === 'delivery' ? `Hostel: ${order.hostel}` : 'Pickup'}
      
      ========================================
      PRODUCTS:
      ${order.items
        .filter(item => 
          !availablePackages.some(pkg => pkg.id === item.productId) &&
          !item.productName.includes('(Custom Order - Free)')
        )
        .map(item => 
        `${item.productName} x${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.subtotal.toFixed(2)}`
      ).join('\n')}
      
      ${order.items.some(item => item.productName.includes('(Custom Order - Free)')) ? 
        `\nCUSTOM ORDER PRODUCTS:\n${order.items
          .filter(item => item.productName.includes('(Custom Order - Free)'))
          .map(item => 
            `${item.productName.replace('(Custom Order - Free)', '')} x${item.quantity}`
          ).join('\n')}` : ''
      }
      
      ${order.items.some(item => availablePackages.some(pkg => pkg.id === item.productId)) ? 
        `\nPACKAGES:\n${order.items
          .filter(item => availablePackages.some(pkg => pkg.id === item.productId))
          .map(item => 
            `${item.productName} x${item.quantity} (Free)`
          ).join('\n')}` : ''
      }
      
      ========================================
      Subtotal: $${calculateSubtotal().toFixed(2)}

      Delivery Fee: $${order.deliveryFee.toFixed(2)}
      Total: $${order.total.toFixed(2)}
      
      Payment: ${order.paymentType.toUpperCase()}
      
      ${order.specialNotes ? `Notes: ${order.specialNotes}` : ''}
      ========================================
      Thank you for your order!
      ========================================
    `;
    
    console.log("Printing receipt:", receiptContent);
    window.print();
  };

          return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <form className="space-y-8">
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
                         <div className="w-48">
                           <Input
                             value={hostel}
                             onChange={(e) => setHostel(e.target.value)}
                             placeholder="Enter hostel name"
                           />
                         </div>
                         <div className="flex items-center space-x-2">
                           <Label htmlFor="delivery-fee" className="whitespace-nowrap">Delivery Fee</Label>
                           <Input
                             id="delivery-fee"
                             type="number"
                             min="0"
                             step="0.50"
                             value={deliveryFee}
                             onChange={(e) => setDeliveryFee(e.target.value)}
                             placeholder="Enter Delivery Fee"
                             className="w-32"
                           />
                         </div>
                       </>
                     )}
                   </div>
                </div>



                {/* Product Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add Products</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="product-select">Product</Label>
                      <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={productSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedProduct === "custom-order" 
                              ? "Custom Order" 
                              : selectedProduct 
                                ? availableProducts.find(p => p.id === selectedProduct)?.name || "Select a product"
                                : "Select a product..."
                            }
                            {selectedProduct && (
                              <CheckIcon className="ml-2 h-4 w-4 shrink-0 text-green-600" />
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search products..." 
                              value={productSearchValue}
                              onValueChange={setProductSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {productSearchValue.trim() === "" 
                                  ? "No products available" 
                                  : `No products found matching "${productSearchValue}"`
                                }
                              </CommandEmpty>
                              <CommandGroup>
                          {/* Custom Order Option */}
                                <CommandItem
                                  value="custom-order"
                                  onSelect={() => {
                                    setSelectedProduct("custom-order");
                                    setProductSearchOpen(false);
                                    setProductSearchValue("");
                                  }}
                                  className="flex items-center justify-between p-2 border-b"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-blue-600">Custom Order</span>
                              </div>
                                  <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Variable</span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Custom
                                </span>
                              </div>
                                </CommandItem>
                          
                                                                {/* Available Products */}
                                {filteredProducts.length === 0 ? (
                                  <div className="p-4 text-center text-muted-foreground">
                              <p className="text-sm">No products available</p>
                              <p className="text-xs">Products will appear here once added by admin</p>
                            </div>
                                ) : searchFilteredProducts.length === 0 ? (
                                  <div className="p-4 text-center text-muted-foreground">
                                    <p className="text-sm">No products found matching "{productSearchValue}"</p>
                                    <p className="text-xs">Try a different search term</p>
                            </div>
                          ) : (
                                  searchFilteredProducts.map(product => (
                                    <CommandItem
                                      key={product.id}
                                      value={`${product.name} ${product.category}`}
                                      onSelect={() => {
                                        setSelectedProduct(product.id);
                                        setProductSearchOpen(false);
                                        setProductSearchValue("");
                                      }}
                                      className="flex items-center justify-between p-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">({product.category})</span>
                                    </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-green-600">₵{product.unitPrice.toFixed(2)}</span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                        product.quantity > 10 
                                          ? 'bg-green-100 text-green-800' 
                                          : product.quantity > 5 
                                          ? 'bg-yellow-100 text-yellow-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {product.quantity}
                                      </span>
                                    </div>
                                    </CommandItem>
                                  ))
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="w-24">
                      <Label htmlFor="quantity">Qty</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                      />
                    </div>
                    <Button onClick={addProductToOrder} type="button">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Custom Order Fields */}
                  {selectedProduct === "custom-order" && (
                    <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-800 mb-3">Custom Order</h4>
                      <div className="space-y-4">
                        {/* Product Selection for Custom Order */}
                        <div>
                          <h5 className="font-medium text-blue-700 mb-3">Add Products to Custom Order</h5>
                          <div className="flex gap-4 items-end">
                            <div className="flex-1">
                              <Label htmlFor="custom-product-select">Product</Label>
                              <Select 
                                value={customOrderProduct || ""} 
                                onValueChange={setCustomOrderProduct}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product to add" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProducts
                                    .filter(product => 
                                      product.isAvailable && 
                                      product.isActive && 
                                      product.quantity > 0
                                    )
                                    .map(product => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="font-semibold text-green-600">₵{product.unitPrice.toFixed(2)}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24">
                              <Label htmlFor="custom-product-quantity">Qty</Label>
                              <Input
                                id="custom-product-quantity"
                                type="number"
                                value={customOrderProductQuantity}
                                onChange={(e) => setCustomOrderProductQuantity(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={addProductToCustomOrder} 
                              type="button"
                              disabled={!customOrderProduct || !customOrderProductQuantity || (parseInt(customOrderProductQuantity) || 0) <= 0}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Product
                            </Button>
                          </div>
                          
                          {/* Custom Order Products Display */}
                          {(() => {
                            const customOrderProducts = orderItems.filter(item => 
                              item.productName.includes('(Custom Order - Free)')
                            );
                            
                            return customOrderProducts.length > 0 ? (
                              <div className="mt-4 space-y-2">
                                <h6 className="text-sm font-medium text-blue-600">Added Products:</h6>
                                <div className="space-y-2">
                                  {customOrderProducts.map((item) => (
                                    <div key={item.productId} className="flex items-center justify-between p-2 bg-blue-100 rounded-lg">
                                      <div className="flex-1">
                                        <p className="font-medium text-blue-800 text-sm">
                                          {item.productName.replace('(Custom Order - Free)', '')}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-blue-600 font-medium">
                                          Qty: {item.quantity}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeProductFromOrder(item.productId)}
                                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        
                        {/* Custom Order Information */}
                        <div className="border-t pt-4">
                          <h5 className="font-medium text-blue-700 mb-3">Custom Order Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="custom-price">Price (₵)</Label>
                          <Input
                            id="custom-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={customOrderPrice}
                            onChange={(e) => setCustomOrderPrice(e.target.value)}
                            placeholder="Enter price"
                          />
                        </div>
                            <div>
                              <Label htmlFor="custom-additional-price">Additional Price (₵)</Label>
                              <Input
                                id="custom-additional-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={customOrderAdditionalPrice}
                                onChange={(e) => setCustomOrderAdditionalPrice(e.target.value)}
                                placeholder="Enter additional price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-colors">Colors</Label>
                          <Input
                            id="custom-colors"
                            value={customOrderColors}
                            onChange={(e) => setCustomOrderColors(e.target.value)}
                            placeholder="e.g., Pink, Blue, White"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-inscription">Inscription</Label>
                          <Input
                            id="custom-inscription"
                            value={customOrderInscription}
                            onChange={(e) => setCustomOrderInscription(e.target.value)}
                            placeholder="e.g., Happy Birthday Sarah"
                          />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Order Items */}
                {(() => {
                  const productItems = orderItems.filter(item => 
                    !availablePackages.some(pkg => pkg.id === item.productId) &&
                    !item.productName.includes('(Custom Order - Free)')
                  );
                  
                  return productItems.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Order Items</h3>
                      <div className="border rounded-lg divide-y">
                        {productItems.map((item) => {
                          const isCustomOrderProduct = item.productName.includes('(Custom Order - Free)');
                          return (
                            <div key={item.productId} className="flex items-center justify-between p-4">
                              <div className="flex-1">
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isCustomOrderProduct ? 'Custom Order (Free)' : `$${item.unitPrice.toFixed(2)} each`}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                                <span className="font-medium w-20 text-right">
                                  {isCustomOrderProduct ? 'Free' : `$${item.subtotal.toFixed(2)}`}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProductFromOrder(item.productId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}

                  {/* Package Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Package Selection</h3>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="package-select">Package</Label>
                        <Select value={selectedPackages[0] || ""} onValueChange={(value) => setSelectedPackages([value])}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Label htmlFor="package-quantity">Qty</Label>
                        <Input
                          id="package-quantity"
                          type="number"
                          value={packageQuantity}
                            onChange={(e) => setPackageQuantity(e.target.value)}
                        />
                      </div>
                      <Button onClick={addPackageToOrder} type="button" disabled={!selectedPackages[0]}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                  </div>
                </div>

                  {/* Added Packages Display */}
                  {orderItems.some(item => availablePackages.some(pkg => pkg.id === item.productId)) && (
                    <div className="border rounded-lg divide-y">
                      <div className="p-3 bg-gray-50 border-b">
                        <h4 className="font-medium text-gray-700">Added Packages</h4>
                      </div>
                      {orderItems
                        .filter(item => availablePackages.some(pkg => pkg.id === item.productId))
                        .map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">Package (Free)</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                              <span className="font-medium w-20 text-right">Free</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProductFromOrder(item.productId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>

                {/* Payment and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment & Delivery</h3>
                    <div className="space-y-4">
                      <div>
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Special Notes</h3>
                    <Textarea
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Enter special notes, custom cake details, boba requests, etc."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>

                    {isDelivery && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>${(parseFloat(deliveryFee) || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveOrder} type="button" className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Save Order & Print Receipt
                      </Button>
                      <Button variant="outline" onClick={() => window.print()} type="button">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
