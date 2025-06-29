-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BLOB PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BLOB PRIMARY KEY,
    user_id BLOB NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Insert admin user (password: Password123!)
INSERT OR IGNORE INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role, 
    email_verified, 
    terms_accepted,
    created_at,
    updated_at
) VALUES (
    X'550e8400e29b41d4a716446655440000',
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G',
    'Admin User',
    'admin',
    TRUE,
    TRUE,
    datetime('now'),
    datetime('now')
);

-- Insert regular user (password: Password123!)
INSERT OR IGNORE INTO users (
    id, 
    email, 
    password_hash, 
    name, 
    role, 
    email_verified, 
    terms_accepted,
    created_at,
    updated_at
) VALUES (
    X'550e8400e29b41d4a716446655440001',
    'user@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G',
    'Regular User',
    'user',
    TRUE,
    TRUE,
    datetime('now'),
    datetime('now')
);