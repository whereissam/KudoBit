import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_EccjAzDt_57UHCpYrN3kh6dywTgSx5nii');

export const sendDigitalProduct = async (toEmail, productName, downloadLink, customerName = 'Customer') => {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: `Your Digital Product: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Hi ${customerName},</p>
          <p>Thanks for purchasing <strong>${productName}</strong> from KudoBit!</p>
          <p>You can download your digital product using the link below:</p>
          <a href="${downloadLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Download Now</a>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The KudoBit Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">This email was sent from KudoBit - The Web3 Gumroad</p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (toEmail, customerName = 'Customer') => {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Welcome to KudoBit!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to KudoBit!</h2>
          <p>Hi ${customerName},</p>
          <p><strong>Congrats on joining KudoBit</strong> - The Web3 Gumroad!</p>
          <p>Digital value, instantly rewarded. Empowering creators with ultra-low-cost sales and verifiable loyalty on Morph.</p>
          <p>Start exploring our marketplace and discover amazing digital products from creators around the world.</p>
          <p>Best regards,<br>The KudoBit Team</p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};