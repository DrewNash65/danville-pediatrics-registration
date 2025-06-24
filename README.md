# HIPAA-Compliant Patient Registration App

A secure, HIPAA-compliant online patient registration form for **Danville Pediatrics** (1-to-1 Pediatrics). This application allows patients and parents to complete registration paperwork online, with secure submission via encrypted email and PDF generation.

## Features

- ✅ **HIPAA Compliant** - Secure data handling, encryption, and audit logging
- 📋 **Multi-step Form** - User-friendly registration process with progress tracking
- 👨‍👩‍👧‍👦 **Pediatric Focus** - Designed for minors with parent/guardian information
- 🏥 **Insurance Management** - Primary and secondary insurance with card photo upload
- 📧 **Secure Email** - Encrypted email delivery with PDF attachments
- 📱 **Mobile Responsive** - Works on all devices
- 🔒 **Data Encryption** - All sensitive data is encrypted at rest and in transit
- 📊 **Audit Logging** - Complete audit trail for compliance

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Validation**: Zod schema validation
- **Forms**: React Hook Form
- **PDF Generation**: jsPDF
- **Email**: Nodemailer with SMTP
- **Encryption**: CryptoJS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SMTP email service (Gmail, SendGrid, etc.)

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
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   PRACTICE_EMAIL=office@danvillepediatrics.net
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

### Email Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

For other providers, update the SMTP settings accordingly.

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
