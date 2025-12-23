import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (userEmail, userName, resetToken) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 EMAIL SERVICE CALLED (Nodemailer)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check credentials
    console.log('🔍 Checking email credentials...');
    console.log('Email User:', process.env.EMAIL_USER ? '✅ Found' : '❌ Missing');
    console.log('Email Pass:', process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured in .env file');
      return { 
        success: false, 
        error: 'Email credentials missing. Please add EMAIL_USER and EMAIL_PASS to .env file' 
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log('📝 Email Details:');
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
    const info = await transporter.sendMail({
      from: `"MedTalks Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to MedTalks - Set Your Password',
      html: emailHTML,
      text: `Hello ${userName},\n\nWelcome to Medtalks By Dr. Anita family! We're excited to have you on board.\n\nYour account has been successfully created, and you're now ready to explore all the great features we offer. You need to reset your password to login and access your profile. Click the link below to reset your password.\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nMedTalks Team`
    });

    console.log('✅ Email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ EMAIL SENDING FAILED');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, error: error.message };
  }
};