import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { fetchProducts, Product, fetchUserCart, createCart, updateCart, fetchReviewsForProduct, ReviewOut, createReview } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { AxiosError } from 'axios';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");

  const getProductAndReviews = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts({ productId: Number(id) });
      if (productsData.length > 0) {
        const fetchedProduct = productsData[0];
        setProduct(fetchedProduct);
        setSelectedImage(`${import.meta.env.VITE_API_BASE_URL}/${fetchedProduct.thumbnail}`);

        const fetchedReviews = await fetchReviewsForProduct(fetchedProduct.id);
        setReviews(fetchedReviews);
      }
    } catch (err) {
      setError('Failed to load product details or reviews.');
      toast({
        title: "Error",
        description: "Failed to load product details or reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductAndReviews();
  }, [id]);

  const handleAddToCart = async (productId: number) => {
    try {
      const cart = await fetchUserCart();
      if (cart) {
        const existingItem = cart.cart_items.find(item => item.product_id === productId);
        const newCartItems = existingItem
          ? cart.cart_items.map(item =>
              item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
          : [...cart.cart_items, { product_id: productId, quantity: 1 }];
        await updateCart(cart.id, newCartItems);
      } else {
        await createCart([{ product_id: productId, quantity: 1 }]);
      }
      toast({
        title: "Added to cart",
        description: `Product has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || newReviewRating === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a rating.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newReview = await createReview({
        product_id: product.id,
        rating: newReviewRating,
        comment: newReviewComment,
      });
      if (newReview) {
        getProductAndReviews(); // Refetch reviews
        setNewReviewRating(0);
        setNewReviewComment("");
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast({
          title: "Already reviewed",
          description: "You have already submitted a review for this product.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit review.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-8 text-red-500">Error: {error || "Product not found"}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                {[product.thumbnail, ...product.images].map((image, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.VITE_API_BASE_URL}/${image}`}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className={`w-20 h-20 rounded-lg cursor-pointer object-cover ${selectedImage === image ? 'border-2 border-primary' : ''}`}
                    onClick={() => setSelectedImage(`${import.meta.env.VITE_API_BASE_URL}/${image}`)}
                  />
                ))}
              </div>
              <div className="flex-1">
                <img src={selectedImage || `${import.meta.env.VITE_API_BASE_URL}/${product.thumbnail}`} alt={product.title} className="w-full rounded-lg" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary">{product.brand}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
                </div>
              </div>
              <div className="mt-4">
                {product.stock > 0 ? (
                  product.stock < 5 ? (
                    <span className="text-red-500 font-semibold">
                      Limited stock left!
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      In Stock
                    </span>
                  )
                ) : (
                  <span className="text-gray-500 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-4xl font-bold text-primary">
                  ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              {product.discount_percentage > 0 && (
                <Badge variant="destructive" className="text-xs mt-2">
                  {product.discount_percentage}% OFF
                </Badge>
              )}
              <Button size="lg" className="w-full mt-6 gradient-primary" onClick={() => handleAddToCart(product.id)}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Customer Reviews ({product.review_count})</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex gap-1 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        )}
      </div>

      {/* Add Review Form */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Write a Review</h3>
        <form onSubmit={handleReviewSubmit}>
          <div className="flex items-center mb-4">
            <span className="mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-6 w-6 cursor-pointer",
                  star <= newReviewRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
                onClick={() => setNewReviewRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Share your thoughts about the product..."
            value={newReviewComment}
            onChange={(e) => setNewReviewComment(e.target.value)}
            className="mb-4"
          />
          <Button type="submit">Submit Review</Button>
        </form>
      </div>
    </div>
  );
}
