import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus } from 'lucide-react';
import { useState } from 'react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function AddCategory() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await api.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: 'Category Added',
        description: `Category ${name} has been added.`,
      });
      // Reset form
      setName('');
      setDescription('');
      setThumbnailFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add category.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Add Category</h2>
          <p className="text-muted-foreground mt-1">
            Create a new category for your products
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
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input id="thumbnail" type="file" onChange={handleFileChange} required />
            </div>
            <Button type="submit" className="gradient-primary">
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
