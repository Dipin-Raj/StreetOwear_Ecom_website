import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<string | File | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/categories/${id}`);
        const category = response.data.data;
        setName(category.name);
        setDescription(category.description);
        setThumbnail(category.thumbnail);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch category details.',
          variant: 'destructive',
        });
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (thumbnail && typeof thumbnail !== 'string') {
      formData.append('thumbnail', thumbnail);
    } else if (thumbnail === null) {
      formData.append('thumbnail', ''); // Signal to backend to remove thumbnail
    }

    try {
      await api.put(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: 'Category Updated',
        description: `Category ${name} has been updated.`,
      });
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Edit Category</h2>
          <p className="text-muted-foreground mt-1">
            Update the details of your category
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
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
            <Button type="submit" className="gradient-primary">
              <Edit className="mr-2 h-4 w-4" />
              Update Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
