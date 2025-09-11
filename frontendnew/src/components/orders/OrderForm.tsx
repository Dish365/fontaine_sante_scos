'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Truck, Warehouse, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  material: string;
  material_name?: string;
  quantity: number;
  unit_price: number;
  volume_per_unit_m3?: number;
  weight_per_unit_kg?: number;
  notes?: string;
}

interface OrderFormData {
  supplier: string;
  destination_warehouse: string;
  expected_delivery_date: string;
  transport_mode: string;
  notes: string;
  items: OrderItem[];
}

interface Supplier {
  id: string;
  name: string;
  city: string;
  transportation_mode: string;
}

interface Warehouse {
  id: string;
  name: string;
  storage_capacity?: number;
  current_utilization?: number;
  available_capacity_m3?: number;
  max_capacity_threshold?: number;
}

interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface OrderFormProps {
  onSubmit: (orderData: OrderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function OrderForm({ onSubmit, onCancel, loading = false }: OrderFormProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<OrderFormData>({
    supplier: '',
    destination_warehouse: '',
    expected_delivery_date: '',
    transport_mode: 'truck',
    notes: '',
    items: [{ material: '', quantity: 1, unit_price: 0 }]
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);
  const [totalVolume, setTotalVolume] = useState<number>(0);

  // Transport mode options
  const transportModes = [
    { value: 'truck', label: 'Truck', icon: Truck },
    { value: 'train', label: 'Train', icon: Package },
    { value: 'ship', label: 'Ship', icon: Package },
    { value: 'plane', label: 'Plane', icon: Package },
    { value: 'mixed', label: 'Mixed Transport', icon: Package }
  ];

  // Load data on component mount when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadSuppliers();
      loadWarehouses();
      loadMaterials();
    }
  }, [authLoading, isAuthenticated]);

  // Calculate total volume when items change
  useEffect(() => {
    const volume = formData.items.reduce((total, item) => {
      const itemVolume = (item.volume_per_unit_m3 || 0) * item.quantity;
      return total + itemVolume;
    }, 0);
    setTotalVolume(volume);
  }, [formData.items]);

  // Check capacity when warehouse or volume changes
  useEffect(() => {
    if (selectedWarehouse && totalVolume > 0) {
      checkCapacity();
    } else {
      setCapacityWarning(null);
    }
  }, [selectedWarehouse, totalVolume]);

  const loadSuppliers = async () => {
    try {
      const data = await apiClient.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      // For development, create some mock data if API fails
      setSuppliers([
        { id: '1', name: 'Mock Supplier 1', city: 'Montreal', transportation_mode: 'truck' },
        { id: '2', name: 'Mock Supplier 2', city: 'Toronto', transportation_mode: 'train' },
      ]);
    }
  };

  const loadWarehouses = async () => {
    try {
      const data = await apiClient.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      // For development, create some mock data if API fails
      setWarehouses([
        { 
          id: '1', 
          name: 'Mock Warehouse 1', 
          storage_capacity: 1000, 
          current_utilization: 65,
          available_capacity_m3: 350,
          max_capacity_threshold: 80
        },
        { 
          id: '2', 
          name: 'Mock Warehouse 2', 
          storage_capacity: 1500, 
          current_utilization: 45,
          available_capacity_m3: 825,
          max_capacity_threshold: 85
        },
      ]);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await apiClient.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
      // For development, create some mock data if API fails
      setMaterials([
        { id: '1', name: 'Mock Material 1', unit: 'kg', category: 'raw' },
        { id: '2', name: 'Mock Material 2', unit: 'liters', category: 'liquid' },
        { id: '3', name: 'Mock Material 3', unit: 'pieces', category: 'components' },
      ]);
    }
  };

  const checkCapacity = () => {
    if (!selectedWarehouse) return;

    const availableCapacity = Number(selectedWarehouse.available_capacity_m3) || 0;
    const currentUtilization = Number(selectedWarehouse.current_utilization) || 0;
    const storageCapacity = Number(selectedWarehouse.storage_capacity) || 1; // Prevent division by zero
    const maxThreshold = Number(selectedWarehouse.max_capacity_threshold) || 80;
    
    const utilizationAfterDelivery = currentUtilization + 
      (totalVolume / storageCapacity) * 100;

    if (totalVolume > availableCapacity) {
      setCapacityWarning(
        `Warning: Order volume (${totalVolume.toFixed(2)}m³) exceeds available warehouse capacity (${availableCapacity.toFixed(2)}m³)`
      );
    } else if (utilizationAfterDelivery > maxThreshold) {
      setCapacityWarning(
        `Warning: This order will bring warehouse utilization to ${utilizationAfterDelivery.toFixed(1)}%, exceeding the ${maxThreshold}% threshold`
      );
    } else {
      setCapacityWarning(null);
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setSelectedWarehouse(warehouse || null);
    setFormData(prev => ({ ...prev, destination_warehouse: warehouseId }));
  };

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { material: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Order
          </CardTitle>
          <CardDescription>
            Create a new order with automatic warehouse capacity validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Supplier Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={formData.supplier} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, supplier: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Destination Warehouse</Label>
              <Select value={formData.destination_warehouse} onValueChange={handleWarehouseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{warehouse.name}</span>
                        <Badge variant={(Number(warehouse.current_utilization) || 0) > (Number(warehouse.max_capacity_threshold) || 80) ? "destructive" : "secondary"}>
                          {(Number(warehouse.current_utilization) || 0).toFixed(1)}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warehouse Capacity Status */}
          {selectedWarehouse && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Warehouse className="h-4 w-4" />
                  <span className="font-medium">Warehouse Capacity Status</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Utilization:</span>
                    <div className="font-medium">{(Number(selectedWarehouse.current_utilization) || 0).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available Capacity:</span>
                    <div className="font-medium">{(Number(selectedWarehouse.available_capacity_m3) || 0).toFixed(2)}m³</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Capacity:</span>
                    <div className="font-medium">{(Number(selectedWarehouse.storage_capacity) || 0).toFixed(2)}m³</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Capacity Warning */}
          {capacityWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{capacityWarning}</AlertDescription>
            </Alert>
          )}

          {/* Transport and Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transport_mode">Transport Mode</Label>
              <Select value={formData.transport_mode} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, transport_mode: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transportModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex items-center gap-2">
                        <mode.icon className="h-4 w-4" />
                        {mode.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
              <Input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <Card key={index} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <Label>Material</Label>
                      <Select 
                        value={item.material} 
                        onValueChange={(value) => updateOrderItem(index, 'material', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map(material => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} ({material.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Volume/Unit (m³)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={item.volume_per_unit_m3 || ''}
                        onChange={(e) => updateOrderItem(index, 'volume_per_unit_m3', parseFloat(e.target.value) || 0)}
                        placeholder="0.0000"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Weight/Unit (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.weight_per_unit_kg || ''}
                        onChange={(e) => updateOrderItem(index, 'weight_per_unit_kg', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-1">
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Item notes..."
                      value={item.notes || ''}
                      onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Items:</span>
                  <div className="font-medium">{formData.items.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Volume:</span>
                  <div className="font-medium">{totalVolume.toFixed(4)}m³</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <div className="font-medium">${getTotalAmount().toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              placeholder="Additional notes for this order..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
