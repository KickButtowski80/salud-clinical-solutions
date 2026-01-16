# 📧 Email Setup Guide for Salud Clinical Solutions

## 🎯 Architecture Overview

```
User fills form → /api/send-email → Nodemailer → Mailtrap → info@saludclinical.com → forwarded to pazpaz25@gmail.com
```

## 📋 Setup Checklist

### ✅ 1. Squarespace Email Forwarding
1. Go to: https://account.squarespace.com/domains
2. Click on `saludclinical.com`
3. Click **Email** → Scroll to **Email Forwarding**
4. Click **Add rule**
5. Enter:
   - **Forward from**: `info`
   - **Forward to**: `pazpaz25@gmail.com`
6. Click **Save**
7. Check Gmail for verification email (24-48 hours to activate)

### ✅ 2. Environment Variables (`.env.local`)
```env
# Mailtrap SMTP Settings
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password

# Optional: If you want direct sending (bypass Mailtrap)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-app-password
```

### ✅ 3. Mailtrap DNS Records (Already Done)
```
TXT: v=spf1 include:spf.mx.mailtrap.io ~all
TXT: mailgun-domain: xxx
MX: mxa.mailgun.org
MX: mxb.mailgun.org
```

### ✅ 4. Optional: Mailtrap Webhook
1. In Mailtrap dashboard, go to **Settings** → **Webhooks**
2. Create webhook pointing to: `https://your-domain.vercel.app/api/mailtrap-events`
3. Select events: `delivered`, `opened`, `clicked`, `bounced`

## 🧪 Testing

### Local Testing
```bash
# Install dependencies
pnpm install

# Test email endpoint
pnpm test-email
```

### Production Testing
1. Deploy to Vercel
2. Fill out the form on your website
3. Check `pazpaz25@gmail.com` for forwarded email

## 📊 Email Flow

1. **User submits form** → `/api/send-email`
2. **Nodemailer sends** via Mailtrap SMTP
3. **Mailtrap delivers** to `info@saludclinical.com`
4. **Squarespace forwards** to `pazpaz25@gmail.com`
5. **You receive** professional email with all applicant data

## 🔧 Troubleshooting

### Email Not Arriving?
- Check Squarespace email forwarding status (24-48 hours)
- Verify Mailtrap SMTP credentials
- Check Gmail spam folder

### Form Not Submitting?
- Check browser console for errors
- Verify CORS settings in `send-email.js`
- Ensure all required fields are filled

### Webhook Not Working?
- Verify webhook URL is accessible
- Check Vercel function logs
- Ensure webhook is enabled in Mailtrap

## 📈 Next Steps

### Optional Enhancements
1. **Email Tracking**: Use `/api/mailtrap-events` webhook
2. **Auto-Reply**: Add confirmation email to applicant
3. **Database**: Store submissions in database
4. **SMS Alerts**: Add SMS notifications for urgent applications

### Professional Email Upgrade
When ready for dedicated inbox:
- **Zoho Mail**: FREE (up to 5 users)
- **Google Workspace**: $6/month
- **Microsoft 365**: $6/month

## 🎉 Success Metrics

✅ Professional domain email (`info@saludclinical.com`)
✅ Reliable delivery via Mailtrap
✅ Convenient Gmail forwarding
✅ Production-ready validation
✅ Beautiful HTML email templates
✅ Optional tracking and analytics
