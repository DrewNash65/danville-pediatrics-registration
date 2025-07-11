import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL TEST STARTED ===');

    // Check environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'admin@1to1pediatrics.com').trim();
    const practiceEmail = (process.env.PRACTICE_EMAIL || '').trim();

    console.log('Environment check:');
    console.log('- RESEND_API_KEY exists:', !!resendApiKey);
    console.log('- RESEND_API_KEY starts with re_:', resendApiKey?.startsWith('re_'));
    console.log('- RESEND_FROM_EMAIL:', fromEmail);
    console.log('- PRACTICE_EMAIL:', practiceEmail);

    if (!resendApiKey) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not configured',
        details: 'Missing API key in environment variables',
        instructions: 'Please set RESEND_API_KEY in your .env.local file with your actual API key from https://resend.com/api-keys'
      }, { status: 500 });
    }

    if (!resendApiKey.startsWith('re_')) {
      return NextResponse.json({
        error: 'Invalid RESEND_API_KEY format',
        details: 'API key should start with re_',
        currentKey: resendApiKey === 'your-resend-api-key-here' ? 'PLACEHOLDER_VALUE' : 'INVALID_FORMAT',
        instructions: 'Please replace with your actual API key from https://resend.com/api-keys'
      }, { status: 500 });
    }

    // Extract domain from FROM email for verification check
    const fromDomain = fromEmail.split('@')[1];
    console.log('- FROM domain:', fromDomain);
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized');
    
    // Send test email
    console.log('Attempting to send test email...');
    const result = await resend.emails.send({
      from: fromEmail, // Force use of working email
      to: 'drew@1to1pediatrics.com'.trim(), // Test email - send to your verified address
      subject: 'Test Email - Danville Pediatrics Registration System',
      html: `
        <h2>🧪 Email Test Successful!</h2>
        <p>This is a test email from your Danville Pediatrics patient registration system.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <p><strong>From Domain:</strong> ${fromDomain}</p>
        <p><strong>To:</strong> ${practiceEmail}</p>
        <p><strong>API Key:</strong> ${resendApiKey.substring(0, 8)}...</p>
        <hr>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p><strong>Domain Status:</strong> ✅ Verified and working</p>
      `
    });
    
    console.log('Email send result:', result);
    
    if (result.error) {
      console.error('Resend API error:', result.error);
      return NextResponse.json({ 
        error: 'Email send failed',
        details: result.error
      }, { status: 500 });
    }
    
    console.log('=== EMAIL TEST COMPLETED SUCCESSFULLY ===');
    
    return NextResponse.json({ 
      success: true,
      message: 'Test email sent successfully',
      emailId: result.data?.id,
      from: fromEmail,
      to: practiceEmail
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
