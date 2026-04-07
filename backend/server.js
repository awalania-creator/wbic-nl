const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false
});

const schema = Joi.object({
  naam: Joi.string().max(100).required(),
  onderwerp: Joi.string().max(200).required(),
  bericht: Joi.string().max(5000).required(),
  captchaToken: Joi.string().required()
});

app.post('/api/contact', async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.message });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_FROM,
      subject: `Contact: ${value.onderwerp}`,
      text: `Naam: ${value.naam}\n\n${value.bericht}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email verzonden' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
