# Authentication

## Overview

Authentication is responsible for verifying user identity and protecting access to the Customer Relationship Management (CRM) system. The application uses JWT (JSON Web Token) based authentication with Access Tokens and Refresh Tokens to provide secure and efficient user sessions.

---

# Authentication Flow

```text
User
  │
  ▼
Register / Login
  │
  ▼
Backend verifies credentials
  │
  ▼
JWT Access Token + Refresh Token
  │
  ▼
Protected API Requests
  │
  ▼
Access Granted
```

---

# Authentication Features

The CRM system currently supports the following authentication features:

- User Registration
- User Login
- User Logout (revokes refresh token)
- Get Current User (`/api/auth/me`)
- JWT Access Token (30 minute expiry)
- Refresh Token (7 day expiry)
- Protected Routes
- Role-Based Authorization

---

# Register

## Purpose

Allows a new user to be created in the CRM system.

### Process

1. User submits email, full name, password, and role.
2. Backend checks the email isn't already registered.
3. Password is hashed before storage.
4. User record is created and returned (without the password).

**Endpoint:** `POST /api/auth/register`

---

# Login

## Purpose

Allows registered users to securely access the CRM system.

### Process

1. User enters email and password.
2. Backend validates the credentials against the stored password hash.
3. A JWT Access Token and a Refresh Token are generated.
4. The Refresh Token is stored on the user's record in the database.
5. Both tokens are returned to the client.

**Endpoint:** `POST /api/auth/login`

---

# Refresh

## Purpose

Issues a new Access Token without requiring the user to log in again.

### Process

1. Client sends the stored Refresh Token.
2. Backend verifies the token is valid, unexpired, and matches what's stored for the user.
3. A new Access Token (and rotated Refresh Token) is issued.

**Endpoint:** `POST /api/auth/refresh`

---

# Logout

## Purpose

Ends the user's authenticated session and revokes their refresh token.

### Process

- The user's stored Refresh Token is cleared from the database.
- The client removes its locally stored tokens.

**Endpoint:** `POST /api/auth/logout`

---

# Get Current User

## Purpose

Returns the profile of the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

---

# JWT Authentication

The CRM system uses JSON Web Tokens (JWT) for secure authentication.

## Access Token

The Access Token is sent with every protected API request (as a Bearer token) and is used to verify the user's identity. It expires after 30 minutes.

## Refresh Token

The Refresh Token is used to generate a new Access Token when the current Access Token expires, without requiring the user to log in again. It expires after 7 days and is stored server-side so it can be revoked on logout.

---

# Protected Routes

Protected routes ensure that only authenticated users can access restricted pages and APIs.

Examples include:

- Dashboard
- Leads
- Contacts
- Companies
- Deals
- Tasks
- Activities
- Reports

---

# Role-Based Authorization

The CRM system supports role-based access control (RBAC) via the `RoleEnum`.

Roles:

- `admin` — Full access to everything
- `manager` — Can manage team data
- `sales_rep` — Can only access own data

Each role is granted permissions based on business requirements, enforced via the `require_role()` dependency on relevant endpoints.

---

# Password Security

Passwords are stored securely using hashing.

Security practices include:

- Password hashing (bcrypt via Passlib)
- Secrets and algorithm configured via environment variables

---

# Security Best Practices

The authentication system follows these practices:

- JWT Authentication
- Access Token & Refresh Token with rotation
- Server-side refresh token revocation on logout
- Protected Routes
- Role-Based Authorization
- Secure Password Storage
- Environment Variables for Secret Keys

---

# Future Enhancements

The authentication module could be extended with additional features not yet implemented, including:

- Forgot Password / Reset Password flow
- Change Password (while logged in)
- Multi-Factor Authentication (MFA)
- Single Sign-On (SSO)
- OAuth Integration
- Account Lockout Protection
- Login Activity Monitoring

---

# Conclusion

The authentication module provides a secure foundation for the CRM system by verifying user identities, protecting sensitive resources, and enforcing role-based access control. The current implementation covers registration, login, token refresh, logout, and role-based authorization, with further security features planned for the future.