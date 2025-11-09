import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    // Debug: Environment variables kontrol
    console.log('DEBUG - ZOHO_EMAIL:', process.env.ZOHO_EMAIL);
    console.log('DEBUG - ZOHO_PASSWORD:', process.env.ZOHO_PASSWORD ? '***' + process.env.ZOHO_PASSWORD.slice(-4) : 'MISSING');
    console.log('DEBUG - ZOHO_SMTP_HOST:', process.env.ZOHO_SMTP_HOST);
    console.log('DEBUG - ZOHO_SMTP_PORT:', process.env.ZOHO_SMTP_PORT);

    // Zoho Mail SMTP yapılandırması
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.ZOHO_SMTP_PORT || '587'),
      secure: false, // TLS kullanıyoruz (587 portu için false)
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    });

    // Mail gönder
    const info = await transporter.sendMail({
      from: `"Viona Shop" <${process.env.ZOHO_EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
    });

    console.log('Email sent:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email error:', error);
    
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
