import { sendEmailWithClient, isProduction } from './src/lib/email';

async function testEmailClient() {
  console.log('🧪 Testing email client implementation...');
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Is Production: ${isProduction}`);
  
  try {
    const testPayload = {
      from: process.env.RESEND_SENDER_EMAIL || 'test@example.com',
      to: ['test@example.com'],
      subject: 'Test Email - Dual Client System',
      html: '<h1>Test Email</h1><p>This is a test of the dual email client system.</p>',
    };

    console.log('📤 Sending test email...');
    const result = await sendEmailWithClient(testPayload);
    console.log('✅ Email sent successfully:', result);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Run the test
testEmailClient();
