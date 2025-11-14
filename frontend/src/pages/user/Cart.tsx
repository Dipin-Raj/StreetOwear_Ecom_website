import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { fetchUserCart, updateCart, createCart, Cart, CartItem } from '@/lib/api';

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getCart = async () => {
    setLoading(true);
    try {
      const userCart = await fetchUserCart();
      setCart(userCart);
    } catch (err) {
      setError('Failed to load cart.');
      toast({
        title: "Error",
        description: "Failed to load cart.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateCartItems = async (updatedItems: { product_id: number; quantity: number }[]) => {
    if (!cart) return;
    try {
      const updatedCart = await updateCart(cart.id, updatedItems);
      if (updatedCart) {
        setCart(updatedCart);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: number, delta: number) => {
    if (!cart) return;

    const existingItem = cart.cart_items.find(item => item.product.id === productId);
    if (!existingItem) return;

    const newQuantity = Math.max(1, existingItem.quantity + delta);
    const updatedItems = cart.cart_items.map(item =>
      item.product.id === productId
        ? { product_id: item.product.id, quantity: newQuantity }
        : { product_id: item.product.id, quantity: item.quantity }
    );
    await updateCartItems(updatedItems);
  };

  const removeItem = async (productId: number) => {
    if (!cart) return;

    const updatedItems = cart.cart_items
      .filter(item => item.product.id !== productId)
      .map(item => ({ product_id: item.product.id, quantity: item.quantity }));

    await updateCartItems(updatedItems);
    toast({
      title: "Item removed",
      description: "Product has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    if (!cart || cart.cart_items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    navigate('/user/checkout');
  };

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started</p>
        </div>
      </div>
    );
  }

  const subtotal = cart.cart_items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Shopping Cart</h2>
          <p className="text-muted-foreground mt-1">
            Review and manage your cart items
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cart.cart_items.map((item) => (
              <Card key={item.product.id} className="gradient-card">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${item.product.thumbnail.startsWith('/') ? item.product.thumbnail.substring(1) : item.product.thumbnail}`}
                      alt={item.product.title}
                      className="h-24 w-24 rounded object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">
                          ${(item.product.price * (1 - item.product.discount_percentage / 100)).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            className="h-8 w-16 text-center"
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <span className="text-lg font-bold">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="gradient-card sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full gradient-primary" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
