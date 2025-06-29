# Full-Stack Integration Guide

This guide will help you integrate the Rust backend with your React frontend to create a fully functional authentication system.

## Backend Setup

### 1. Start the Backend Server

```bash
cd auth-backend
cargo run
```

The backend will start on `http://localhost:3001` with the following features:
- JWT authentication with 10-minute access tokens
- Refresh tokens with 7-day expiration
- SQLite database with sample users
- OpenAPI documentation at `http://localhost:3001/swagger-ui`

### 2. Default Test Users

The backend comes with two pre-configured users:

**Admin User:**
- Email: `admin@example.com`
- Password: `Password123!`

**Regular User:**
- Email: `user@example.com`
- Password: `Password123!`

## Frontend Integration

### 1. Update Environment Variables

The frontend `.env` file has been updated to point to the backend:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. Updated Services

The `authService.ts` has been updated to use real API calls instead of mock data. The service now:
- Makes actual HTTP requests to the backend
- Handles authentication responses properly
- Manages token storage and refresh

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Integration

### 1. User Registration

1. Go to `http://localhost:5173/register`
2. Fill out the registration form with:
   - Email: `test@example.com`
   - Password: `Password123!`
   - Confirm Password: `Password123!`
   - Check "I agree to terms and conditions"
3. Click "Create account"
4. You should be automatically logged in and redirected to the dashboard

### 2. User Login

1. Go to `http://localhost:5173/login`
2. Use one of the test accounts:
   - Email: `admin@example.com` or `user@example.com`
   - Password: `Password123!`
3. Click "Sign in"
4. You should be redirected to the dashboard

### 3. Session Management

- The session will automatically expire after 10 minutes
- A warning will appear 1 minute before expiration
- You can extend the session or will be automatically logged out

### 4. Profile Management

1. Navigate to the profile page
2. Update your name and email
3. Change your password
4. Upload an avatar (files are stored in `auth-backend/uploads/avatars/`)

## API Endpoints

The backend provides the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
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

## Database

The backend uses SQLite for development with the following tables:

### Users Table
- Stores user information, passwords (hashed), roles, etc.
- Includes email verification and terms acceptance tracking

### Refresh Tokens Table  
- Stores hashed refresh tokens with expiration dates
- Automatically cleaned up when users log out

## Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password strength validation
- Secure password reset (ready for implementation)

### JWT Security
- Separate secrets for access and refresh tokens
- 10-minute access token expiration
- 7-day refresh token expiration with rotation
- Token blacklisting on logout

### API Security
- CORS configured for frontend domain
- Request validation using the `validator` crate
- SQL injection prevention with SQLx
- File upload validation (type, size limits)

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Ensure SQLite is installed
   - Check that the `auth.db` file is created in the backend directory

2. **Port Already in Use**
   - Change the `SERVER_PORT` in the `.env` file
   - Update the frontend `VITE_API_BASE_URL` accordingly

3. **CORS Errors**
   - Verify the `CORS_ORIGIN` in the backend `.env` matches your frontend URL

### Frontend Issues

1. **API Connection Failed**
   - Ensure the backend is running on the correct port
   - Check the `VITE_API_BASE_URL` in the frontend `.env`

2. **Authentication Not Working**
   - Clear browser storage and try again
   - Check browser console for error messages

## Production Deployment

### Backend Deployment

1. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:password@localhost/authflow
   JWT_SECRET=your-super-secure-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   CORS_ORIGIN=https://yourdomain.com
   SERVER_PORT=3001
   ```

2. **Docker Deployment**
   ```bash
   cd auth-backend
   docker build -t auth-backend .
   docker run -p 3001:3001 auth-backend
   ```

### Frontend Deployment

Update the production environment variables:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Next Steps

1. **Email Verification**: Implement email verification for new users
2. **Password Reset**: Add password reset functionality via email
3. **Rate Limiting**: Add rate limiting for authentication endpoints
4. **Monitoring**: Add logging and monitoring for production
5. **Testing**: Add comprehensive test suites for both frontend and backend

## Support

- Backend API Documentation: `http://localhost:3001/swagger-ui`
- Check the console logs for detailed error messages
- Review the `README.md` files in both frontend and backend directories

The integration is now complete! You have a fully functional full-stack authentication system with secure JWT-based authentication, user management, and a beautiful React frontend.%                   
