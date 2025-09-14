import { sendWelcomeEmail } from './email-service.js';

console.log('Testing email functionality...');

try {
  const result = await sendWelcomeEmail('sam.huang@gaib.ai', 'Sam');
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ Failed to send email:', result.error);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}