const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Define all the allowed frontend domains
const allowedOrigins = [
  'http://localhost:3000', // Local development (Create React App)
  'http://localhost:5173', // Local development (Vite default)
  
  // *** CRITICAL FIX FOR NETLIFY CORS ERROR ***
  // Add the live, deployed Netlify URL
  'https://faceoffportfolio.netlify.app', 
  
  // The Vercel URL you had previously included
  'https://face-off-portfolio-or92szlf0-kimanis-projects-76482545.vercel.app',
];

// Apply CORS middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

console.log('Environment variables:', {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '****' : 'Not set',
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP connection successful:', success);
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  console.log('Received request:', req.body);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const mailOptions = {
    from: `"Face Off Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: 'New Contact Form Submission',
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
