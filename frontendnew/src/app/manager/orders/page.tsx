'use client';

import { useState } from 'react';
import OrdersList from '@/components/orders/OrdersList';
import OrderForm from '@/components/orders/OrderForm';
import OrderDetails from '@/components/orders/OrderDetails';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

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
  capacity_status?: any;
  items: any[];
}

interface OrderFormData {
  supplier: string;
  destination_warehouse: string;
  expected_delivery_date: string;
  transport_mode: string;
  notes: string;
  items: any[];
}

type ViewMode = 'list' | 'create' | 'details' | 'edit';

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setViewMode('create');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('details');
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setViewMode('list');
  };

  const handleSubmitOrder = async (orderData: OrderFormData) => {
    try {
      setLoading(true);

      const newOrder = await apiClient.createOrder(orderData);

      toast({
        title: 'Order Created Successfully',
        description: `Order ${newOrder.order_id} has been created and capacity has been validated.`,
      });

      // Check if there were capacity warnings in the response
      if (newOrder.notes && newOrder.notes.includes('Capacity Warning')) {
        toast({
          title: 'Capacity Warning',
          description: 'This order may exceed warehouse capacity. Please review the order details.',
          variant: 'destructive',
        });
      }

      setViewMode('list');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: 'Error Creating Order',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderData: OrderFormData) => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      const updatedOrder = await apiClient.updateOrder(selectedOrder.order_id, orderData);

      toast({
        title: 'Order Updated Successfully',
        description: `Order ${updatedOrder.order_id} has been updated.`,
      });

      setViewMode('list');
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error Updating Order',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {viewMode === 'list' && (
        <OrdersList
          onCreateOrder={handleCreateOrder}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
        />
      )}

      {viewMode === 'create' && (
        <OrderForm
          onSubmit={handleSubmitOrder}
          onCancel={handleBackToList}
          loading={loading}
        />
      )}

      {viewMode === 'details' && selectedOrder && (
        <OrderDetails
          orderId={selectedOrder.order_id}
          onBack={handleBackToList}
          onEdit={() => handleEditOrder(selectedOrder)}
        />
      )}

      {viewMode === 'edit' && selectedOrder && (
        <OrderForm
          onSubmit={handleUpdateOrder}
          onCancel={handleBackToList}
          loading={loading}
        />
      )}
    </div>
  );
}
