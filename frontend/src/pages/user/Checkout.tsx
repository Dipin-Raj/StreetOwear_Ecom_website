import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { checkoutCart } from '@/lib/api';

export default function Checkout() {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!address) {
      toast({
        title: "Address is required",
        description: "Please enter your shipping address.",
        variant: "destructive",
      });
      return;
    }

    try {
      await checkoutCart({ address, payment_method: paymentMethod });
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed",
      });
      navigate('/user/orders');
    } catch (err: any) {
      toast({
        title: "Error placing order",
        description: err.message || "Failed to place order.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Checkout</h2>
          <p className="text-muted-foreground mt-1">
            Enter your shipping and payment details to complete your order
          </p>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your shipping address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit or Debit Card</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Button
          className="w-full gradient-primary" 
          size="lg"
          onClick={handleCheckout}
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
