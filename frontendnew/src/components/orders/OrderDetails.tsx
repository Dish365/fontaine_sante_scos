'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Warehouse, 
  Truck, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Ship,
  MapPin,
  Weight,
  Ruler,
  Leaf,
  ArrowLeft,
  Edit,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
  onEdit: () => void;
}

interface Order {
  order_id: string;
  supplier_name: string;
  warehouse_name: string;
  status: string;
  transport_mode: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  total_amount: number;
  total_volume_m3?: number;
  total_weight_kg?: number;
  estimated_distance_km?: number;
  estimated_transport_cost?: number;
  estimated_co2_emissions?: number;
  notes?: string;
  capacity_status?: {
    current_utilization_percent: number;
    available_capacity_m3: number;
    storage_capacity_m3: number;
    threshold_percent: number;
    is_over_threshold: boolean;
    is_critical: boolean;
    is_full: boolean;
    status_level: string;
  };
  items: OrderItem[];
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  material_name: string;
  material_unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  total_volume_m3?: number;
  total_weight_kg?: number;
  notes?: string;
}

export default function OrderDetails({ orderId, onBack, onEdit }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [warehouseAlerts, setWarehouseAlerts] = useState<any[]>([]);

  const statusConfig = {
    pending: { color: 'secondary', icon: Clock, label: 'Pending' },
    confirmed: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
    in_progress: { color: 'yellow', icon: Package, label: 'In Progress' },
    shipped: { color: 'purple', icon: Truck, label: 'Shipped' },
    delivered: { color: 'green', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'destructive', icon: AlertTriangle, label: 'Cancelled' }
  };

  const transportIcons = {
    truck: Truck,
    train: Package,
    ship: Ship,
    plane: Package,
    mixed: Package
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/suppliers/orders/${orderId}/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const orderData = await response.json();
      setOrder(orderData);

      // Load warehouse alerts if order has a warehouse
      if (orderData.destination_warehouse) {
        loadWarehouseAlerts(orderData.destination_warehouse);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseAlerts = async (warehouseId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/suppliers/capacity-alerts/by_warehouse/?warehouse_id=${warehouseId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      setWarehouseAlerts(data.results || data);
    } catch (error) {
      console.error('Failed to load warehouse alerts:', error);
    }
  };

  const markAsDelivered = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/suppliers/orders/${order.order_id}/mark_delivered/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        loadOrder(); // Reload to show updated status
      }
    } catch (error) {
      console.error('Failed to mark order as delivered:', error);
    }
  };

  const getCapacityColor = (utilization: number, threshold: number) => {
    if (utilization >= 100) return 'bg-red-500';
    if (utilization >= threshold + 5) return 'bg-red-400';
    if (utilization >= threshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">Order not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
  const TransportIcon = transportIcons[order.transport_mode as keyof typeof transportIcons] || Truck;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.order_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
          {order.status === 'shipped' && (
            <Button onClick={markAsDelivered}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
        </div>
      </div>

      {/* Capacity Alerts */}
      {warehouseAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warehouse Capacity Alerts:</strong>
            <ul className="mt-2 space-y-1">
              {warehouseAlerts.map((alert, index) => (
                <li key={index} className="text-sm">
                  • {alert.alert_type_display}: {alert.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={statusConfig[order.status as keyof typeof statusConfig]?.color as any || 'secondary'}
                      className="flex items-center gap-1 w-fit"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transport Mode</label>
                  <div className="mt-1 flex items-center gap-2">
                    <TransportIcon className="h-4 w-4" />
                    <span className="capitalize">{order.transport_mode}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.order_date).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.expected_delivery_date).toLocaleDateString()}
                  </div>
                </div>

                {order.actual_delivery_date && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Actual Delivery</label>
                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {new Date(order.actual_delivery_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <div className="mt-1 font-medium">{order.supplier_name}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Destination Warehouse</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    {order.warehouse_name}
                  </div>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <div className="mt-1 text-sm bg-muted p-3 rounded-md">
                      {order.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Transportation & Environmental */}
          {(order.estimated_distance_km || order.estimated_transport_cost || order.estimated_co2_emissions) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Transportation & Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {order.estimated_distance_km && (
                    <div className="text-center">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">{order.estimated_distance_km.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">km distance</div>
                    </div>
                  )}

                  {order.estimated_transport_cost && (
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">${order.estimated_transport_cost.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">transport cost</div>
                    </div>
                  )}

                  {order.estimated_co2_emissions && (
                    <div className="text-center">
                      <Leaf className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">{order.estimated_co2_emissions.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">kg CO2e</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.material_name}</div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.material_unit}
                      </TableCell>
                      <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.total_volume_m3 ? (
                          <span>{item.total_volume_m3.toFixed(4)}m³</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.total_weight_kg ? (
                          <span>{item.total_weight_kg.toFixed(2)}kg</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${item.total_price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold text-lg">${order.total_amount.toFixed(2)}</span>
              </div>

              {order.total_volume_m3 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Volume:</span>
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{order.total_volume_m3.toFixed(4)}m³</span>
                  </div>
                </div>
              )}

              {order.total_weight_kg && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <div className="flex items-center gap-1">
                    <Weight className="h-4 w-4" />
                    <span>{order.total_weight_kg.toFixed(2)}kg</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Count:</span>
                <span>{order.items.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Capacity Status */}
          {order.capacity_status && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Warehouse Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Utilization</span>
                    <span>{(Number(order.capacity_status.current_utilization_percent) || 0).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Number(order.capacity_status.current_utilization_percent) || 0} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Available:</span>
                    <div className="font-medium">{order.capacity_status.available_capacity_m3.toFixed(2)}m³</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">{order.capacity_status.storage_capacity_m3.toFixed(2)}m³</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.capacity_status.is_full && (
                    <Badge variant="destructive">Full</Badge>
                  )}
                  {order.capacity_status.is_critical && (
                    <Badge variant="destructive">Critical</Badge>
                  )}
                  {order.capacity_status.is_over_threshold && (
                    <Badge variant="secondary">Over Threshold</Badge>
                  )}
                  {!order.capacity_status.is_full && !order.capacity_status.is_critical && !order.capacity_status.is_over_threshold && (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.created_by_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created by:</span>
                  <span>{order.created_by_name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(order.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
