require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://wbic.nl',
      'https://wbic.aiwbic.cloud',
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

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});

app.use('/api/', limiter);

// Joi schema (incl. min lengths against trivial test submissions)
const contactSchema = Joi.object({
  naam: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  bedrijf: Joi.string().allow('').max(150).optional(),
  onderwerp: Joi.string().max(200).required(),
  bericht: Joi.string().min(20).max(5000).required(),
  website: Joi.string().allow('').max(300).optional(), // honeypot
  captchaToken: Joi.string().required()
});

// Trivial-text blocklist (case-insensitive). NOTE: 'test' & 'testing' are
// intentionally NOT in this list so the owner can submit own test messages.
const TRIVIAL_BLOCKLIST = [
  'hello world',
  'hi',
  'hallo',
  '123',
  'asdf',
  'qwerty',
  'lorem ipsum'
];

function isTrivialMessage(bericht) {
  const normalized = (bericht || '').trim().toLowerCase();
  if (!normalized) return true;
  for (const phrase of TRIVIAL_BLOCKLIST) {
    if (normalized === phrase || normalized.startsWith(phrase)) {
      return true;
    }
  }
  return false;
}

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', async (req, res) => {
  try {
    // Honeypot: if hidden 'website' field filled, silently 200 OK (drop bot).
    if (req.body && typeof req.body.website === 'string' && req.body.website.trim() !== '') {
      console.log('Honeypot triggered, silently dropping submission.');
      return res.status(200).json({ success: true, message: 'Email verzonden' });
    }

    const { error, value } = contactSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Bericht lijkt te kort of is een testbericht. Voeg meer context toe.'
      });
    }

    const { naam, email, bedrijf, onderwerp, bericht, captchaToken } = value;

    if (isTrivialMessage(bericht)) {
      return res.status(400).json({
        success: false,
        error: 'Bericht lijkt te kort of is een testbericht. Voeg meer context toe.'
      });
    }

    try {
      const captchaResponse = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET || process.env.TURNSTILE_SECRET,
          response: captchaToken
        }
      );

      if (!captchaResponse.data.success) {
        return res.status(403).json({ success: false, error: 'CAPTCHA verification failed' });
      }
    } catch (captchaError) {
      console.error('CAPTCHA verification error:', captchaError.message);
      return res.status(403).json({ success: false, error: 'CAPTCHA verification failed' });
    }

    try {
      const mailOptions = {
        from: 'info@wbic.nl',
        to: 'info@wbic.nl',
        replyTo: email,
        subject: `Contact: ${onderwerp}`,
        text: `Naam: ${naam}\nE-mail: ${email}\nBedrijf: ${bedrijf || '-'}\n\n${bericht}`
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ success: true, message: 'Email verzonden' });
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  return res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WBIC Contact API listening on port ${PORT}`);
});
