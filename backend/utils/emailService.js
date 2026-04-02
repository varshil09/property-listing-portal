const nodemailer = require('nodemailer');

// Create transporter with proper configuration
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // For other SMTP services
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"PropertyPortal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Password reset email template
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px 10px 0 0;
          color: white;
        }
        .content {
          padding: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 PropertyPortal</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We received a request to reset your password for your PropertyPortal account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          <div class="warning">
            <strong>⚠️ Security Note:</strong>
            <ul style="margin: 10px 0 0 20px;">
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          <p>Best regards,<br><strong>PropertyPortal Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PropertyPortal. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Password Reset Request - PropertyPortal', html);
};

// Welcome email template
const sendWelcomeEmail = async (email, userName) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PropertyPortal</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px 10px 0 0;
          color: white;
        }
        .content {
          padding: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .feature-list {
          list-style: none;
          padding: 0;
        }
        .feature-list li {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Welcome to PropertyPortal!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Thank you for joining PropertyPortal! We're excited to have you on board.</p>
          <p>With PropertyPortal, you can:</p>
          <ul class="feature-list">
            <li>🏘️ <strong>Browse thousands of properties</strong> - Find your dream home</li>
            <li>❤️ <strong>Save your favorite listings</strong> - Never lose a property you love</li>
            <li>💬 <strong>Connect with property owners</strong> - Get answers to your questions</li>
            <li>📊 <strong>Track your inquiries</strong> - Stay updated on your property interests</li>
          </ul>
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Get Started</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br><strong>PropertyPortal Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 PropertyPortal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Welcome to PropertyPortal!', html);
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };