require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Body parsing
app.use(express.json());

// Middleware: CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://wbic.nl',
      /^http:\/\/localhost(:\d+)?$/
    ];

    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware: Rate limiting (5 requests per 10 minutes per IP)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

app.use('/api/', limiter);

// Joi validation schema
const contactSchema = Joi.object({
  naam: Joi.string().max(100).required(),
  onderwerp: Joi.string().max(200).required(),
  bericht: Joi.string().max(5000).required(),
  captchaToken: Joi.string().required()
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      const details = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    const { naam, onderwerp, bericht, captchaToken } = value;

    // Verify Turnstile CAPTCHA
    try {
      const captchaResponse = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
          response: captchaToken
        }
      );

      if (!captchaResponse.data.success) {
        return res.status(403).json({
          success: false,
          error: 'CAPTCHA verification failed'
        });
      }
    } catch (captchaError) {
      console.error('CAPTCHA verification error:', captchaError.message);
      return res.status(403).json({
        success: false,
        error: 'CAPTCHA verification failed'
      });
    }

    // Send email via Nodemailer
    try {
      const mailOptions = {
        from: 'info@wbic.nl',
        to: 'info@wbic.nl',
        subject: `Contact: ${onderwerp}`,
        text: `Naam: ${naam}\n\n${bericht}`
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'Email verzonden'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`WBIC Contact API listening on port ${PORT}`);
});
