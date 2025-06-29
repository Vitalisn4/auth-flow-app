# AuthFlow Backend

A secure, production-ready authentication backend built with Rust and Axum.

## Features

- **JWT Authentication**: Access tokens (10 min) and refresh tokens (7 days)
- **User Management**: Registration, login, profile management
- **Role-based Access Control**: User and admin roles
- **Password Security**: Bcrypt hashing with proper salt rounds
- **File Upload**: Avatar upload with validation
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Database**: SQLite for development, PostgreSQL-ready for production

## Quick Start

### Prerequisites

- Rust 1.70+
- SQLite

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-backend
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the application:
```bash
cargo run
```

The server will start on `http://localhost:3001`

### API Documentation

Visit `http://localhost:3001/swagger-ui` to explore the API documentation.

### Default Users

The application comes with two default users:

**Admin User:**
- Email: `admin@example.com`
- Password: `Password123!`
- Role: `admin`

**Regular User:**
- Email: `user@example.com`
- Password: `Password123!`
- Role: `user`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account
- `POST /api/users/avatar` - Upload avatar

### Admin (Admin role required)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/activity` - Recent activity

## Frontend Integration

### Environment Variables

Update your frontend `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Generate TypeScript Client

1. Start the backend server
2. Download the OpenAPI spec:
```bash
curl http://localhost:3001/api-docs/openapi.json > openapi.json
```

3. Generate TypeScript client:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./src/api-client
```

4. Update your frontend API service to use the generated client

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **Token Rotation**: Refresh tokens are rotated on use
- **CORS**: Configured for frontend domain
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size validation

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login TEXT
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Development

### Running Tests
```bash
cargo test
```

### Database Migrations
Migrations are automatically applied on startup. Manual migration:
```bash
sqlx migrate run
```

### Logging
Set log level with `RUST_LOG` environment variable:
```bash
RUST_LOG=debug cargo run
```

## Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost/authflow
JWT_SECRET=your-super-secure-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=https://yourdomain.com
SERVER_PORT=3001
RUST_LOG=info
```

### Docker Deployment
```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/auth-backend /usr/local/bin/auth-backend
EXPOSE 3001
CMD ["auth-backend"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.