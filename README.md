# HIPAA-Compliant Patient Registration App

A secure, HIPAA-compliant online patient registration form for **Danville Pediatrics** (1-to-1 Pediatrics). This application allows patients and parents to complete registration paperwork online, with secure submission via encrypted email and PDF generation.

## Features

- ✅ **HIPAA Compliant** - Secure data handling, encryption, and audit logging
- 📋 **Multi-step Form** - User-friendly registration process with progress tracking
- 👨‍👩‍👧‍👦 **Pediatric Focus** - Designed for minors with parent/guardian information
- 🏥 **Insurance Management** - Primary and secondary insurance with card photo upload
- 📷 **Camera Integration** - Mobile camera capture for insurance cards
- 📧 **Secure Email** - Resend integration for reliable email delivery
- 📱 **Mobile Responsive** - Works on all devices with native camera support
- 🔒 **Data Encryption** - All sensitive data is encrypted at rest and in transit
- 📊 **Audit Logging** - Complete audit trail for compliance

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Validation**: Zod schema validation
- **Forms**: React Hook Form
- **PDF Generation**: jsPDF
- **Email**: Resend API
- **Encryption**: CryptoJS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Resend account and API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hipaa-form-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   ENCRYPTION_KEY=your-strong-encryption-key-here
   RESEND_API_KEY=your-resend-api-key-here
   RESEND_FROM_EMAIL=noreply@danvillepediatrics.net
   PRACTICE_EMAIL=Admin@1to1Pediatrics.com
   ```

4. **Generate encryption key**
   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Email Setup with Resend

**🚨 IMPORTANT: Email delivery requires Resend API setup**

1. **Create a Resend account** at [resend.com](https://resend.com) (free tier available)
2. **Get your API key** from the Resend dashboard
3. **Update `.env.local`**:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@danvillepediatrics.net
   PRACTICE_EMAIL=Admin@1to1Pediatrics.com
   ```
4. **Restart your development server** after updating environment variables

**Without Resend setup**: Forms will submit successfully but emails won't be sent. You'll see a message to contact the practice directly.

### Security Configuration

- **Encryption Key**: Generate a strong 32-character key for data encryption
- **HTTPS**: Always use HTTPS in production (automatically handled by Vercel)
- **Environment Variables**: Never commit sensitive data to version control

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables from `.env.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## HIPAA Compliance Features

- **Data Encryption**: All sensitive data encrypted using AES
- **Secure Transmission**: HTTPS/TLS for all communications
- **Access Controls**: No unauthorized access to patient data
- **Audit Logging**: Complete audit trail of all submissions
- **Data Minimization**: Only collect necessary information
- **Secure Email**: Encrypted email delivery with secure attachments

## Form Sections

1. **Patient Information** - Demographics, contact info, address
2. **Parent/Guardian** - Primary and secondary parent/guardian details
3. **Insurance** - Primary and secondary insurance with card uploads
4. **Guarantor** - Financial responsibility information
5. **Emergency Contacts** - Emergency contact information
6. **Consent & Agreements** - Required HIPAA and treatment consents

## File Structure

```
src/
├── app/
│   ├── api/submit-registration/route.ts  # Form submission API
│   ├── layout.tsx                        # App layout
│   └── page.tsx                          # Main page
├── components/
│   ├── FormSections/                     # Individual form sections
│   ├── RegistrationForm.tsx              # Main form component
│   └── UI components                     # Reusable UI components
├── lib/
│   ├── validation.ts                     # Zod schemas
│   ├── encryption.ts                     # Security utilities
│   ├── pdf-generator.ts                  # PDF creation
│   └── email-sender.ts                   # Email utilities
└── types/
    └── registration.ts                   # TypeScript types
```

## Support

For technical support or questions about this application:

- **Practice**: Danville Pediatrics - (925) 362-1861
- **Website**: [www.danvillepediatrics.net](http://www.danvillepediatrics.net)

## License

This project is proprietary software developed for Danville Pediatrics.
