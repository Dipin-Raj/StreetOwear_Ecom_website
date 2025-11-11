import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { User, fetchCurrentUserProfile } from '@/lib/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const fetchedUser = await fetchCurrentUserProfile();
      if (!fetchedUser) {
        navigate('/login');
        return;
      }

      if (fetchedUser.role !== 'user') {
        navigate('/admin/dashboard');
        return;
      }

      setUser(fetchedUser);
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TopNavigationBar userName={user.full_name} isAdmin={false} />
      <div className="flex flex-1 flex-col overflow-hidden pt-16">
        <main className="flex-1 overflow-y-auto bg-background px-4">
          <Outlet context={{ user, scrollTo: location.state?.scrollTo }} />
        </main>
      </div>
    </div>
  );
}
