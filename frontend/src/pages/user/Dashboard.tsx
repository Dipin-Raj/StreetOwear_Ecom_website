import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { fetchCategories, fetchProducts, User, Category, Product, fetchUserCart, createCart, updateCart, fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import videoSrc from '@/data/SoW (2).mp4';
import image1Src from '@/data/18363c7262069b43e75267fdc942ccab.jpg';
import image2Src from '@/data/GettyImages-1423350509.webp';
import image3Src from '@/data/Paris Mens SS22 day 3.jpg';
import image4Src from '@/data/FBE_Bysouth_HGW_A4_1.jpg';

const AnimatedCategoryCard = ({ category }: { category: Category }) => {
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
      <Link to={`/user/categories/${category.id}`}>
        <Card className="hover-lift hover-gradient-maroon overflow-hidden cursor-pointer relative bg-white">
          <div className="aspect-square overflow-hidden">
            <img
              src={category.thumbnail}
              alt={category.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 flex items-end p-4">
            <CardTitle className="gradient-text-maroon text-lg font-bold flex items-center justify-between w-full">
              {category.name}
              <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
            </CardTitle>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

const AnimatedProductCard = ({ product, handleAddToCart, handleAddToWishlist, isWishlisted }: { product: Product, handleAddToCart: (productId: number) => void, handleAddToWishlist: (productId: number) => void, isWishlisted: boolean }) => {
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
        <Card className="hover-lift hover-gradient-primary">
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full aspect-square object-cover rounded-lg mb-4"
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
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <Button size="sm" className="gradient-primary" onClick={(e) => { e.preventDefault(); handleAddToCart(product.id); }}>
                Add to Cart
              </Button>
            </div>
            {product.discount_percentage > 0 && (
              <Badge variant="destructive" className="text-xs mt-2">
                {product.discount_percentage}% OFF
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newDrops, setNewDrops] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollTo } = useOutletContext();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollToEmbla = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect(); // Set initial index
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const videoElement = videoRef.current;

    if (selectedIndex === 0) {
      if (videoElement) {
        videoElement.play().catch(error => console.error("Video play failed:", error));
        const handleVideoEnd = () => {
          emblaApi.scrollNext();
        };
        videoElement.addEventListener('ended', handleVideoEnd);
        return () => {
          videoElement.removeEventListener('ended', handleVideoEnd);
        };
      }
    } else {
      if (videoElement) {
        videoElement.pause();
      }
      const timer = setTimeout(() => {
        emblaApi.scrollNext();
      }, 10000); // 10 seconds for images
      return () => clearTimeout(timer);
    }
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const [categoriesData, productsData, newDropsData, wishlistData] = await Promise.all([
          fetchCategories(),
          fetchProducts({ limit: 3 }), // Fetch 3 featured products
          fetchProducts({ limit: 3, sortBy: 'created_at', sortDir: 'desc' }),
          fetchWishlist()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
        setNewDrops(newDropsData);
        setWishlist(wishlistData);
      } catch (err) {
        setError('Failed to load dashboard data.');
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (scrollTo === 'new-drops') {
      const newDropsSection = document.getElementById('new-drops');
      if (newDropsSection) {
        newDropsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollTo]);

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
        await addToWishlist(productId);
        const product = products.find(p => p.id === productId) || newDrops.find(p => p.id === productId);
        if (product) {
          setWishlist([...wishlist, product]);
        }
        toast({
          title: "Added to wishlist",
          description: "Product has been added to your wishlist.",
        });
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
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const bannerItems = [
    { type: 'video', src: videoSrc, position: 'center' },
    { type: 'image', src: image1Src, position: 'center' },
    { type: 'image', src: image2Src, position: 'center' },
    { type: 'image', src: image3Src, position: 'center' },
    { type: 'image', src: image4Src, position: 'center' },
  ];

  return (
    <div>
      <div className="bg-white p-8 px-6 py-6 flex flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-maroon">Welcome {user?.full_name || user?.username || 'Guest'}</h1>
          <p className="text-gray-600 mb-6">
            Discover amazing products and enjoy seamless shopping experience
          </p>
        </div>
        <Button asChild size="lg" className="gradient-maroon text-white">
          <Link to="/user/products">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
        </Button>
      </div>

      {/* Banner Section */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 6' }}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {bannerItems.map((item, index) => (
              <div className="flex-shrink-0 w-full h-full" key={index}>
                {item.type === 'video' ? (
                  <video
                    key={item.src} // Add key to force re-render
                    ref={videoRef}
                    src={item.src}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ objectPosition: item.position }}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: item.position }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={scrollPrev}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={scrollNext}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToEmbla(index)}
              className={`h-2 w-2 rounded-full ${selectedIndex === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Categories</h2>
          <Button asChild variant="ghost">
            <Link to="/user/categories">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <AnimatedCategoryCard key={category.id} category={category} />
            ))
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button asChild variant="ghost">
            <Link to="/user/products">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => {
              const isWishlisted = wishlist.some(p => p.id === product.id);
              return <AnimatedProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} handleAddToWishlist={handleAddToWishlist} isWishlisted={isWishlisted} />;
            })
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      <div id="new-drops" className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">New Drops</h2>
          <Button asChild variant="ghost">
            <Link to="/user/products">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
                    {newDrops.length > 0 ? (
                      newDrops.map((product) => {
                        const isWishlisted = wishlist.some(p => p.id === product.id);
                        return <AnimatedProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} handleAddToWishlist={handleAddToWishlist} isWishlisted={isWishlisted} />;
                      })
                    ) : (
                      <p>No new drops found.</p>
                    )}        </div>
      </div>
    </div>
  );
}
