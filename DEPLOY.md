# AlgoVision - Vercel Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account with your code pushed
2. Vercel account (free at vercel.com)
3. Web3Forms access key (free at web3forms.com)

---

## Step 1: Get Web3Forms Access Key (1 minute)

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email (where you want to receive feedback)
3. Copy your access key

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `algo-vision` repository
4. Vercel auto-detects Vite - settings are pre-configured
5. Add Environment Variable:
   - Name: `VITE_WEB3FORMS_KEY`
   - Value: `your_access_key_from_step_1`
6. Click **Deploy**

### Option B: Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Build Settings (Auto-detected)

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## After Deployment

Your app will be live at: `https://your-project.vercel.app`

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS as instructed

---

## ✅ Production Checklist

- [x] No backend required (100% frontend)
- [x] Web3Forms for feedback (free, unlimited)
- [x] Error boundaries for crash protection
- [x] Input validation & XSS prevention
- [x] Dark mode support
- [x] Mobile responsive
- [x] SEO meta tags

---

## Free Tier Limits (Vercel Hobby)

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Build Minutes | 100 hours/month |
| Deployments | Unlimited |
| Custom Domains | 50 per project |

**More than enough for production!**
