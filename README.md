# 🛍️ StreetO'Wear E-commerce Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/Dipin-Raj/StreetOwear_Ecom_website.git)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-CC2B2B?style=for-the-badge&logo=sqlalchemy)
![Alembic](https://img.shields.io/badge/Alembic-4E85A6?style=for-the-badge&logo=alembic)
![Uvicorn](https://img.shields.io/badge/Uvicorn-2F8D8D?style=for-the-badge&logo=uvicorn)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcn-ui&logoColor=white)

<p align="center">
  <img src="uploads/Streeto_Wear!.png" alt="StreetO'Wear Logo" width="400"/>
</p>

Welcome to StreetO'Wear, a modern e-commerce platform for streetwear enthusiasts. This project is a full-stack application built with a FastAPI backend and a React frontend. It provides a seamless shopping experience for users and a powerful dashboard for administrators to manage products, categories, users, and orders. Explore the latest trends and shop with ease!

<br>

## 🌐 Live Demo & API Docs

*   **Deployed Application:** [https://street-owear-ecom-website.vercel.app/](https://street-owear-ecom-website.vercel.app/)
*   **Swagger UI API Docs:** [https://streetowear-ecom-website.onrender.com/docs](https://streetowear-ecom-website.onrender.com/docs)
    *   **Note:** The backend is hosted on Render's free tier, so it may take a moment for the server to warm up and load. Please be patient!

<br>

## ✨ Features

*   **User Authentication:** Secure user registration and login system with role-based access control (admin/user).
*   **Product Management:** Admins can add, update, and delete products, including details like price, stock, and images.
*   **Category Management:** Admins can manage product categories to organize the store's inventory.
*   **User Management:** Admins can view and manage user accounts.
*   **Product Browsing:** Users can browse products, search for specific items, and filter by category.
*   **Shopping Cart:** Users can add products to their cart and manage cart items before checkout.
*   **Wishlist:** Users can add products to their wishlist for future reference.
*   **Order Management:** Users can place orders and view their order history. Admins can manage all orders.
*   **Product Reviews:** Users can leave reviews and ratings for products, which are then displayed on the product page.

<br>

## 🛠️ Tech Stack

### 🐍 Backend (Python FastAPI)

*   **Framework:** FastAPI - High performance, easy to learn, fast to code, ready for production.
*   **Language:** Python - Versatile and powerful.
*   **Database:** PostgreSQL - Robust, open-source relational database.
*   **ORM:** SQLAlchemy - Python SQL toolkit and Object Relational Mapper.
*   **Migrations:** Alembic - Database migrations tool for SQLAlchemy.
*   **Server:** Uvicorn (for development), Gunicorn (for production) - ASGI server implementations.
*   **CORS:** Configured to handle Cross-Origin Resource Sharing for seamless frontend-backend communication.

### ⚛️ Frontend (React)

*   **Framework:** React - A JavaScript library for building user interfaces.
*   **Build Tool:** Vite - Next generation frontend tooling.
*   **Styling:** Tailwind CSS - A utility-first CSS framework for rapid UI development.
*   **UI Components:** Shadcn UI - Beautifully designed components built with Radix UI and Tailwind CSS.
*   **Language:** TypeScript - JavaScript with syntax for types.

<br>

## 🗃️ Database Schema

The database schema is designed to support a comprehensive e-commerce platform. Here's an overview of the main tables and their relationships:

*   **`users`**: Stores user information, including authentication details and roles (`admin` or `user`).
    *   `id` (Primary Key)
*   **`products`**: Contains all product details, such as title, description, price, stock, and brand.
    *   `id` (Primary Key)
    *   `category_id` (Foreign Key to `categories.id`)
*   **`categories`**: Stores product categories.
    *   `id` (Primary Key)
*   **`carts`**: Represents a user's shopping cart.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
*   **`cart_items`**: Represents the items within a user's shopping cart.
    *   `id` (Primary Key)
    *   `cart_id` (Foreign Key to `carts.id`)
    *   `product_id` (Foreign Key to `products.id`)
*   **`orders`**: Stores order information, including the user, total amount, and status.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
*   **`order_items`**: Represents the items within an order.
    *   `id` (Primary Key)
    *   `order_id` (Foreign Key to `orders.id`)
    *   `product_id` (Foreign Key to `products.id`)
*   **`wishlists`** and **`wishlist_items`**: Manage users' wishlists.
    *   `wishlists.id` (Primary Key)
    *   `wishlists.user_id` (Foreign Key to `users.id`)
    *   `wishlist_items` is a junction table connecting `wishlists` and `products`.
*   **`reviews`**: Stores user reviews and ratings for products.
    *   `id` (Primary Key)
    *   `product_id` (Foreign Key to `products.id`)
    *   `user_id` (Foreign Key to `users.id`)

<br>

## 🚀 Getting Started

### 📋 Prerequisites

*   Python 3.8+
*   Node.js 14.x+
*   PostgreSQL

### ⬇️ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dipin-Raj/StreetOwear_Ecom_website.git
    cd StreetOwear_Ecom_website
    ```

2.  **Backend Setup:**
    ```bash
    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install backend dependencies
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install frontend dependencies
    npm install
    ```

### ▶️ Running the Application

1.  **Run the Backend:**
    From the root directory, run:
    ```bash
    python run.py
    ```
    The backend will be available at `http://127.0.0.1:8000`.

2.  **Run the Frontend:**
    In a separate terminal, navigate to the `frontend` directory and run:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

<br>

## 📂 Project Structure

```
.
├── alembic/              # Alembic migration scripts
├── app/                  # Main application directory
│   ├── core/             # Core components (config, security)
│   ├── db/               # Database setup
│   ├── models/           # SQLAlchemy models
│   ├── routers/          # API routers
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── frontend/             # React frontend application
│   ├── public/           # Public assets
│   └── src/              # Frontend source code
├── uploads/              # Directory for uploaded files
├── main.py               # Main FastAPI application entrypoint
├── run.py                # Script to run the development server
├── requirements.txt      # Backend dependencies
└── README.md             # This file
```

<br>

## 🔗 API Endpoints

A summary of the main API endpoints can be found below. For a complete and interactive API documentation, please visit the [Swagger UI](https://streetowear-ecom-website.onrender.com/docs).

*   `/auth`: User authentication (login, refresh token)
*   `/users`: User management (signup, get user profile)
*   `/products`: Product management and browsing
*   `/categories`: Category management
*   `/carts`: Shopping cart operations
*   `/orders`: Order management
*   `/reviews`: Product reviews and ratings
*   `/wishlist`: Wishlist management
<br>

## Authors
- 📍[@Dipin-Raj](https://github.com/Dipin-Raj)
-  📧 Contact: dipinr505@gmail.com

⚡ “Turning raw ride data into actionable insights, one visualization at a time.”
