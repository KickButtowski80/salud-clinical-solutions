import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Allowed domains for CORS
const allowedDomains = [
  'http://localhost:1234',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://saludclinical.com',
  'https://www.saludclinical.com',
  'https://saludclinical.vercel.app',
  'https://www.saludclinical.vercel.app'
];

export default async function handler(req, res) {
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Environment check:', {
    SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
    SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Missing',
    SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
    SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing'
  });
  // Set CORS headers based on origin
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedDomains[0]); // Default to localhost
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Mailtrap SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Test connection
    await transporter.verify();

    // Get form data from request
    const {
      name,
      email,
      phone,
      role,
      licenseType,
      licenseState,
      licenseNumber,
      placementType,
      startDate,
      notes
    } = req.body;

    const trimString = (value) => {
      if (typeof value !== 'string') return '';
      return value.trim();
    };

    const enforceMaxLength = (value, max) => {
      if (typeof value !== 'string') return '';
      return value.length > max ? value.slice(0, max) : value;
    };

    const escapeHtml = (value) => {
      if (typeof value !== 'string') return '';
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const trimmedData = {
      name: trimString(name),
      email: trimString(email),
      phone: trimString(phone),
      role: trimString(role),
      licenseType: trimString(licenseType),
      licenseState: trimString(licenseState),
      licenseNumber: trimString(licenseNumber),
      placementType: trimString(placementType),
      startDate: trimString(startDate),
      notes: trimString(notes)
    };

    // Server-side validation (on trimmed values)
    const requiredFields = ['name', 'email', 'phone', 'role'];
    const missingFields = requiredFields.filter((field) => !trimmedData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    const maxLengths = {
      name: 120,
      email: 254,
      phone: 40,
      licenseNumber: 50,
      notes: 500
    };

    const tooLongFields = Object.entries(maxLengths)
      .filter(([key, max]) => trimmedData[key] && trimmedData[key].length > max)
      .map(([key]) => key);

    if (tooLongFields.length > 0) {
      return res.status(400).json({
        error: 'One or more fields are too long',
        tooLongFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate phone format (basic check)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(trimmedData.phone) || trimmedData.phone.length < 10) {
      return res.status(400).json({
        error: 'Invalid phone format'
      });
    }

    const sanitizedData = {
      name: escapeHtml(trimmedData.name),
      email: escapeHtml(trimmedData.email),
      phone: escapeHtml(trimmedData.phone),
      role: escapeHtml(trimmedData.role),
      licenseType: escapeHtml(trimmedData.licenseType),
      licenseState: escapeHtml(trimmedData.licenseState),
      licenseNumber: escapeHtml(trimmedData.licenseNumber),
      placementType: escapeHtml(trimmedData.placementType),
      startDate: escapeHtml(trimmedData.startDate),
      notes: escapeHtml(trimmedData.notes)
    };

    // Create email options
    const mailOptions = {
      from: '"Salud Clinical Solutions" <info@saludclinical.com>',
      to: 'info@saludclinical.com',
      replyTo: sanitizedData.email, // Let you reply directly to applicant
      subject: `🏥 New Application: ${sanitizedData.name} - ${sanitizedData.role}`,
      text: `
              New Application Received:

              Name: ${sanitizedData.name}
              Email: ${sanitizedData.email}
              Phone: ${sanitizedData.phone}
              Role: ${sanitizedData.role}
              License Type: ${sanitizedData.licenseType || 'Secret Agent License 🎫'}
              License State: ${sanitizedData.licenseState || 'State of Confusion 🤔'}
              License Number: ${sanitizedData.licenseNumber || '123-ABRACADABRA 🪄'}
              Placement Type: ${sanitizedData.placementType || 'Wherever the wind takes me 🌬️'}
              Start Date: ${sanitizedData.startDate || 'When the stars align ⭐'}
              Notes: ${sanitizedData.notes || 'No notes - just pure talent! ✨'}

              ---
              Sent from Salud Clinical Solutions Website
                    `,
                    html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
                  <h1>🏥 New Application Received</h1>
                  <p>Salud Clinical Solutions</p>
                </div>
                
                <div style="padding: 20px; background: #f9fafb;">
                  <h2>Applicant Information</h2>
                  
                  <p><strong>Name:</strong> ${sanitizedData.name}</p>
                  <p><strong>Email:</strong> ${sanitizedData.email}</p>
                  <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
                  <p><strong>Role:</strong> ${sanitizedData.role}</p>
                  
                  <h3>📋 Licensing Information</h3>
                  <p><strong>License Type:</strong> ${sanitizedData.licenseType || 'Secret Agent License 🎫'}</p>
                  <p><strong>License State:</strong> ${sanitizedData.licenseState || 'State of Confusion 🤔'}</p>
                  <p><strong>License Number:</strong> ${sanitizedData.licenseNumber || '123-ABRACADABRA 🪄'}</p>
                  
                  <h3>🎯 Preferences</h3>
                  <p><strong>Placement Type:</strong> ${sanitizedData.placementType || 'Wherever the wind takes me 🌬️'}</p>
                  <p><strong>Preferred Start Date:</strong> ${sanitizedData.startDate || 'When the stars align ⭐'}</p>
                  ${sanitizedData.notes ? `<p><strong>Notes:</strong> ${sanitizedData.notes}</p>` : '<p><strong>Notes:</strong> No notes - just pure talent! ✨</p>'}
                </div>
                
                <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                  <p>Sent from Salud Clinical Solutions Website</p>
                </div>
              </div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};