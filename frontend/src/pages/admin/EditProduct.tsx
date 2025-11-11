import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash } from 'lucide-react';
import api from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  stock: number;
  brand: string;
  thumbnail: string;
  images: { id: number; image_url: string }[];
  is_published: boolean;
  category_id: string;
  rating: number;
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [published, setPublished] = useState(true);
  const [thumbnail, setThumbnail] = useState<string | File | null>(null);
  const [existingImages, setExistingImages] = useState<{ id: number; image_url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rating, setRating] = useState('');

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/categories'),
        ]);
        const productData = productResponse.data.data;
        setCategories(categoriesResponse.data.data);

        setTitle(productData.title);
        setDescription(productData.description);
        setPrice(productData.price.toString());
        setDiscountPercentage(productData.discount_percentage.toString());
        setStock(productData.stock.toString());
        setBrand(productData.brand);
        setCategoryId(productData.category_id.toString());
        setPublished(productData.is_published);
        setThumbnail(productData.thumbnail);
        setExistingImages(productData.images);
        setRating(productData.rating.toString());
      } catch (error) {
        console.error('Error fetching product or categories:', error);
        toast({
          title: "Error",
          description: "Failed to load product details or categories.",
          variant: "destructive",
        });
      }
    };

    fetchProductAndCategories();
  }, [id]);

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.delete(`/products/${id}/images/${imageId}`);
      setExistingImages(existingImages.filter(image => image.id !== imageId));
      toast({
        title: "Image Deleted",
        description: "Product image has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('discount_percentage', discountPercentage);
    formData.append('stock', stock);
    formData.append('brand', brand);
    formData.append('category_id', categoryId);
    formData.append('is_published', String(published));
    formData.append('rating', rating);
    if (thumbnail && typeof thumbnail !== 'string') {
      formData.append('thumbnail', thumbnail);
    }
    newImages.forEach(image => {
      formData.append('images', image);
    });

    try {
      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: "Product updated successfully",
        description: `${title} has been updated.`,
      });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Edit Product</h2>
        <p className="text-muted-foreground mt-1">
          Edit the details of your product
        </p>
      </div>

      <Card className="gradient-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  step="0.01"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Enter brand"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
                onClick={(e) => (e.target as HTMLInputElement).value = ''} // Clear input to allow re-selecting same file
              />
              {thumbnail && typeof thumbnail === 'string' && (
                <div className="relative w-24 h-24 mt-2">
                  <img src={thumbnail} alt="Current Thumbnail" className="w-full h-full object-cover rounded-md" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => setThumbnail(null)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {thumbnail && typeof thumbnail !== 'string' && (
                <div className="relative w-24 h-24 mt-2">
                  <img src={URL.createObjectURL(thumbnail)} alt="New Thumbnail" className="w-full h-full object-cover rounded-md" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => setThumbnail(null)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Additional Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                onChange={(e) => setNewImages(prev => [...prev, ...Array.from(e.target.files || [])])}
                onClick={(e) => (e.target as HTMLInputElement).value = ''} // Clear input to allow re-selecting same files
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative">
                    <img src={image.image_url} alt={`Product Image ${image.id}`} className="w-24 h-24 object-cover rounded-md" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(image)} alt={`New Product Image ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label>Publish Product</Label>
                <p className="text-sm text-muted-foreground">
                  Make this product visible to customers
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>

            <Button type="submit" className="w-full gradient-primary">
              <Edit className="mr-2 h-4 w-4" />
              Update Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}