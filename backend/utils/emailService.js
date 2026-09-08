const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.error('FATAL ERROR: RESEND_API_KEY is not defined in the environment variables.');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  const subject = 'Verify your ParthRahi account';
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2552cd; margin: 0; font-size: 24px; letter-spacing: 1px;">ParthRahi</h1>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Verify your email address</h2>
        <p style="color: #475569; margin-bottom: 25px;">Use the following 6-digit verification code to securely log in to your ParthRahi account.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 0 auto 25px auto; max-width: 250px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0;">Do not share this OTP with anyone.</p>
      </div>
      <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>If you did not request this code, you can safely ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} ParthRahi. All rights reserved.</p>
      </div>
    </div>
  `;

  const textContent = `
Verify your ParthRahi account

Your 6-digit verification code is: ${otp}

This code will expire in 10 minutes.
Do not share this OTP with anyone.

If you did not request this code, you can safely ignore this email.
© ${new Date().getFullYear()} ParthRahi. All rights reserved.
  `.trim();

  try {
    const data = await resend.emails.send({
      from: 'ParthRahi <noreply@parthrahi.com>',
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    return { success: false, error: 'Failed to send OTP email' };
  }
};

const sendPasswordResetOTPEmail = async (email, otp) => {
  const subject = 'Reset your ParthRahi password';
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2552cd; margin: 0; font-size: 24px; letter-spacing: 1px;">ParthRahi</h1>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Reset your password</h2>
        <p style="color: #475569; margin-bottom: 25px;">Use the following 6-digit verification code to reset your ParthRahi password.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 0 auto 25px auto; max-width: 250px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0;">Do not share this OTP with anyone.</p>
      </div>
      <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} ParthRahi. All rights reserved.</p>
      </div>
    </div>
  `;

  const textContent = `
Reset your ParthRahi password

Your 6-digit verification code is: ${otp}

This code will expire in 10 minutes.
Do not share this OTP with anyone.

If you did not request a password reset, you can safely ignore this email.
© ${new Date().getFullYear()} ParthRahi. All rights reserved.
  `.trim();

  try {
    const data = await resend.emails.send({
      from: 'ParthRahi <noreply@parthrahi.com>',
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending reset OTP email:', error.message);
    return { success: false, error: 'Failed to send OTP email' };
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};
