# Authentication API

A Node.js / Express authentication backend with email OTP verification, JWT access tokens, and HTTP-only refresh token cookies backed by MongoDB sessions.

## Features

- User registration with email OTP verification
- Secure password hashing with **bcrypt** (cost factor 12)
- JWT access tokens (15 minutes) and refresh tokens (7 days)
- Refresh tokens stored as SHA-256 hashes in MongoDB sessions
- HTTP-only, secure, same-site cookies for refresh tokens
- Logout (current session) and logout-all (all devices)
- OTP emails via Gmail OAuth2 (Nodemailer)
- OTPs auto-expire after 10 minutes (MongoDB TTL)

## Tech Stack

- **Node.js** (ES modules)
- **Express 5**
- **MongoDB** + **Mongoose**
- **jsonwebtoken**
- **bcrypt**
- **Nodemailer** (Gmail OAuth2)
- **cookie-parser**, **morgan**, **dotenv**

## Project Structure

```
├── server.js
├── package.json
├── .env                  # create this (not committed)
└── src/
    ├── app.js
    ├── config/
    │   ├── config.js
    │   └── database.js
    ├── controllers/
    │   └── auth.controller.js
    ├── models/
    │   ├── user.model.js
    │   ├── session.model.js
    │   └── otp.model.js
    ├── routes/
    │   └── auth.routes.js
    ├── services/
    │   └── email.service.js
    └── utils/
        └── utils.js
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Gmail account with OAuth2 credentials for sending email

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/authentication
JWT_SECRET=your_strong_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_gmail_address@gmail.com
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign access and refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token for Gmail |
| `GOOGLE_USER` | Gmail address used as the sender |

### Run

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

## Auth Flow

1. **Register** — creates an unverified user, hashes the password with bcrypt, and emails a 6-digit OTP.
2. **Verify email** — submits email + OTP; on success, `verified` becomes `true`.
3. **Login** — returns an access token in the JSON body and sets a refresh token cookie; creates a session.
4. **Protected requests** — send `Authorization: Bearer <accessToken>`.
5. **Refresh** — uses the refresh cookie to issue a new access token and rotate the refresh token.
6. **Logout / logout-all** — revokes the current session or all sessions for the user.

## API Endpoints

Base path: `/api/auth`

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "jane",
  "email": "jane@example.com",
  "password": "yourpassword"
}
```

**201**

```json
{
  "message": "User registered successfully",
  "user": {
    "username": "jane",
    "email": "jane@example.com",
    "verified": false
  }
}
```

### Verify email

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "jane@example.com",
  "otp": "123456"
}
```

**200**

```json
{
  "message": "Email verified successfully",
  "user": {
    "username": "jane",
    "email": "jane@example.com",
    "verified": true
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "yourpassword"
}
```

**200**

```json
{
  "message": "Logged in successfully",
  "user": {
    "username": "jane",
    "email": "jane@example.com"
  },
  "accessToken": "<jwt>"
}
```

Also sets an HTTP-only `refreshToken` cookie.

> Note: refresh cookies use `secure: true`, so they are only sent over HTTPS. For local HTTP testing you may need to adjust cookie options or use HTTPS.

### Get current user

```http
GET /api/auth/get-me
Authorization: Bearer <accessToken>
```

**200**

```json
{
  "message": "user fetched successfully",
  "user": {
    "username": "jane",
    "email": "jane@example.com"
  }
}
```

### Refresh access token

```http
GET /api/auth/refresh-token
```

Uses the `refreshToken` cookie. Rotates the refresh token and returns a new access token.

**200**

```json
{
  "message": "Access token refreshed successfully",
  "accessToken": "<jwt>"
}
```

### Logout (current device)

```http
GET /api/auth/logout
```

Revokes the current session and clears the refresh cookie.

### Logout all devices

```http
GET /api/auth/logout-all
```

Revokes all active sessions for the authenticated user and clears the refresh cookie.

## Security Notes

- Passwords are hashed with **bcrypt** (12 rounds); plaintext passwords are never stored.
- Refresh tokens are stored as **SHA-256 hashes** in the sessions collection.
- Access tokens expire in **15 minutes**; refresh tokens expire in **7 days**.
- OTPs are generated with `crypto.randomInt`, hashed before storage, and deleted by MongoDB TTL after **10 minutes**.
- Invalid or expired JWTs return `{ "message": "Invalid or expired token" }`.

## License

ISC
