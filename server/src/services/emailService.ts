import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  try {
    const data = await resend.emails.send({
      from: 'TradeBridge <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your TradeBridge account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to TradeBridge, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <p><a href="${verificationUrl}" class="button">Verify Email</a></p>
            <p>Or copy and paste this link: ${verificationUrl}</p>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: 'TradeBridge <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to TradeBridge!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to TradeBridge, ${name}!</h2>
            <p>Your account has been verified successfully.</p>
            <p>Start exploring business opportunities and connecting with trade partners around the world.</p>
            <p>Best regards,<br>The TradeBridge Team</p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}
