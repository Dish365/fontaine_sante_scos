# Fontaine Santé SCOS - Frontend

A Next.js 15+ frontend application for the Staff Communication & Operations System with authentication integration to the Django backend.

## Features

- **Two-Factor Authentication**: Staff ID + Password + OTP verification
- **User Registration**: Admin-only user registration with security questions
- **Role-Based Access**: Different access levels for different user roles
- **TypeScript**: Full type safety throughout the application
- **shadcn/ui**: Modern, accessible UI components
- **TailwindCSS**: Utility-first CSS framework

## Tech Stack

- **Next.js 15.3.3** with App Router
- **TypeScript 5.8.3**
- **TailwindCSS 4.1.8** 
- **shadcn/ui** components
- **React 19.1.0**
- **pnpm** package manager

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Django backend running on port 8000

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Login Process
1. User enters Staff ID and Password
2. System validates credentials with Django backend
3. OTP is sent to user's email
4. User enters OTP to complete login
5. JWT tokens are stored for session management

### User Registration (Admin Only)
1. Admins/Managers can access `/register`
2. Complete user information form including:
   - Personal details (name, email, phone)
   - Work information (role, department)
   - Password setup
   - Security questions for password recovery

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page (admin only)
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout with AuthProvider
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx  # Login form with OTP flow
│   │   └── RegistrationForm.tsx # User registration form
│   └── ui/                # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── lib/
│   ├── api.ts            # Django backend API integration
│   └── toast.ts          # Toast notification utility
└── types/
    └── auth.ts           # TypeScript interfaces
```

## API Integration

The frontend integrates with the Django backend endpoints:

- `POST /users/login/` - Initial login with staff_id/password
- `POST /users/login/verify/` - OTP verification
- `POST /users/otp/request/` - Request new OTP
- `POST /users/register/` - Admin user registration
- `GET /users/profile/` - Get user profile
- `POST /users/token/refresh/` - Refresh JWT token

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Django backend API URL | `http://localhost:8000` |

## User Roles & Permissions

- **Administrator**: Full access, can register users
- **Manager**: Can register users, manage team
- **Doctor/Nurse/Staff**: Standard access to dashboard
- **Technician**: Department-specific access

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Role-based route protection
- Secure password requirements
- Two-factor authentication with OTP
- Security questions for password recovery

## Contributing

1. Follow TypeScript strict mode
2. Use existing component patterns
3. Maintain authentication flow integrity
4. Test with Django backend integration

## Support

For issues related to authentication or API integration, check:
1. Django backend is running on port 8000
2. Environment variables are correctly set
3. Network connectivity between frontend and backend
