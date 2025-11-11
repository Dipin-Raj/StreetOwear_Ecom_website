import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardHome from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import AddProduct from './pages/admin/AddProduct';
import ManageCategories from "./pages/admin/ManageCategories";
import AddCategory from './pages/admin/AddCategory';
import EditCategory from './pages/admin/EditCategory';
import EditProduct from './pages/admin/EditProduct';
import OrderDetails from "./pages/admin/OrderDetails";
import ViewReviews from "./pages/Admin/ViewReviews";
import UserDashboard from "./pages/user/UserDashboard";
import UserDashboardHome from "./pages/user/Dashboard";
import Categories from "./pages/user/Categories";
import Products from "./pages/user/Products";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Checkout from "./pages/user/Checkout";
import Wishlist from "./pages/user/Wishlist";
import UserProfile from "./pages/user/UserProfile";
import NotFound from "./pages/NotFound";
import { setAuthToken } from '@/services/api';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="dashboard" element={<AdminDashboardHome />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="categories/add" element={<AddCategory />} />
              <Route path="categories/edit/:id" element={<EditCategory />} />
              <Route path="orders" element={<OrderDetails />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="reviews" element={<ViewReviews />} />
            </Route>

            <Route path="/user" element={<UserDashboard />}>
              <Route path="dashboard" element={<UserDashboardHome />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/:id" element={<Products />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<Orders />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;