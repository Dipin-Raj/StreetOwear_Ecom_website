import { useEffect, useState } from 'react';
import { Product, fetchWishlist, removeFromWishlist } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWishlist = async () => {
      setLoading(true);
      try {
        const wishlistData = await fetchWishlist();
        setWishlist(wishlistData);
      } catch (err) {
        setError('Failed to load wishlist.');
        toast({
          title: "Error",
          description: "Failed to load your wishlist.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      setWishlist(wishlist.filter(product => product.id !== productId));
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove product from wishlist.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your wishlist...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h2 className="text-3xl font-bold">My Wishlist</h2>
        <p className="text-muted-foreground mt-1">
          Products you've saved for later.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {wishlist.length > 0 ? (
          wishlist.map((product) => (
            <Card key={product.id} className="hover-lift gradient-card overflow-hidden">
              <Link to={`/user/products/${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/${product.thumbnail.startsWith('/') ? product.thumbnail.substring(1) : product.thumbnail}`}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
}
