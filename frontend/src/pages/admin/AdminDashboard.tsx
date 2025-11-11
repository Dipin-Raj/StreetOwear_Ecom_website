import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { fetchCurrentAdminProfile, User } from '@/lib/api';
import { setAuthToken } from '@/services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      setAuthToken(accessToken);

      try {
        const fetchedUser = await fetchCurrentAdminProfile();
        if (!fetchedUser || fetchedUser.role !== 'admin') {
          navigate('/user/dashboard');
          return;
        }
        setUser(fetchedUser);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        navigate('/login'); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return <div>Loading admin dashboard...</div>; // Or a spinner
  }

  if (!user) {
    return null; // Should have navigated away if no user or not admin
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TopNavigationBar userName={user.full_name || user.username} isAdmin={true} />
      <div className="flex flex-1 flex-col overflow-hidden pt-16">
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
