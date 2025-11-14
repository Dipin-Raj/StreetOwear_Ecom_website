import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await loginUser(username, password, role);
    console.log("Login result:", result);
    
    if (result.success && result.data) {
      localStorage.setItem('accessToken', result.data.access_token);
      localStorage.setItem('refreshToken', result.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      console.log("Navigating to:", role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Invalid credentials or role mismatch",
        variant: "destructive",
      });
    }
  };

  const logoPath = 'Streeto_Wear!.png';

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <img src={`${import.meta.env.VITE_API_BASE_URL}/${logoPath.startsWith('/') ? logoPath.substring(1) : logoPath}`} alt="Streeto Wear Logo" className="h-full w-full object-contain" />
          </div>
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label> {}
              <Input
                id="username"
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Login as</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gradient-primary">
              Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Admin: Dipin Raj</p> {}
              <p>User: Appu</p> {}
              <p>Password: 1234</p> {}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
