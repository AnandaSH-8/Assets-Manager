# Backend API Services

This folder contains the frontend services that interact with the Supabase Edge Functions (backend APIs).

## Architecture Overview

```
Frontend (React) → API Services → Supabase Edge Functions → PostgreSQL Database
```

## Available APIs

### 1. Authentication API (`/auth-api`)

- **POST** `/signup` - Create new user account
- **POST** `/signin` - Sign in user
- **POST** `/signout` - Sign out user
- **GET** `/me` - Get current user info

### 2. Financial API (`/financial-api`)

- **GET** `/all` - Get all financial particulars
- **GET** `/stats` - Get financial statistics
- **GET** `/{id}` - Get specific financial particular
- **POST** `/` - Create new financial particular
- **PUT** `/{id}` - Update financial particular
- **DELETE** `/{id}` - Delete financial particular

### 3. User API (`/user-api`)

- **GET** `/profile` - Get user profile
- **PUT** `/profile` - Update user profile
- **DELETE** `/delete-account` - Delete user account

## Usage Examples

```typescript
import { authAPI, financialAPI, userAPI } from '@/services/api';

// Authentication
const user = await authAPI.signUp(
  'email@example.com',
  'password',
  'John Doe',
  'johndoe',
);
const session = await authAPI.signIn('email@example.com', 'password');

// Financial operations
const financials = await financialAPI.getAll();
const stats = await financialAPI.getStats();
const newEntry = await financialAPI.create({
  category: 'Investment',
  description: 'Stock purchase',
  amount: 1000,
});

// User operations
const profile = await userAPI.getProfile();
await userAPI.updateProfile({ name: 'John Smith' });
```

## Security Features

- **Row Level Security (RLS)**: All database operations are protected by user-specific policies
- **JWT Authentication**: All protected endpoints require valid authentication tokens
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Proper CORS headers for web application security

## Database Schema

### Tables

- `profiles` - User profile information
- `financial_particulars` - Financial entries with categories and amounts

### Policies

- Users can only access their own data
- All operations are authenticated and authorized
- Automatic timestamps for created_at and updated_at

## Development

Edge Functions are automatically deployed when you make changes. You can monitor them in the Supabase dashboard.

For debugging, check:

- Edge Function logs in Supabase dashboard
- Network tab in browser dev tools
- Console logs for API responses
