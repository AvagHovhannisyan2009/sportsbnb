# 🚀 Complete Deployment Guide - Sportsbnb

**Status**: Ready for Full Deployment  
**Date**: January 27, 2026  
**Domain**: https://sportsbnb.org  
**Supabase Project**: aeyqnrwmqmvsfendqypd  

---

## ✅ What's Already Done

- ✅ All Lovable dependencies removed
- ✅ Domain updated to sportsbnb.org
- ✅ Supabase fully configured
- ✅ 26 database migrations ready
- ✅ 16 Edge Functions defined
- ✅ All API keys received and ready to deploy

---

## 🎯 Three Simple Commands To Deploy

### Command 1: Verify Everything Works

```bash
chmod +x verify.sh
./verify.sh
```

This will:
- ✓ Check project structure
- ✓ Verify dependencies
- ✓ Test TypeScript compilation
- ✓ Count functions and migrations
- ✓ Report any issues

**Expected output**: "All tests passed! Your app is ready to deploy."

---

### Command 2: Deploy to Supabase

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
- ✓ Install Supabase CLI
- ✓ Authenticate you with Supabase
- ✓ Add all 5 API secrets:
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - RESEND_API_KEY
  - GOOGLE_OAUTH_CLIENT_ID
  - GOOGLE_OAUTH_CLIENT_SECRET
- ✓ Deploy all 16 Edge Functions
- ✓ Build production frontend

**What happens**: Browser opens for you to authenticate, then everything deploys automatically.

**Time**: ~5-10 minutes

---

### Command 3: Deploy to Vercel

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

This will:
- ✓ Install Vercel CLI
- ✓ Authenticate with Vercel
- ✓ Deploy your frontend
- ✓ Configure environment variables
- ✓ Enable auto-deployments from Git

**What happens**: Browser opens for authentication, then deployment begins.

**Time**: ~3-5 minutes

---

## 📋 Full Step-by-Step Process

### **Phase 1: Pre-Deployment Check** (5 minutes)

```bash
# Navigate to project
cd /workspaces/sportsbnb

# Install dependencies
npm install

# Verify everything
chmod +x verify.sh
./verify.sh
```

✅ **Expected Result**: All tests pass

---

### **Phase 2: Configure Supabase & Deploy Functions** (10 minutes)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh

# What will happen:
# 1. Browser opens for Supabase authentication
# 2. You authenticate with your account
# 3. Project is linked: aeyqnrwmqmvsfendqypd
# 4. All 5 secrets are added automatically
# 5. All 16 Edge Functions are deployed
# 6. Build finishes and shows success message
```

✅ **Expected Result**: 
- 5 secrets configured
- 16 functions deployed
- Production build created

✅ **Verify in Supabase Dashboard**:
1. Go to https://app.supabase.com
2. Select project: aeyqnrwmqmvsfendqypd
3. Go to **Edge Functions**
4. Should see all 16 functions listed

---

### **Phase 3: Deploy Frontend to Vercel** (5 minutes)

```bash
# Make script executable
chmod +x deploy-vercel.sh

# Run Vercel deployment
./deploy-vercel.sh

# What will happen:
# 1. Browser opens for Vercel authentication
# 2. You authenticate with your account
# 3. Project is created/updated
# 4. Environment variables are set
# 5. Build and deployment happens
# 6. You get a deployment URL
```

✅ **Expected Result**:
- Vercel deployment URL (e.g., https://sportsbnb-xxxxx.vercel.app)
- Auto-deployments enabled on main branch
- Environment variables configured

✅ **Verify in Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Click on "sportsbnb" project
3. Should see "✓ Production Deployment"

---

### **Phase 4: Connect Custom Domain** (10 minutes)

**In Vercel Dashboard**:

1. Go to https://vercel.com/dashboard
2. Click **sportsbnb** project
3. Click **Settings**
4. Click **Domains** in left sidebar
5. Enter: `sportsbnb.org`
6. Click **Add**
7. Vercel shows DNS configuration:
   - CNAME: `cname.vercel-dns.com`

**At Your Domain Registrar** (GoDaddy, Namecheap, etc.):

1. Go to DNS/Domain Settings
2. Find CNAME records
3. Add CNAME:
   - Name: `www` or subdomain
   - Points to: `cname.vercel-dns.com`
4. Save

**Wait for DNS Propagation**:
- Usually 5-30 minutes
- Check: https://dnschecker.org/?query=sportsbnb.org

✅ **Verify**: Visit https://sportsbnb.org - should load your app

---

### **Phase 5: Test Signup/Login Flow** (10 minutes)

#### **Test 1: Local Testing** (before live)

```bash
# Start development server
npm run dev

