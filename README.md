# AuthFlow Full Stack Application

A secure, production-ready authentication system with a modern React frontend and a Rust/Axum backend.

---

## Features

- **JWT Authentication** (access & refresh tokens)
- **User Management** (registration, login, profile, password change)
- **Role-based Access Control** (user/admin)
- **Admin Dashboard** (user management, analytics, activity logs)
- **Password Security** (bcrypt)
- **File Uploads** (avatar)
- **OpenAPI/Swagger Docs**
- **SQLite (dev) / Postgres (prod)**
- **Modern UI** (React + Tailwind CSS)
- **TypeScript API client generation**

---

## Project Structure

```
auth-api-app/
├── auth-backend/      # Rust/Axum backend
├── frontend/          # React frontend
```

---

## Quick Start (Local)

### Prerequisites

- Rust 1.70+ (`rustup`)
- Node.js 18+ & npm
- SQLite (for local dev)

### 1. Backend

```bash
cd auth-backend
cp .env.example .env
# Edit .env as needed (see below)
cargo run
```

The backend runs at `http://localhost:3001`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3001/api
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`auth-backend/.env`)

```
DATABASE_URL=sqlite://auth.db
JWT_SECRET=your-super-secure-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:5173
SERVER_PORT=3001
RUST_LOG=info
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## Database Schema

**Users Table**
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

**Refresh Tokens Table**
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

---

## API Endpoints

See [Swagger UI](http://localhost:3001/swagger-ui) when running locally.

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

**User**
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `PUT /api/users/password`
- `DELETE /api/users/account`
- `POST /api/users/avatar`

**Admin**
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/activity`
- `GET /api/admin/users`

**Analytics**
- `GET /api/analytics/logins-per-day`

---

## Deployment

### Free Hosting Recommendations

| Component | Platform      | Type         | Free Tier? | Notes                        |
|-----------|--------------|--------------|------------|------------------------------|
| Frontend  | Vercel/Render| Static Site  | Yes        | React, easy CI/CD            |
| Backend   | Render/Railway| Web Service | Yes        | Rust/Axum supported          |
| Database  | Render/Railway| Postgres    | Yes        | Use managed Postgres         |

#### **Deploying on Render (all-in-one example):**

1. **Backend**
   - Create a new Web Service, connect your GitHub repo.
   - Set build command: `cargo build --release`
   - Set start command: `cargo run --release`
   - Set environment variables (see above).
   - Use Render's free Postgres and set `DATABASE_URL`.

2. **Frontend**
   - Create a new Static Site, connect your GitHub repo.
   - Build command: `npm run build`
   - Publish directory: `build`
   - Set `VITE_API_BASE_URL` to your backend's Render URL.

3. **Database**
   - Use Render's managed Postgres (free tier).
   - Update backend's `DATABASE_URL`.

#### **Other Platforms**
- **Frontend:** Netlify, Vercel, GitHub Pages
- **Backend:** Railway, Fly.io, Heroku (Rust buildpack)
- **Database:** Railway, Supabase, Neon (for Postgres)

---

## TypeScript API Client Generation

1. Start backend locally.
2. Download OpenAPI spec:
   ```bash
   curl http://localhost:3001/api-docs/openapi.json > openapi.json
   ```
3. Generate client:
   ```bash
   npx @openapitools/openapi-generator-cli generate \
     -i openapi.json \
     -g typescript-axios \
     -o ./frontend/src/api-client
   ```

---

## Security Features

- Bcrypt password hashing
- JWT with separate secrets for access/refresh
- Role-based access control
- CORS configuration
- Input validation (backend & frontend)
- File upload validation

---

## Development

- **Backend:**  
  - Run: `cargo run`
  - Test: `cargo test`
  - Migrations: `sqlx migrate run`
- **Frontend:**  
  - Run: `npm run dev`
  - Build: `npm run build`

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## License

MIT

---

**Questions?**  
Open an issue or discussion on GitHub! 