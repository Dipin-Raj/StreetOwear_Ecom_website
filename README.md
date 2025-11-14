# 🛍️ StreetO'Wear E-commerce Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/Dipin-Raj/StreetOwear_Ecom_website.git)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <img src="uploads/Streeto_Wear!.png" alt="StreetO'Wear Logo" width="150"/>
</p>

Welcome to StreetO'Wear, a modern e-commerce platform for streetwear enthusiasts. This project is a full-stack application built with a FastAPI backend and a React frontend. Explore the latest trends and shop seamlessly.

## 🌐 Live Demo & API Docs

*   **Deployed Application:** [https://street-owear-ecom-website.vercel.app/](https://street-owear-ecom-website.vercel.app/)
*   **Swagger UI API Docs:** [https://streetowear-ecom-website.onrender.com/docs](https://streetowear-ecom-website.onrender.com/docs)
    *   **Note:** The backend is hosted on Render's free tier, so it may take a moment for the server to warm up and load. Please be patient!

## ✨ Features

*   User Authentication: Secure user registration and login system.
*   Product Management: Admins can add, update, and delete products.
*   Category Management: Admins can manage product categories.
*   User Management: Admins can view and manage user accounts.
*   Product Browsing: Users can browse products, search for specific items, and filter by category.
*   Shopping Cart: Users can add products to their cart and manage cart items.
*   Wishlist: Users can add products to their wishlist for future reference.
*   Order Management: Users can place orders and view their order history.
*   Product Reviews: Users can leave reviews and ratings for products.

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

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
