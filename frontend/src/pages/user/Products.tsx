import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Heart } from 'lucide-react';
import { fetchProducts, fetchCategories, Product, Category, fetchUserCart, createCart, updateCart, addToWishlist, removeFromWishlist, fetchWishlist } from '@/lib/api';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedProductCard = ({ product, category, handleAddToCart, handleAddToWishlist, isWishlisted }: { product: Product, category: Category | undefined, handleAddToCart: (productId: number) => void, handleAddToWishlist: (productId: number) => void, isWishlisted: boolean }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
      transition={{ duration: 0.8 }}
    >
      <Link to={`/user/products/${product.id}`}>
        <Card className="hover-lift gradient-card overflow-hidden">
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <Button
              size="icon"
              variant="outline"
              className={`absolute top-2 right-2 rounded-full ${isWishlisted ? 'gradient-primary text-white' : 'bg-transparent border-maroon text-maroon'}`}
              onClick={(e) => { e.preventDefault(); handleAddToWishlist(product.id); }}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </Button>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {category?.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.stock} in stock
                </Badge>
              </div>
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
                className="gradient-primary"
                onClick={(e) => { e.preventDefault(); handleAddToCart(product.id); }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            {product.discount_percentage > 0 && (
              <Badge variant="destructive" className="text-xs">
                {product.discount_percentage}% OFF
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function Products() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProductsAndCategories = async () => {
      setLoading(true);
      try {
        const categoryId = id ? parseInt(id, 10) : null;
        setSelectedCategory(categoryId);

        const [productsData, categoriesData, wishlistData] = await Promise.all([
          fetchProducts({
            categoryId: categoryId !== null ? categoryId : undefined,
            search: searchQuery || undefined,
          }),
          fetchCategories(),
          fetchWishlist()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setWishlist(wishlistData);
      } catch (err) {
        setError('Failed to load products or categories.');
        toast({
          title: "Error",
          description: "Failed to load products or categories.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProductsAndCategories();
  }, [id, searchQuery]);

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

  const handleAddToWishlist = async (productId: number) => {
    try {
      const isWishlisted = wishlist.some(p => p.id === productId);
      if (isWishlisted) {
        await removeFromWishlist(productId);
        setWishlist(wishlist.filter(p => p.id !== productId));
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist.",
        });
      } else {
        const product = products.find(p => p.id === productId);
        if (product && !isWishlisted) {
          await addToWishlist(productId);
          setWishlist([...wishlist, product]);
          toast({
            title: "Added to wishlist",
            description: "Product has been added to your wishlist.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h2 className="text-3xl font-bold">All Products</h2>
        <p className="text-muted-foreground mt-1">
          Browse our complete collection of products
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <Link to="/user/products">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className={selectedCategory === null ? "gradient-primary" : ""}
          >
            All Products
          </Button>
        </Link>
        {categories.map((category) => (
          <Link to={`/user/categories/${category.id}`} key={category.id}>
            <Button
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={selectedCategory === category.id ? "gradient-primary" : ""}
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {products.length > 0 ? (
          products.map((product) => {
            const category = categories.find(c => c.id === product.category_id);
            const isWishlisted = wishlist.some(p => p.id === product.id);
            return <AnimatedProductCard key={product.id} product={product} category={category} handleAddToCart={handleAddToCart} handleAddToWishlist={handleAddToWishlist} isWishlisted={isWishlisted} />;
          })
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
