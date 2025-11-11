import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  thumbnail: string;
  category_id: string;
  rating: number;
  average_rating: number;
  review_count: number;
  discount_percentage: number;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [productToRestock, setProductToRestock] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(1);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `Product ${productToDelete.title} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleRestockClick = (product: Product) => {
    setProductToRestock(product);
    setRestockQuantity(1);
    setIsRestockDialogOpen(true);
  };

  const handleRestockConfirm = async () => {
    if (!productToRestock || restockQuantity <= 0) return;

    try {
      const updatedStock = productToRestock.stock + restockQuantity;
      await api.put(`/products/${productToRestock.id}`, { stock: updatedStock });
      
      setProducts(products.map(p => 
        p.id === productToRestock.id ? { ...p, stock: updatedStock } : p
      ));

      toast({
        title: "Product Restocked",
        description: `${restockQuantity} units added to ${productToRestock.title}. New stock: ${updatedStock}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock product.",
        variant: "destructive",
      });
    } finally {
      setIsRestockDialogOpen(false);
      setProductToRestock(null);
      setRestockQuantity(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Products</h2>
          <p className="text-muted-foreground mt-1">
            View, edit, and add products
          </p>
        </div>
        <Link to="/admin/products/add">
          <Button className="gradient-primary hover-gradient-primary">
            <FolderPlus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleDeleteClick={handleDeleteClick}
              handleRestockClick={handleRestockClick}
              showAdminControls={true}
            />
          ))}
        </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="hover-gradient-primary">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restock Product</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the quantity to add to "{productToRestock?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4">
            <Input
              type="number"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestockConfirm} className="hover-gradient-primary">Restock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}