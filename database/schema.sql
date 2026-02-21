-- Pizza Pixel Database Schema

CREATE DATABASE IF NOT EXISTS pizza_pixel;
USE pizza_pixel;

-- Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role ENUM('customer', 'admin', 'super_admin') DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(20) DEFAULT '🍕',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL, -- NULL if guest checkout or walk-in customer
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL, -- capturing price at the time of order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Initial Admin Setup (Password should be hashed in production)
INSERT IGNORE INTO users (first_name, last_name, email, password, role)
VALUES ('Super', 'Admin', 'admin@pizzapixel.com', 'admin123', 'super_admin');

-- Sample categories
INSERT IGNORE INTO categories (id, name, emoji, description) VALUES
(1, 'Pizzas',     '🍕', 'All pizza varieties'),
(2, 'Burgers',    '🍔', 'Juicy burgers & sliders'),
(3, 'Rolls',      '🌯', 'Wraps and rolls'),
(4, 'Sandwiches', '🥪', 'Classic sandwiches'),
(5, 'Drinks',     '🥤', 'Beverages & shakes'),
(6, 'Desserts',   '🍰', 'Sweets & treats');

-- Sample menu items
INSERT IGNORE INTO menu_items (id, category_id, name, description, price, image_url) VALUES
(1, 1, 'Margherita',    'Classic tomato & mozzarella',       12.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'),
(2, 1, 'Pepperoni',     'Loaded with pepperoni slices',       14.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'),
(3, 2, 'Classic Burger','Beef patty with lettuce & tomato',  11.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'),
(4, 5, 'Lemonade',      'Fresh-squeezed lemonade',            4.99, 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&h=300&fit=crop');
