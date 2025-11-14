import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Trash2, Star } from 'lucide-react';
import { fetchUserOrders, Order, deleteOrder, createReview } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { cn } from "@/lib/utils";


export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [productToReview, setProductToReview] = useState<{ id: number; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

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

  useEffect(() => {
    const getUserOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchUserOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders.');
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getUserOrders();
  }, []);

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete === null) return;

    try {
      await deleteOrder(orderToDelete);
      setOrders(orders.filter(order => order.id !== orderToDelete));
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the order.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleReviewClick = (productId: number, productTitle: string) => {
    setProductToReview({ id: productId, title: productTitle });
    setReviewRating(0);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!productToReview || reviewRating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview({
        product_id: productToReview.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      toast({
        title: "Review Submitted",
        description: `Thank you for reviewing ${productToReview.title}!`, 
      });
      // Optionally, refresh orders or mark item as reviewed
      setIsReviewDialogOpen(false);
      setProductToReview(null);
      setReviewRating(0);
      setReviewComment('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="text-muted-foreground">Your order history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">My Orders</h2>
          <p className="text-muted-foreground mt-1">
            Track and view your order history
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <AlertDialog open={isDeleteDialogOpen && orderToDelete === order.id} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(order.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your order.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/${item.product.thumbnail.startsWith('/') ? item.product.thumbnail.substring(1) : item.product.thumbnail}`}
                        alt={item.product.title}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        {order.status === 'delivered' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2" 
                            onClick={() => handleReviewClick(item.product.id, item.product.title)}
                          >
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Dialog */}
      <AlertDialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review {productToReview?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Share your experience with this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Rating:</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "cursor-pointer",
                      star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Comment:</h4>
              <Textarea
                placeholder="Write your comment here..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReviewSubmit}>Submit Review</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
