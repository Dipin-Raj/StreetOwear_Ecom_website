import api, { setAuthToken } from '@/services/api';
import { AxiosError } from 'axios';

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

interface LoginResult {
    success: boolean;
    data?: AuthResponse;
    error?: string;
}

interface SignupResult {
    success: boolean;
    error?: string;
}

// --- Interfaces for fetched data ---
export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string; // Assuming ISO string date
}

export interface Category {
    id: number;
    name: string;
    thumbnail: string; // Renamed from image_url
}

export interface Product {
    id: number;
    title: string; // Renamed from name
    description: string;
    price: number;
    discount_percentage: number;
    rating: number;
    stock: number;
    brand: string;
    thumbnail: string; // Renamed from image_url
    images: string[];
    is_published: boolean;
    created_at: string;
    category_id: number;
    average_rating: number; // Added for reviews
    review_count: number; // Added for reviews
}

export interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    subtotal: number;
    product: Product; // Assuming Product interface is sufficient
}

export interface Cart {
    id: number;
    user_id: number;
    created_at: string;
    total_amount: number;
    cart_items: CartItem[];
}

export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
}

export interface Wishlist {
    id: number;
    user_id: number;
    products: Product[];
}

export interface ReviewCreate {
    product_id: number;
    rating: number;
    comment?: string;
}

export interface ReviewOut {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment?: string;
    created_at: string;
}

// --- Auth API Calls ---
export const loginUser = async (username: string, password: string, role: 'admin' | 'user'): Promise<LoginResult> => {
    try {
        const endpoint = role === 'admin' ? '/auth/login/admin' : '/auth/login/user';
        
        // FastAPI's OAuth2PasswordRequestForm expects x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await api.post<AuthResponse>(endpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        setAuthToken(access_token);

        return { success: true, data: response.data };
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Login failed:', axiosError.response?.data || axiosError.message);
        return {
            success: false,
            error: (axiosError.response?.data as any)?.detail || axiosError.message || 'An unexpected error occurred',
        };
    }
};

export const signupUser = async (fullName: string, username: string, email: string, password: string): Promise<SignupResult> => {
    try {
        const response = await api.post('/auth/signup', {
            full_name: fullName,
            username,
            email,
            password,
            role: "user" // Default role for signup
        });
        return { success: true };
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Signup failed:', axiosError.response?.data || axiosError.message);
        return {
            success: false,
            error: (axiosError.response?.data as any)?.detail || axiosError.message || 'An unexpected error occurred',
        };
    }
};

// --- User API Calls ---
export const fetchCurrentUserProfile = async (): Promise<User | null> => {
    try {
        const response = await api.get<{ message: string; data: User }>('/users/me');
        console.log("fetchCurrentUserProfile response:", response);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        return null;
    }
};

export const fetchCurrentAdminProfile = async (): Promise<User | null> => {
    try {
        const response = await api.get<{ message: string; data: User }>('/users/admin/me');
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        return null;
    }
};

export const updateUser = async (userId: number, userData: Partial<User>): Promise<User | null> => {
    try {
        const response = await api.put<{ message: string; data: User }>(`/users/${userId}`, userData);
        return response.data.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        return null;
    }
};

export const deleteUser = async (userId: number): Promise<boolean> => {
    try {
        await api.delete(`/users/${userId}`);
        return true;
    } catch (error) {
        console.error('Failed to delete user:', error);
        return false;
    }
};

// --- Product & Category API Calls ---
export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get<{ message: string; data: Category[] }>('/categories');
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
};

