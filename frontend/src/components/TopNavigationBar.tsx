import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, FolderOpen, ShoppingCart, Home, ClipboardList, LogOut, User as UserIcon, Search, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

interface TopNavigationBarProps {
  userName?: string;
  isAdmin: boolean;
}

export function TopNavigationBar({ userName, isAdmin }: TopNavigationBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/user/products?search=${searchQuery.trim()}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate('/login');
  };

  const adminDropdownNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  ];

  const userDropdownNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/user/dashboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-maroon text-white">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Section - Branding */}
        <Link to={isAdmin ? "/admin/dashboard" : "/user/dashboard"} className="text-2xl font-bold text-white flex items-center">
          <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/Streeto_Wear!.png`} alt="Streeto Wear" className="h-16" />
        </Link>

        {/* Center Section - Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 mx-auto">
          {isAdmin ? (
            <>
              <Link
                to="/admin/users"
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/admin/users') ? "gradient-text" : "text-white"
                )}
              >
                Manage Users
              </Link>
              <Link
                to="/admin/products"
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/admin/products') ? "gradient-text" : "text-white"
                )}
              >
                Manage Products
              </Link>
              <Link
                to="/admin/categories"
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/admin/categories') ? "gradient-text" : "text-white"
                )}
              >
                Manage Categories
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/user/products"
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/products') ? "gradient-text" : "text-white"
                )}
              >
                Shop
              </Link>
              <Link
                to="/user/categories"
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/categories') ? "gradient-text" : "text-white"
                )}
              >
                Categories
              </Link>
              <Link
                to="/user/dashboard"
                state={{ scrollTo: 'new-drops' }}
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname.includes('/user/dashboard') && location.state?.scrollTo === 'new-drops' ? "gradient-text" : "text-white"
                )}
              >
                New Drops
              </Link>
              <Link
                to="/about" // Placeholder route
                className={cn(
                  "text-lg font-bold transition-colors hover-gradient-text-yellow",
                  location.pathname === '/about' ? "gradient-text" : "text-white"
                )}
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Right Section - Icons */}
        <div className="flex items-center gap-4 px-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent border-b-2 border-white text-white placeholder-white focus:outline-none"
              />
              <button type="submit" className="absolute right-0 top-0">
                <Search className="h-5 w-5 text-white" />
              </button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="hover-gradient-background-yellow hover-gradient-text-yellow text-white" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover-gradient-background-yellow hover-gradient-text-yellow">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Admin
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {adminDropdownNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem onClick={() => navigate('/admin/orders')}> {/* My Orders for Admin */}
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/reviews')}>
                  <Star className="mr-2 h-4 w-4" />
                  <span>View Reviews</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover-gradient-background-yellow hover-gradient-text-yellow">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      User
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userDropdownNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem onClick={() => navigate('/user/orders')}> {/* My Orders for User */}
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/user/wishlist')}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>My Wishlist</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link to={isAdmin ? "/admin/orders" : "/user/cart"}> {}
            <Button variant="ghost" size="icon" className="hover-gradient-background-yellow hover-gradient-text-yellow text-white">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
