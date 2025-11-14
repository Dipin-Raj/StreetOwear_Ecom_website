import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { fetchAllUsers, fetchAllProducts, fetchAllOrders, User, Product, Order, fetchCurrentAdminProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, usersData, productsData, ordersData] = await Promise.all([
          fetchCurrentAdminProfile(),
          fetchAllUsers(),
          fetchAllProducts(),
          fetchAllOrders(),
        ]);

        setUser(userData);
        setTotalUsers(usersData.length);
        setTotalProducts(productsData.length);

        const revenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
        setTotalRevenue(revenue);

        const activeOrders = ordersData.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
        setActiveOrdersCount(activeOrders.length);

        setRecentOrders(ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3));
        // For top products, a more sophisticated logic might be needed (e.g., based on sales count)
        // For now, we'll just take the first few products as a placeholder or implement a simple sorting.
        setTopProducts(productsData.slice(0, 3));

      } catch (err) {
        setError('Failed to load dashboard data.');
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { title: 'Total Users', value: totalUsers, icon: Users, description: 'Registered users' },
    { title: 'Products', value: totalProducts, icon: Package, description: 'In inventory' },
    { title: 'Active Orders', value: activeOrdersCount, icon: ShoppingCart, description: 'Pending & processing' },
    { title: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, description: 'Total earnings' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg gradient-maroon p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome {user?.full_name || user?.username || 'Admin'}</h1>
        <p className="text-white/90 mb-6">
          Here's what's happening with your store today.
        </p>
        <Button asChild variant="secondary" size="lg">
          <Link to="/admin/products">
            <Package className="mr-2 h-5 w-5" />
            Manage Products
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover-lift hover-gradient-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-gradient-primary">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent orders.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-gradient-primary">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${product.thumbnail.startsWith('/') ? product.thumbnail.substring(1) : product.thumbnail}`}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.stock} in stock
                      </p>
                    </div>
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p>No top products.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-700';
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
