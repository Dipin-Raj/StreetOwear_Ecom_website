import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { fetchCategories, Category } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedCard = ({ category }: { category: Category }) => {
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
        <Card className="hover-lift gradient-card overflow-hidden cursor-pointer group relative">
          <div className="aspect-square overflow-hidden">
            <img
              src={category.thumbnail}
              alt={category.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 flex items-end p-4">
            <CardTitle className="text-white text-lg font-bold flex items-center justify-between w-full">
              {category.name}
              <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
            </CardTitle>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories.');
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h2 className="text-3xl font-bold">Browse Categories</h2>
        <p className="text-muted-foreground mt-1">
          Explore our wide range of product categories
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {categories.length > 0 ? (
          categories.map((category) => (
            <AnimatedCard key={category.id} category={category} />
          ))
        ) : (
          <p>No categories found.</p>
        )}
      </div>
    </div>
  );
}
