import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAllOrders, Order, updateOrderStatus } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function OrderDetails() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    const updatedOrder = await updateOrderStatus(orderId, status);
    if (updatedOrder) {
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast({
        title: "Status Updated",
        description: `Order #${orderId} status has been updated to ${status}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Order Details</h2>
        <p className="text-muted-foreground mt-1">
          View and manage customer orders
        </p>
      </div>

      <Card className="gradient-card card-container">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.order_items.length} items</TableCell>
                    <TableCell className="font-medium">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className={`gradient-primary text-white ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="gradient-primary">
                          <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'pending')}>Pending</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'processing')}>Processing</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'shipped')}>Shipped</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'delivered')}>Delivered</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'cancelled')}>Cancelled</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="gradient-primary button-on-card" onClick={() => handleViewOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order #{selectedOrder?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Here are the items in this order:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOrder?.order_items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.title}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
