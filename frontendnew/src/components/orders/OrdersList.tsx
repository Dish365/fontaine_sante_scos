'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  capacity_status?: {
    current_utilization_percent: number;
    available_capacity_m3: number;
    is_over_threshold: boolean;
    is_critical: boolean;
    is_full: boolean;
  };
  items: OrderItem[];
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
}

interface OrdersListProps {
  onCreateOrder: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export default function OrdersList({ onCreateOrder, onViewOrder, onEditOrder }: OrdersListProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [capacityAlerts, setCapacityAlerts] = useState<any[]>([]);

  // Status configurations
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
    if (!authLoading && isAuthenticated) {
      loadOrders();
      loadCapacityAlerts();
    }
  }, [authLoading, isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Set mock data for development
      setOrders([
        {
          order_id: 'mock-001',
          supplier_name: 'Mock Supplier 1',
          warehouse_name: 'Mock Warehouse 1',
          status: 'pending',
          transport_mode: 'truck',
          order_date: new Date().toISOString(),
          expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 1500.00,
          total_volume_m3: 25.5,
          items: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCapacityAlerts = async () => {
    try {
      const data = await apiClient.getCapacityAlerts();
      setCapacityAlerts(data);
    } catch (error) {
      console.error('Failed to load capacity alerts:', error);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      await apiClient.markOrderDelivered(orderId);
      loadOrders(); // Reload to show updated status
      loadCapacityAlerts(); // Reload alerts as capacity may have changed
    } catch (error) {
      console.error('Failed to mark order as delivered:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'all' || order.warehouse_name === warehouseFilter;
    
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const getCapacityBadge = (capacityStatus: any) => {
    if (!capacityStatus) return null;

    if (capacityStatus.is_full) {
      return <Badge variant="destructive">Full Capacity</Badge>;
    } else if (capacityStatus.is_critical) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (capacityStatus.is_over_threshold) {
      return <Badge variant="secondary">Over Threshold</Badge>;
    } else {
      return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getUniqueWarehouses = () => {
    const warehouses = [...new Set(orders.map(order => order.warehouse_name))];
    return warehouses.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Capacity Alerts */}
      {capacityAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{capacityAlerts.length} capacity alert(s) active:</strong>
            <ul className="mt-2 space-y-1">
              {capacityAlerts.slice(0, 3).map((alert, index) => (
                <li key={index} className="text-sm">
                  • {alert.warehouse_name}: {alert.message}
                </li>
              ))}
              {capacityAlerts.length > 3 && (
                <li className="text-sm">• And {capacityAlerts.length - 3} more...</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">
            Track orders with real-time warehouse capacity monitoring
          </p>
        </div>
        <Button onClick={onCreateOrder}>
          <Package className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse</label>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {getUniqueWarehouses().map(warehouse => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            All orders with warehouse capacity status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
                const TransportIcon = transportIcons[order.transport_mode as keyof typeof transportIcons] || Truck;
                
                return (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-mono text-sm">
                      {order.order_id.slice(0, 8)}...
                    </TableCell>
                    
                    <TableCell>{order.supplier_name}</TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        {order.warehouse_name}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={statusConfig[order.status as keyof typeof statusConfig]?.color as any || 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TransportIcon className="h-4 w-4" />
                        <span className="capitalize">{order.transport_mode}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.expected_delivery_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {order.total_volume_m3 ? (
                        <span className="text-sm">
                          {order.total_volume_m3.toFixed(2)}m³
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {order.total_amount.toFixed(2)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getCapacityBadge(order.capacity_status)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditOrder(order)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Order
                          </DropdownMenuItem>
                          {order.status === 'shipped' && (
                            <DropdownMenuItem onClick={() => markAsDelivered(order.order_id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
