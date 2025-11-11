# FastAPI E-commerce API

This is a comprehensive e-commerce API built with FastAPI, providing a wide range of functionalities for managing users, products, categories, carts, orders, and wishlists.

## Database Schema

The database consists of the following tables with their relationships:

### `User`

-   **Primary Key:** `id`
-   **Unique Fields:** `username`, `email`
-   **Relationships:**
    -   One-to-Many with `Cart`
    -   One-to-Many with `Order`
    -   One-to-One with `Wishlist`

### `Cart`

-   **Primary Key:** `id`
-   **Foreign Key:** `user_id` -> `User.id`
-   **Relationships:**
    -   Many-to-One with `User`
    -   One-to-Many with `CartItem`

### `CartItem`

-   **Primary Key:** `id`
-   **Foreign Keys:**
    -   `cart_id` -> `Cart.id`
    -   `product_id` -> `Product.id`
-   **Relationships:**
    -   Many-to-One with `Cart`
    -   Many-to-One with `Product`

### `Category`

-   **Primary Key:** `id`
-   **Unique Fields:** `name`
-   **Relationships:**
    -   One-to-Many with `Product`

### `Product`

-   **Primary Key:** `id`
-   **Foreign Key:** `category_id` -> `Category.id`
-   **Relationships:**
    -   Many-to-One with `Category`
    -   One-to-Many with `CartItem`
    -   One-to-Many with `OrderItem`
    -   One-to-Many with `ProductImage`
    -   Many-to-Many with `Wishlist` (through `wishlist_items` table)

### `ProductImage`

-   **Primary Key:** `id`
-   **Foreign Key:** `product_id` -> `Product.id`
-   **Relationships:**
    -   Many-to-One with `Product`

### `Order`

-   **Primary Key:** `id`
-   **Foreign Key:** `user_id` -> `User.id`
-   **Relationships:**
    -   Many-to-One with `User`
    -   One-to-Many with `OrderItem`

### `OrderItem`

-   **Primary Key:** `id`
-   **Foreign Keys:**
    -   `order_id` -> `Order.id`
    -   `product_id` -> `Product.id`
-   **Relationships:**
    -   Many-to-One with `Order`
    -   Many-to-One with `Product`

### `Wishlist`

-   **Primary Key:** `id`
-   **Foreign Key:** `user_id` -> `User.id` (unique)
-   **Relationships:**
    -   One-to-One with `User`
    -   Many-to-Many with `Product` (through `wishlist_items` table)

### `wishlist_items` (Association Table)

-   **Composite Primary Key:** `wishlist_id`, `product_id`
-   **Foreign Keys:**
    -   `wishlist_id` -> `Wishlist.id`
    -   `product_id` -> `Product.id`

---

## API Endpoints

Here is a summary of the available API endpoints:

### Account (`/me`)

-   `GET /`: Get current user's info.
-   `PUT /`: Update current user's info.
-   `DELETE /`: Delete current user's account.

### Auth (`/auth`)

-   `POST /signup`: User registration.
-   `POST /login/user`: User login.
-   `POST /login/admin`: Admin login.
-   `POST /refresh`: Refresh access token.

### Carts (`/carts`)

-   `GET /`: Get all carts (admin).
-   `GET /{cart_id}`: Get a specific cart.
-   `POST /`: Create a new cart.
-   `PUT /{cart_id}`: Update a cart.
-   `DELETE /{cart_id}`: Delete a cart.

### Categories (`/categories`)

-   `GET /`: Get all categories.
-   `GET /{category_id}`: Get a specific category.
-   `POST /`: Create a new category (admin).
-   `PUT /{category_id}`: Update a category (admin).
-   `DELETE /{category_id}`: Delete a category (admin).

### Orders (`/orders`)

-   `POST /`: Create a new order.
-   `GET /`: Get orders for the current user.
-   `GET /all`: Get all orders (admin).
-   `PUT /{order_id}/status`: Update order status (admin).
-   `DELETE /{order_id}`: Delete an order.

### Products (`/products`)

-   `GET /`: Get all products.
-   `GET /{product_id}`: Get a specific product.
-   `POST /`: Create a new product (admin).
-   `PUT /{product_id}`: Update a product (admin).
-   `DELETE /{product_id}`: Delete a product (admin).
-   `DELETE /{product_id}/images/{image_id}`: Delete a product image (admin).

### Users (`/users`)

-   `GET /`: Get all users (admin).
-   `GET /{user_id}`: Get a specific user (admin).
-   `GET /me`: Get current user's profile.
-   `GET /admin/me`: Get current admin's profile.
-   `PUT /me`: Update current user's profile.
-   `PUT /{user_id}`: Update a user (admin).
-   `DELETE /{user_id}`: Delete a user (admin).

### Wishlist (`/wishlist`)

-   `GET /`: Get user's wishlist.
-   `POST /`: Add a product to the wishlist.
-   `DELETE /{product_id}`: Remove a product from the wishlist.

---

## JWT Authentication

The application uses JSON Web Tokens (JWT) for authentication and authorization.

### How it Works

1.  **Login:** The user sends their credentials to the `/auth/login/user` or `/auth/login/admin` endpoint.
2.  **Token Generation:** Upon successful authentication, the server generates two tokens:
    *   **Access Token:** A short-lived JWT containing the user's ID and an expiration claim (`exp`). This token is used to authorize access to protected routes.
    *   **Refresh Token:** A long-lived JWT that is used to obtain a new access token when the current one expires.
3.  **Authenticated Requests:** To access protected endpoints, the client must include the access token in the `Authorization` header of the HTTP request, using the `Bearer` scheme.
4.  **Authorization:** The server validates the access token on each request to a protected route. For role-based access control (e.g., admin-only endpoints), the server checks the user's role in the database.
5.  **Token Refresh:** When the access token expires, the client can request a new access token by sending the refresh token to the `/auth/refresh` endpoint. This allows the user to stay logged in without having to re-enter their credentials.