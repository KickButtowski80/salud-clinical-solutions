import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Allowed domains for CORS
const allowedDomains = [
  'http://localhost:1234',
  'http://localhost:3000',
  'https://saludclinical.com',
  'https://www.saludclinical.com'
];

export default async function handler(req, res) {
  // Set CORS headers based on origin
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedDomains[0]); // Default to localhost
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
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
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Test connection
    await transporter.verify();
    console.log('✅ Mailtrap SMTP connection verified');

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

    // Create email options
    const mailOptions = {
      from: 'salud-test@mailtrap.io',
      to: process.env.RECIPIENT_EMAIL,
      subject: `🏥 New Application: ${name} - ${role}`,
      text: `
New Application Received:

Name: ${name}
Email: ${email}
Phone: ${phone}
Role: ${role}
License Type: ${licenseType || 'Secret Agent License 🎫'}
License State: ${licenseState || 'State of Confusion 🤔'}
License Number: ${licenseNumber || '123-ABRACADABRA 🪄'}
Placement Type: ${placementType || 'Wherever the wind takes me 🌬️'}
Start Date: ${startDate || 'When the stars align ⭐'}
Notes: ${notes || 'No notes - just pure talent! ✨'}

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
    
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Role:</strong> ${role}</p>
    
    <h3>📋 Licensing Information</h3>
    <p><strong>License Type:</strong> ${licenseType || 'Secret Agent License 🎫'}</p>
    <p><strong>License State:</strong> ${licenseState || 'State of Confusion 🤔'}</p>
    <p><strong>License Number:</strong> ${licenseNumber || '123-ABRACADABRA 🪄'}</p>
    
    <h3>🎯 Preferences</h3>
    <p><strong>Placement Type:</strong> ${placementType || 'Wherever the wind takes me 🌬️'}</p>
    <p><strong>Preferred Start Date:</strong> ${startDate || 'When the stars align ⭐'}</p>
    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : '<p><strong>Notes:</strong> No notes - just pure talent! ✨</p>'}
  </div>
  
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Sent from Salud Clinical Solutions Website</p>
  </div>
</div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

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