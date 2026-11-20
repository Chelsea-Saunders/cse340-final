CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(150) NOT NULL, 
    category VARCHAR(50) NOT NULL, 
    description TEXT, 
    price NUMERIC(10, 2) NOT NULL,
    image_sm VARCHAR(255), 
    image_med VARCHAR(255), 
    image_lg VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    email VARCHaR(255) NOT NULL UNIQUE, 
    password_hash VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'user', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);