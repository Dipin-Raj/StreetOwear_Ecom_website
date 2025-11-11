import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Star, PackagePlus, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from './ui/input';

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

interface ProductCardProps {
  product: Product;
  handleDeleteClick?: (product: Product) => void;
  handleRestockClick?: (product: Product) => void;
  handleUpdateValueChange?: (productId: number, field: 'stock' | 'discount_percentage', value: string) => void;
  handleUpdateProduct?: (productId: number, field: 'stock' | 'discount_percentage') => void;
  updateValues?: { [productId: number]: { stock?: string; discount_percentage?: string } };
  showAdminControls?: boolean;
}

export function ProductCard({
  product,
  handleDeleteClick,
  handleRestockClick,
  handleUpdateValueChange,
  handleUpdateProduct,
  updateValues,
  showAdminControls = false,
}: ProductCardProps) {
  return (
    <Card key={product.id} className="hover-lift gradient-card overflow-hidden card-container">
      <div className="aspect-video overflow-hidden">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/${product.thumbnail}`}
          alt={product.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {product.title}
          <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{((product.average_rating || 0).toFixed(1))} ({product.review_count || 0})</span>
            </div>
            <span>|</span>
            <span>
              {product.stock} in stock
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {product.description}
        </p>
        
        {showAdminControls && handleDeleteClick && handleRestockClick && (
          <>
            <div className="flex gap-2 mt-4">
              <Link to={`/admin/products/edit/${product.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gradient-primary button-on-card">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1 gradient-primary button-on-card" onClick={() => handleDeleteClick(product)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            {product.stock < 5 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gradient-primary button-on-card mt-2" 
                onClick={() => handleRestockClick(product)}
              >
                <PackagePlus className="mr-2 h-4 w-4" />
                Restock
              </Button>
            )}
          </>
        )}

        {handleUpdateValueChange && handleUpdateProduct && updateValues && (
            <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Stock: {product.stock}</span>
                    <span>Discount: {product.discount_percentage}%</span>
                </div>
                <div className="flex gap-2">
                    <Input 
                        type="number"
                        placeholder="Add stock"
                        value={updateValues[product.id]?.stock || ''}
                        onChange={(e) => handleUpdateValueChange(product.id, 'stock', e.target.value)}
                    />
                    <Button onClick={() => handleUpdateProduct(product.id, 'stock')} size="sm"><PackagePlus className="h-4 w-4"/></Button>
                </div>
                <div className="flex gap-2">
                    <Input 
                        type="number"
                        placeholder="Set discount %"
                        value={updateValues[product.id]?.discount_percentage || ''}
                        onChange={(e) => handleUpdateValueChange(product.id, 'discount_percentage', e.target.value)}
                    />
                    <Button onClick={() => handleUpdateProduct(product.id, 'discount_percentage')} size="sm"><Percent className="h-4 w-4"/></Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
