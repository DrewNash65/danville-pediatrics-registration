# Danville Pediatrics - Deployment Guide

## Vercel Deployment

### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code should be pushed to GitHub
3. **Resend Account**: For email functionality - [resend.com](https://resend.com)

### Environment Variables Required

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
ENCRYPTION_KEY=your-strong-encryption-key-here
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@danvillepediatrics.net
PRACTICE_EMAIL=Admin@DanvillePediatrics.com
NODE_ENV=production
```

### Deployment Steps

1. **Connect GitHub Repository**:
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import from GitHub: `danville-pediatrics-registration`

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Add all required environment variables
   - Make sure to use production values

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Post-Deployment

1. **Test Camera Functionality**:
   - Camera works better on HTTPS (Vercel provides this)
   - Test on mobile devices using the Vercel URL

2. **Configure Custom Domain** (Optional):
   - Add your domain in Vercel Dashboard
   - Update DNS settings as instructed

3. **Monitor Logs**:
   - Check Vercel Functions logs for any issues
   - Monitor form submissions

### Security Notes

- All data is encrypted before storage
- HTTPS is enforced by Vercel
- Environment variables are secure
- No sensitive data is logged

### Support

For deployment issues:
- Check Vercel build logs
- Verify environment variables
- Test locally first with `npm run build`
