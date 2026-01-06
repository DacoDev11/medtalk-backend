import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (userEmail, userName, resetToken) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 EMAIL SERVICE CALLED (Nodemailer)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Sending to:', userEmail);
  console.log('User name:', userName);
  console.log('Reset token:', resetToken ? 'Present' : 'Missing');
  
  try {
    // Check credentials
    console.log('🔍 Checking email credentials...');
    console.log('SMTP Host:', process.env.SMTP_HOST ? '✅ Found' : '❌ Missing');
    console.log('SMTP Port:', process.env.SMTP_PORT ? '✅ Found' : '❌ Missing');
    console.log('Email User:', process.env.EMAIL_USER ? '✅ Found' : '❌ Missing');
    console.log('Email Pass:', process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing');
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured in .env file');
      return { 
        success: false, 
        error: 'Email credentials missing. Please add SMTP_HOST, SMTP_PORT, EMAIL_USER and EMAIL_PASS to .env file' 
      };
    }

    console.log('🔧 Creating transporter...');
    console.log('Using host:', process.env.SMTP_HOST);
    console.log('Using port:', process.env.SMTP_PORT);

    // Create transporter with custom SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    // Verify connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log('📝 Email Details:');
    console.log('   From:', process.env.EMAIL_USER);
    console.log('   To:', userEmail);
    console.log('   Name:', userName);
    console.log('   Reset Link:', resetLink);

    // Email HTML template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #667eea;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MedTalks!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>Welcome to <strong>Medtalks By Dr. Anita family</strong>! We're excited to have you on board.</p>
            
            <p>Your account has been successfully created, and you're now ready to explore all the great features we offer. You need to reset your password to login and access your profile. Click the link below to reset your password.</p>
            
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            
            <p><strong>Note:</strong> This link will expire in 1 hour.</p>
            
            <p>If you have any questions or need help getting started, our support team is just an email away.</p>
            
            <p>Best regards,<br>
            <strong>MedTalks Team</strong></p>
          </div>
          <div class="footer">
            <p>If you didn't request this email, please ignore it.</p>
            <p>© ${new Date().getFullYear()} MedTalks. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    console.log('📮 Attempting to send email...');
    const info = await transporter.sendMail({
      from: `"MedTalks Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to MedTalks - Set Your Password',
      html: emailHTML,
      text: `Hello ${userName},\n\nWelcome to Medtalks By Dr. Anita family! We're excited to have you on board.\n\nYour account has been successfully created, and you're now ready to explore all the great features we offer. You need to reset your password to login and access your profile. Click the link below to reset your password.\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nMedTalks Team`
    });

    console.log('✅ Email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('✅ Response:', info.response);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ EMAIL SENDING FAILED');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Full error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, error: error.message };
  }
};