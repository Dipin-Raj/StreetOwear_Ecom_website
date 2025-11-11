import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Trash } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

export default function AddProduct() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [published, setPublished] = useState(true);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rating, setRating] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail) {
      toast({
        title: "Thumbnail is required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', String(parseFloat(price)));
    formData.append('discount_percentage', String(parseFloat(discountPercentage)));
    formData.append('stock', stock);
    formData.append('brand', brand);
    formData.append('category_id', categoryId);
    formData.append('is_published', String(published));
    formData.append('thumbnail', thumbnail);
    formData.append('rating', rating);
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: "Product added successfully",
        description: `${title} has been added to your inventory`,
      });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "There was an error adding the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
    else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImages(prev => [...prev, ...fileArray]);
      const filePreviews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...filePreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Add Product</h2>
          <p className="text-muted-foreground mt-1">
            Create a new product for your store
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" rows={4} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input id="discountPercentage" type="number" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} placeholder="0" min="0" max="100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="0.0" min="0" max="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Enter brand" required />
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
              {thumbnailPreview ? (
                <div className="relative w-48 h-48">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover rounded-md" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={handleRemoveThumbnail}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  id="thumbnail"
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailChange}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Additional Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                onChange={handleImagesChange}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img src={preview} alt={`Image preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveImage(index)}
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

            <Button type="submit" className="w-full gradient-primary button-on-card">
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}