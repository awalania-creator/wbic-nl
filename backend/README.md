# WBIC Contact API

Express.js API for the WBIC contact form with Cloudflare Turnstile CAPTCHA and email notifications.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

Required variables:
- `CLOUDFLARE_TURNSTILE_SECRET` - Your Cloudflare Turnstile secret key
- `PORT` - Server port (default: 3000)

### 3. Start the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "ok" }`

### Contact Form Submission
```
POST /api/contact
```

**Request Body:**
```json
{
  "naam": "John Doe",
  "onderwerp": "Inquiry",
  "bericht": "Hello, I have a question...",
  "captchaToken": "0.uuid..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verzonden"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "naam",
      "message": "\"naam\" is required"
    }
  ]
}
```

**CAPTCHA Failed (403):**
```json
{
  "success": false,
  "error": "CAPTCHA verification failed"
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Features

- Express.js REST API on port 3000
- CORS configured for `https://wbic.nl` and `http://localhost:*`
- Rate limiting: 5 requests per 10 minutes per IP address
- Input validation using Joi schema
- Cloudflare Turnstile CAPTCHA verification
- Email sending via Nodemailer (SMTP)
- Proper error handling and status codes
- Docker support with health checks

## Validation Rules

- **naam**: Required, max 100 characters
- **onderwerp**: Required, max 200 characters
- **bericht**: Required, max 5000 characters
- **captchaToken**: Required, non-empty string

## Email Configuration

The API sends emails via SMTP:
- **Host**: localhost
- **Port**: 25 (Postfix)
- **From**: info@wbic.nl
- **To**: info@wbic.nl
- **Format**: Plain text with name and message

## Docker

Build and run with Docker:
```bash
docker build -t wbic-contact-api .
docker run -p 3000:3000 --env-file .env wbic-contact-api
```

## Requirements

- Node.js 18 or higher
- Postfix/SMTP server running on localhost:25
- Cloudflare Turnstile account with secret key

## Dependencies

- express: Web framework
- nodemailer: Email sending
- joi: Schema validation
- express-rate-limit: Rate limiting
- axios: HTTP client for CAPTCHA verification
- dotenv: Environment variable management
- cors: CORS middleware

## Security

- No sensitive data is logged
- CAPTCHA verification is server-side only
- Rate limiting prevents abuse
- CORS restricts requests to known origins
- Email errors don't expose server details