# Open http://localhost:8080
```

1. Click **Sign Up**
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click **Sign Up**
4. Should redirect to onboarding

✅ **Verify in Supabase**:
```
1. Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
2. Click **Authentication**
3. Click **Users**
4. Should see test@example.com with created timestamp
```

---

#### **Test 2: Production Testing** (after Vercel deployment)

1. Visit https://sportsbnb.org (or your Vercel URL)
2. Sign Up with:
   - Email: `live-test@example.com`
   - Password: `Test123!@#`
3. Should complete signup
4. Log out
5. Log in with same credentials
6. Should log in successfully

✅ **Verify in Supabase**:
1. https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
2. **Authentication** → **Users**
3. Should see both test accounts with proper timestamps

---

### **Phase 6: Verify Database** (5 minutes)

**Check Tables**:

Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd

Click **Table Editor** in left sidebar:

```
Expected to see:
✓ profiles         - User profile data
✓ bookings         - Booking records
✓ venues           - Sports venues
✓ games            - Game/event listings
✓ chats            - Messages
✓ reviews          - User reviews
✓ payments         - Payment records
✓ notifications    - System notifications
✓ photos           - Image storage
+ 5 more tables
```

**Run SQL Queries**:

Click **SQL Editor** and run:

```sql
-- Check total users created
SELECT COUNT(*) as total_users FROM auth.users;

-- Check if any bookings exist
SELECT COUNT(*) as total_bookings FROM public.bookings;

-- Check venues
SELECT COUNT(*) as total_venues FROM public.venues;
```

**Check Real-time Status**:

Click **Replication** in sidebar:
- ✓ Should show "Realtime enabled"
- ✓ All tables should have green checkmarks

**Check Edge Functions Logs**:

Click **Edge Functions** in sidebar:
1. Click each function to see:
   - Deployment status
   - Last execution time
   - Any errors

---

## 🔐 API Keys Status

All 5 API keys have been provided and will be added to Supabase:

| API | Status | Used For |
|-----|--------|----------|
| STRIPE_SECRET_KEY | ✅ Provided | Payment processing |
| STRIPE_WEBHOOK_SECRET | ✅ Provided | Webhook verification |
| RESEND_API_KEY | ✅ Provided | Email notifications |
| GOOGLE_OAUTH_CLIENT_ID | ✅ Provided | Calendar integration |
| GOOGLE_OAUTH_CLIENT_SECRET | ✅ Provided | Calendar authentication |

**Secure Handling**:
- ✓ Keys never stored in Git
- ✓ Only stored in Supabase Secrets
- ✓ Accessible only to Edge Functions
- ✓ Encrypted at rest

---

## 🐛 Troubleshooting

### Verify Script Fails

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try verify again
./verify.sh
```

### Deploy Script Fails to Authenticate

```bash
# Clear cached credentials
supabase logout
supabase login
```

### Vercel Deployment Fails

```bash
# Clear Vercel cache
rm -rf .vercel

# Try deployment again
./deploy-vercel.sh
```

### Custom Domain Not Resolving

1. Wait 30-60 minutes for DNS propagation
2. Check DNS with: https://dnschecker.org
3. Verify CNAME record is correct in registrar
4. Restart browser cache

### Login Fails in Production

```sql
-- Check in Supabase SQL Editor
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.profiles;

-- Make sure RLS is working (you should only see your own data)
SELECT * FROM public.profiles LIMIT 1;
```

---

## ✅ Final Verification Checklist

Before considering deployment complete, verify:

- [ ] `./verify.sh` passes all tests
- [ ] `./deploy.sh` completes successfully
- [ ] `./deploy-vercel.sh` completes successfully
- [ ] https://sportsbnb.org loads in browser
- [ ] Signup works with new test account
- [ ] Login works with test account
- [ ] Supabase shows new user in Auth → Users
- [ ] Edge Functions show in Supabase dashboard
- [ ] All 5 secrets visible in Supabase Secrets
- [ ] Database tables show correct data
- [ ] No errors in browser console
- [ ] No errors in Supabase function logs

---

## 📞 Getting Help

**Supabase Issues**: https://supabase.com/docs  
**Vercel Issues**: https://vercel.com/docs  
**Vite Issues**: https://vitejs.dev  

**Your Dashboard URLs**:
- Supabase: https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
- Vercel: https://vercel.com/dashboard
- Your App: https://sportsbnb.org

---

## 🎉 Success!

Once you've completed all 6 phases, your app will be:
- ✅ Fully deployed to production
- ✅ Connected to sportsbnb.org domain
- ✅ Using Supabase for database & auth
- ✅ Running 16 serverless functions
- ✅ Ready for users to sign up and book venues

**Celebrate! You've successfully migrated from Lovable Cloud to a fully independent, scalable Supabase infrastructure!** 🚀
