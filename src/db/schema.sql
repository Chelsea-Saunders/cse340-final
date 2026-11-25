CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(150) NOT NULL, 
    category VARCHAR(50) NOT NULL, 
    description TEXT, 
    price NUMERIC(10, 2) NOT NULL,
    image_sm VARCHAR(255), 
    image_med VARCHAR(255), 
    image_lg VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0)
);

CREATE TABLE inventory_reservations(
	id BIGSERIAL PRIMARY KEY, 
	session_id TEXT NOT NULL,
	product_id INTEGER NOT NULL
		REFERENCES products(id) ON DELETE CASCADE,
	quantity INTEGER NOT NULL CHECK (quantity > 0), 
	reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMPTZ NOT NULL,
	UNIQUE (session_id, product_id)
);

CREATE INDEX idx_inventory_reservations_expires_at
ON inventory_reservations (expires_at);

CREATE INDEX idx_inventory_reservations_product_id
ON inventory_reservations (product_id);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE, 
    password_hash VARCHAR(255), 
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'user'
        CONSTRAINT users_role_check
        CHECK (role IN ('user', 'employee', 'admin')), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id),
	full_name VARCHAR(100) NOT NULL,
	address VARCHAR(255) NOT NULL,
	city VARCHAR(100) NOT NULL,
	state VARCHAR(100) NOT NULL,
	zip VARCHAR(20) NOT NULL, 
	total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
	status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CONSTRAINT order_status_check
        CHECK (
            status IN (
                'pending', 
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            )
        ), 
	created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
	id SERIAL PRIMARY KEY,
	order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, 
	product_id INTEGER NOT NULL, 
	product_name VARCHAR(255) NOT NULL, 
	quantity INTEGER NOT NULL CHECK (quantity > 0),
	unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE if NOT EXISTS contact_messages (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL,
	subject VARCHAR(150) NOT NULL,
	message TEXT NOT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'responded', 'resolved')),
	response TEXT,
	responded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
	responded_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);