export const fetchProducts = async (options?: { limit?: number; search?: string; categoryId?: number; page?: number; sortBy?: string; sortDir?: string }): Promise<Product[]> => {
    try {
        const params = new URLSearchParams();
        const limit = options?.limit !== undefined ? options.limit : 10; // Default limit to 10 if not provided
        if (limit > 0) { // Only append limit if it's greater than 0
            params.append('limit', limit.toString());
        }
        if (options?.search) params.append('search', options.search);
        if (options?.categoryId) params.append('category_id', options.categoryId.toString());
        if (options?.page) params.append('page', options.page.toString());
        if (options?.sortBy) params.append('sort_by', options.sortBy);
        if (options?.sortDir) params.append('sort_dir', options.sortDir);

        const queryString = params.toString();
        const url = `/products${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<{ message: string; data: Product[] }>(url);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
};

// --- Cart API Calls ---
export const fetchUserCart = async (): Promise<Cart | null> => {
    try {
        // Assuming the backend returns a list of carts for the current user, and we take the first one
        // A more robust solution would be a dedicated /carts/me endpoint
        const response = await api.get<{ message: string; data: Cart[] }>('/carts');
        if (response.data.data.length > 0) {
            return response.data.data[0]; // Return the first cart found for the user
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch user cart:', error);
        return null;
    }
};

export const updateCart = async (cartId: number, cartItems: { product_id: number; quantity: number }[]): Promise<Cart | null> => {
    try {
        const response = await api.put<{ message: string; data: Cart }>(`/carts/${cartId}`, { cart_items: cartItems });
        return response.data.data;
    } catch (error) {
        console.error('Failed to update cart:', error);
        return null;
    }
};

export const createCart = async (cartItems: { product_id: number; quantity: number }[]): Promise<Cart | null> => {
    try {
        const response = await api.post<{ message: string; data: Cart }>('/carts', { cart_items: cartItems });
        return response.data.data;
    } catch (error) {
        console.error('Failed to create cart:', error);
        return null;
    }
};

export const checkoutCart = async (orderDetails: { address: string; payment_method: string }): Promise<any | null> => {
    try {
        const response = await api.post<{ message: string; data: any }>('/orders', orderDetails);
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as any)?.detail || axiosError.message || 'Failed to checkout cart';
        console.error('Failed to checkout cart:', errorMessage);
        throw new Error(errorMessage); // Re-throw with specific message
    }
};

// --- Order API Calls ---
export const fetchUserOrders = async (): Promise<Order[]> => {
    try {
        const response = await api.get<{ message: string; data: Order[] }>('/orders');
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return [];
    }
};

export const deleteOrder = async (orderId: number): Promise<boolean> => {
    try {
        await api.delete(`/orders/${orderId}`);
        return true;
    } catch (error) {
        console.error('Failed to delete order:', error);
        return false;
    }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order | null> => {
    try {
        const response = await api.put<{ message: string; data: Order }>(`/orders/${orderId}/status?new_status=${status}`);
        return response.data.data;
    } catch (error) {
        console.error('Failed to update order status:', error);
        return null;
    }
};

// --- Wishlist API Calls ---
export const fetchWishlist = async (): Promise<Product[]> => {
    try {
        const response = await api.get<Wishlist>('/wishlist');
        return response.data.products;
    } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        return [];
    }
};

export const addToWishlist = async (productId: number): Promise<void> => {
    try {
        await api.post('/wishlist', { product_id: productId });
    } catch (error) {
        console.error('Failed to add to wishlist:', error);
        throw error;
    }
};

export const removeFromWishlist = async (productId: number): Promise<void> => {
    try {
        await api.delete(`/wishlist/${productId}`);
    } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        throw error;
    }
};

// --- Admin API Calls ---
export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<{ message: string; data: User[] }>('/users/');
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        return [];
    }
};

export const fetchAllProducts = async (): Promise<Product[]> => {
    try {
        const response = await api.get<{ message: string; data: Product[] }>('/products');
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch all products:', error);
        return [];
    }
};

export const fetchAllOrders = async (options?: { status?: string; limit?: number; page?: number }): Promise<Order[]> => {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.status) params.append('status', options.status);
        if (options?.page) params.append('page', options.page.toString());

        const queryString = params.toString();
        const url = `/orders/all${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<{ message: string; data: Order[] }>(url);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch all orders:', error);
        return [];
    }
};

// --- Review API Calls ---
export const createReview = async (reviewData: ReviewCreate): Promise<ReviewOut | null> => {
    try {
        const response = await api.post<{ message: string; data: ReviewOut }>('/reviews', reviewData);
        return response.data.data;
    } catch (error) {
        console.error('Failed to create review:', error);
        throw error; // Re-throw to be handled by the component
    }
};

export const fetchReviewsForProduct = async (productId: number): Promise<ReviewOut[]> => {
    try {
        const response = await api.get<{ message: string; data: ReviewOut[] }>(`/reviews/product/${productId}`);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch reviews for product:', error);
        return [];
    }
};