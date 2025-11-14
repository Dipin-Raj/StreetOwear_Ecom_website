# StreetO'Wear E-commerce Platform

![StreetO'Wear Logo](uploads/Streeto_Wear!.png)

Welcome to StreetO'Wear, a modern e-commerce platform for streetwear enthusiasts. This project is a full-stack application built with a FastAPI backend and a React frontend.

## Live Demo & API Docs

*   **Deployed Application:** [https://street-owear-ecom-website.vercel.app/](https://street-owear-ecom-website.vercel.app/)
*   **Swagger UI API Docs:** [https://streetowear-ecom-website.onrender.com/docs](https://streetowear-ecom-website.onrender.com/docs)
    *   **Note:** The backend is hosted on Render's free tier, so it may take a moment to load.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **Product Management:** Admins can add, update, and delete products.
*   **Category Management:** Admins can manage product categories.
*   **User Management:** Admins can view and manage user accounts.
*   **Product Browsing:** Users can browse products, search for specific items, and filter by category.
*   **Shopping Cart:** Users can add products to their cart and manage cart items.
*   **Wishlist:** Users can add products to their wishlist for future reference.
*   **Order Management:** Users can place orders and view their order history.
*   **Product Reviews:** Users can leave reviews and ratings for products.

## Tech Stack

### Backend

*   **Framework:** FastAPI
*   **Language:** Python
*   **Database:** PostgreSQL
*   **ORM:** SQLAlchemy
*   **Migrations:** Alembic
*   **Server:** Uvicorn (for development), Gunicorn (for production)

### Frontend

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI
*   **Language:** TypeScript

## Getting Started

### Prerequisites

*   Python 3.8+
*   Node.js 14.x+
*   PostgreSQL

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
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

### Running the Application

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

## Project Structure

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

## API Endpoints

A summary of the main API endpoints can be found below. For a complete and interactive API documentation, please visit the [Swagger UI](https://streetowear-ecom-website.onrender.com/docs).

*   `/auth`: User authentication (login, refresh token)
*   `/users`: User management (signup, get user profile)
*   `/products`: Product management and browsing
*   `/categories`: Category management
*   `/carts`: Shopping cart operations
*   `/orders`: Order management
*   `/reviews`: Product reviews and ratings
*   `/wishlist`: Wishlist management

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
