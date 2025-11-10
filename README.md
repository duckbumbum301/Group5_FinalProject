# Vựa Vui Vẻ - E-commerce Platform

A comprehensive e-commerce platform for fresh groceries, built with Vanilla JavaScript and Node.js. Vựa Vui Vẻ provides a complete solution for online grocery sales, including a product catalog, shopping cart, order management, and an admin panel for content management.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Team Members](#team-members)
- [Contributing](#contributing)
- [License](#license)

## Overview

Vựa Vui Vẻ is a full-stack web application designed for online grocery sales. The platform consists of three main components:

-   **Client Frontend**: Customer-facing website for browsing products, managing the cart, and placing orders. Built with HTML, CSS, and Vanilla JavaScript.
-   **Backoffice (Admin Panel)**: A single-page administrative panel for managing products, orders, users, and viewing statistics.
-   **Backend API**: A RESTful API server built with **JSON Server** and **Express.js**, featuring custom middleware for business logic like inventory management.
-   **VNPay Payment Gateway**: A separate Node.js service to handle online payments via VNPay.

## Features

### Customer Features

-   Product browsing and search with filters by category.
-   Shopping cart management.
-   User authentication (Login/Register) and profile management.
-   Order placement with COD (Cash on Delivery) and online payment options.
-   View order history.
-   Explore cooking recipes that use products from the store.

### Admin Features

-   Dashboard with sales statistics and analytics.
-   Product management (CRUD operations).
-   Order management and processing (update status).
-   User management.
-   View audit logs for administrative actions (Admin role only).
-   Export data to CSV.

### Technical Features

-   **Zero-Code REST API**: Utilizes JSON Server to automatically generate a full REST API from a JSON file.
-   **Middleware for Business Logic**: Custom Express middleware for automatic stock deduction on new orders and stock restoration on cancellations.
-   **File-Based Database**: Simple and portable JSON file (`db.json`) acts as the database, suitable for rapid development.
-   **Data Synchronization**: Product data is automatically backed up from the main `db.json` to a separate file.
-   **Payment Gateway Integration**: Integrated with VNPay for online payment processing.
-   **Automation Scripts**: Includes `.bat` and `.sh` scripts for easy setup and startup.

## Technology Stack

### Frontend

-   **HTML5**: Standard markup language.
-   **CSS3**: Styling the user interface.
-   **JavaScript (Vanilla ES6)**: Core logic for interactivity and API communication.
-   **http-server**: Lightweight static file server for development.

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework used as a base for JSON Server and for custom middleware.
-   **JSON Server**: Creates a full fake REST API with zero coding.
-   **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
-   **concurrently**: Runs multiple npm scripts simultaneously.

### Database

-   **JSON File**: A simple `db.json` file serves as the application's database.

### Development Tools

-   **Git**: Version control.
-   **npm**: Package manager for Node.js.

## Project Structure

```
Group5_FinalProject/
├── backoffice/                 # Backend API and Admin Panel
│   ├── data/                   # Backup data files (products.json, etc.)
│   ├── server-simple.js        # Main backend server entry point (with middleware)
│   ├── server-middleware.js    # Custom business logic (stock management)
│   ├── dataManager.js          # Data access layer
│   ├── app.js                  # Admin panel single-page application logic
│   ├── index.html              # Admin panel UI
│   └── db.json                 # ⭐ Main application database
│
├── html/                       # Customer frontend HTML pages
│   ├── index.html              # Homepage
│   ├── cart.html               # Shopping Cart
│   └── ...
│
├── js/                         # Customer frontend JavaScript
│   ├── main.js                 # Main application logic for the customer side
│   ├── api.js                  # API communication layer
│   ├── cart.js                 # Shopping cart logic
│   └── checkout.js             # Checkout process logic
│
├── client/                     # Customer authentication pages (login, register)
│
├── vnpay_nodejs/               # VNPay payment gateway service
│   ├── app.js                  # VNPay Express server
│   ├── routes/order.js         # VNPay API routes
│   └── package.json
│
├── assets/                     # Static assets (CSS, fonts, images)
├── doc/                        # Project documentation
├── setup.bat                   # Windows setup script
├── setup.sh                    # Linux/macOS setup script
├── start-all.bat               # Script to start all services
├── stop-all.bat                # Script to stop all services
├── package.json                # Main project dependencies and scripts
└── README.md                   # This file
```

## Prerequisites

Before installing, ensure you have the following installed:
-   **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
-   **npm**: Comes with Node.js
-   **Git**: For version control ([Download](https://git-scm.com/))

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/duckbumbum301/Group5_FinalProject.git
    cd Group5_FinalProject
    ```

2.  **Run the Setup Script**
    This script will install all necessary dependencies for the main project and the VNPay service.

    For Windows:
    ```bash
    .\setup.bat
    ```

    For Linux/macOS:
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

## Configuration

The project is configured to run out-of-the-box for a local development environment.
-   The main API server runs on `http://localhost:3000`.
-   The frontend server runs on `http://localhost:8000`.
-   The VNPay service runs on `http://localhost:8888`.

The VNPay service configuration can be found in `vnpay_nodejs/config/default.json`.

## Running the Application

You can run all services (Backend API, Frontend, VNPay) with a single command.

For Windows:
```bash
.\start-all.bat
```

For Linux/macOS (or using npm):
```bash
npm start
```
This will start:
-   **Backend API** on `http://localhost:3000`
-   **Frontend Server** on `http://localhost:8000`

To run with the VNPay service as well:
```bash
npm run dev:vnpay
```

Once running, you can access the application:
-   **Homepage**: `http://localhost:8000/html/index.html`
-   **Admin Panel**: `http://localhost:8000/backoffice/`

## Usage Guide

### For Customers
-   **Browse Products**: Navigate through the homepage or categories.
-   **Add to Cart**: Click the "Thêm vào giỏ" button on products.
-   **Checkout**: Go to your cart, review the items, and proceed to checkout.
-   **Login/Register**: Access your account page to view order history.

### For Administrators
-   **Login**: Navigate to the [Backoffice](http://localhost:8000/backoffice/) and log in.
-   **Dashboard**: View an overview of sales and product statistics.
-   **Manage Products**: Go to the "Products" section to add, edit, or delete items.
-   **Manage Orders**: Go to the "Orders" section to view and update the status of customer orders.

## API Documentation

The backend API is powered by JSON Server and is available at `http://localhost:3000`.

### Base URL
`http://localhost:3000`

### Main Endpoints
-   `GET /products`: Retrieve all products. Supports filtering (e.g., `/products?category=veg`).
-   `POST /products`: Create a new product.
-   `PATCH /products/:id`: Update a product.
-   `DELETE /products/:id`: Delete a product.
-   `GET /orders`: Retrieve all orders.
-   `POST /orders`: Create a new order (this will trigger the stock deduction middleware).
-   `PATCH /orders/:id`: Update an order (cancelling an order triggers the stock restore middleware).
-   `GET /users`: Retrieve all users.

### VNPay API
-   `GET http://localhost:8888/order/create_payment_url`: Endpoint to initiate a VNPay transaction.

## Team Members

This project is developed by **Group 5** for the final project.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

**Important**: Before committing, ensure your changes do not include test data in `backoffice/db.json`. It's recommended to back up the original `db.json` before testing.

## License

This project is developed for educational purposes. All rights reserved by the development team.// filepath: README.md
# Vựa Vui Vẻ - E-commerce Platform

A comprehensive e-commerce platform for fresh groceries, built with Vanilla JavaScript and Node.js. Vựa Vui Vẻ provides a complete solution for online grocery sales, including a product catalog, shopping cart, order management, and an admin panel for content management.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Team Members](#team-members)
- [Contributing](#contributing)
- [License](#license)

## Overview

Vựa Vui Vẻ is a full-stack web application designed for online grocery sales. The platform consists of three main components:

-   **Client Frontend**: Customer-facing website for browsing products, managing the cart, and placing orders. Built with HTML, CSS, and Vanilla JavaScript.
-   **Backoffice (Admin Panel)**: A single-page administrative panel for managing products, orders, users, and viewing statistics.
-   **Backend API**: A RESTful API server built with **JSON Server** and **Express.js**, featuring custom middleware for business logic like inventory management.
-   **VNPay Payment Gateway**: A separate Node.js service to handle online payments via VNPay.

## Features

### Customer Features

-   Product browsing and search with filters by category.
-   Shopping cart management.
-   User authentication (Login/Register) and profile management.
-   Order placement with COD (Cash on Delivery) and online payment options.
-   View order history.
-   Explore cooking recipes that use products from the store.

### Admin Features

-   Dashboard with sales statistics and analytics.
-   Product management (CRUD operations).
-   Order management and processing (update status).
-   User management.
-   View audit logs for administrative actions (Admin role only).
-   Export data to CSV.

### Technical Features

-   **Zero-Code REST API**: Utilizes JSON Server to automatically generate a full REST API from a JSON file.
-   **Middleware for Business Logic**: Custom Express middleware for automatic stock deduction on new orders and stock restoration on cancellations.
-   **File-Based Database**: Simple and portable JSON file (`db.json`) acts as the database, suitable for rapid development.
-   **Data Synchronization**: Product data is automatically backed up from the main `db.json` to a separate file.
-   **Payment Gateway Integration**: Integrated with VNPay for online payment processing.
-   **Automation Scripts**: Includes `.bat` and `.sh` scripts for easy setup and startup.

## Technology Stack

### Frontend

-   **HTML5**: Standard markup language.
-   **CSS3**: Styling the user interface.
-   **JavaScript (Vanilla ES6)**: Core logic for interactivity and API communication.
-   **http-server**: Lightweight static file server for development.

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework used as a base for JSON Server and for custom middleware.
-   **JSON Server**: Creates a full fake REST API with zero coding.
-   **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
-   **concurrently**: Runs multiple npm scripts simultaneously.

### Database

-   **JSON File**: A simple `db.json` file serves as the application's database.

### Development Tools

-   **Git**: Version control.
-   **npm**: Package manager for Node.js.

## Project Structure

```
Group5_FinalProject/
├── backoffice/                 # Backend API and Admin Panel
│   ├── data/                   # Backup data files (products.json, etc.)
│   ├── server-simple.js        # Main backend server entry point (with middleware)
│   ├── server-middleware.js    # Custom business logic (stock management)
│   ├── dataManager.js          # Data access layer
│   ├── app.js                  # Admin panel single-page application logic
│   ├── index.html              # Admin panel UI
│   └── db.json                 # ⭐ Main application database
│
├── html/                       # Customer frontend HTML pages
│   ├── index.html              # Homepage
│   ├── cart.html               # Shopping Cart
│   └── ...
│
├── js/                         # Customer frontend JavaScript
│   ├── main.js                 # Main application logic for the customer side
│   ├── api.js                  # API communication layer
│   ├── cart.js                 # Shopping cart logic
│   └── checkout.js             # Checkout process logic
│
├── client/                     # Customer authentication pages (login, register)
│
├── vnpay_nodejs/               # VNPay payment gateway service
│   ├── app.js                  # VNPay Express server
│   ├── routes/order.js         # VNPay API routes
│   └── package.json
│
├── assets/                     # Static assets (CSS, fonts, images)
├── doc/                        # Project documentation
├── setup.bat                   # Windows setup script
├── setup.sh                    # Linux/macOS setup script
├── start-all.bat               # Script to start all services
├── stop-all.bat                # Script to stop all services
├── package.json                # Main project dependencies and scripts
└── README.md                   # This file
```

## Prerequisites

Before installing, ensure you have the following installed:
-   **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
-   **npm**: Comes with Node.js
-   **Git**: For version control ([Download](https://git-scm.com/))

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/duckbumbum301/Group5_FinalProject.git
    cd Group5_FinalProject
    ```

2.  **Run the Setup Script**
    This script will install all necessary dependencies for the main project and the VNPay service.

    For Windows:
    ```bash
    .\setup.bat
    ```

    For Linux/macOS:
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

## Configuration

The project is configured to run out-of-the-box for a local development environment.
-   The main API server runs on `http://localhost:3000`.
-   The frontend server runs on `http://localhost:8000`.
-   The VNPay service runs on `http://localhost:8888`.

The VNPay service configuration can be found in `vnpay_nodejs/config/default.json`.

## Running the Application

You can run all services (Backend API, Frontend, VNPay) with a single command.

For Windows:
```bash
.\start-all.bat
```

For Linux/macOS (or using npm):
```bash
npm start
```
This will start:
-   **Backend API** on `http://localhost:3000`
-   **Frontend Server** on `http://localhost:8000`

To run with the VNPay service as well:
```bash
npm run dev:vnpay
```

Once running, you can access the application:
-   **Homepage**: `http://localhost:8000/html/index.html`
-   **Admin Panel**: `http://localhost:8000/backoffice/`

## Usage Guide

### For Customers
-   **Browse Products**: Navigate through the homepage or categories.
-   **Add to Cart**: Click the "Thêm vào giỏ" button on products.
-   **Checkout**: Go to your cart, review the items, and proceed to checkout.
-   **Login/Register**: Access your account page to view order history.

### For Administrators
-   **Login**: Navigate to the [Backoffice](http://localhost:8000/backoffice/) and log in.
-   **Dashboard**: View an overview of sales and product statistics.
-   **Manage Products**: Go to the "Products" section to add, edit, or delete items.
-   **Manage Orders**: Go to the "Orders" section to view and update the status of customer orders.

## API Documentation

The backend API is powered by JSON Server and is available at `http://localhost:3000`.

### Base URL
`http://localhost:3000`

### Main Endpoints
-   `GET /products`: Retrieve all products. Supports filtering (e.g., `/products?category=veg`).
-   `POST /products`: Create a new product.
-   `PATCH /products/:id`: Update a product.
-   `DELETE /products/:id`: Delete a product.
-   `GET /orders`: Retrieve all orders.
-   `POST /orders`: Create a new order (this will trigger the stock deduction middleware).
-   `PATCH /orders/:id`: Update an order (cancelling an order triggers the stock restore middleware).
-   `GET /users`: Retrieve all users.

### VNPay API
-   `GET http://localhost:8888/order/create_payment_url`: Endpoint to initiate a VNPay transaction.

## Team Members

This project is developed by **Group 5** for the final project.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

**Important**: Before committing, ensure your changes do not include test data in `backoffice/db.json`. It's recommended to back up the original `db.json` before testing.

## License

This project is developed for educational purposes. All rights reserved by the development team.
