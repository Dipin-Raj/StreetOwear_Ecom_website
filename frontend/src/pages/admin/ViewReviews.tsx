import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Star } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Toaster, toast as hotToast } from 'react-hot-toast';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    average_rating: number;
    review_count: number;
    stock: number;
    discount_percentage: number;
    brand: string;
    category_id: string;
    rating: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  user_id: number;
  created_at: string;
  product: {
      id: number;
      title: string;
  };
}

const ViewReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateValues, setUpdateValues] = useState<{ [productId: number]: { stock?: string; discount_percentage?: string } }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsResponse = await api.get<Review[]>('/reviews/');
        setReviews(reviewsResponse.data);

        const productsResponse = await api.get<{message: string, data: Product[]}>('/products?limit=0');
        const products = productsResponse.data.data;

        const sortedProducts = [...products]
          .filter(p => p.review_count > 0)
          .sort((a, b) => b.average_rating - a.average_rating)
          .slice(0, 5);
        setTopProducts(sortedProducts);

      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: 'Could not fetch data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateValueChange = (productId: number, field: 'stock' | 'discount_percentage', value: string) => {
    setUpdateValues(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleUpdateProduct = async (productId: number, field: 'stock' | 'discount_percentage') => {
    const value = updateValues[productId]?.[field];
    if (value === undefined || value === '') {
      hotToast.error(`Please enter a value for ${field.replace('_', ' ')}.`);
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      hotToast.error('Please enter a valid number.');
      return;
    }

    try {
      await api.put(`/products/${productId}`, { [field]: numericValue });
      hotToast.success(`Product ${field.replace('_', ' ')} updated successfully!`);

      setTopProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, [field]: numericValue } : p
        )
      );
      
      setUpdateValues(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: '',
        },
      }));

    } catch (error) {
      hotToast.error('Failed to update product.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">All Reviews</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap">{review.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{review.product?.title || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{review.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gray-300 fill-current" />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">{review.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(review.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Top Rated Products</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              updateValues={updateValues}
              handleUpdateValueChange={handleUpdateValueChange}
              handleUpdateProduct={handleUpdateProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewReviews;
