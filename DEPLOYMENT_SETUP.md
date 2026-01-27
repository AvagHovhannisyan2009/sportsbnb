# Deployment & Setup Complete Guide

**Updated**: January 27, 2026  
**Domain**: https://sportsbnb.org  
**Supabase Project**: aeyqnrwmqmvsfendqypd

---

## Step 1: Add Secrets to Supabase Dashboard ✅

Your Edge Functions need API keys for external services. Add them to Supabase:

### A. Go to Supabase Dashboard

1. Open https://app.supabase.com
2. Select project **aeyqnrwmqmvsfendqypd**
3. Click **Settings** (gear icon) in left sidebar
4. Click **Secrets** in the menu

### B. Add Required Secrets

Add each secret as a key-value pair:

#### **For Email Notifications** (if using Resend)
```
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxxxxxxxxxxxxx
```
Get key from: https://resend.com/api-keys

#### **For Stripe Payments** (if enabled)
```
Name: STRIPE_SECRET_KEY
Value: [Your Stripe secret key - obtain from dashboard]

Name: STRIPE_WEBHOOK_SECRET
Value: [Your Stripe webhook secret - obtain from dashboard]
```
Get keys from: https://dashboard.stripe.com/apikeys

#### **For Google Calendar Integration** (optional)
```
Name: GOOGLE_OAUTH_CLIENT_ID
Value: xxxxx.apps.googleusercontent.com

Name: GOOGLE_OAUTH_CLIENT_SECRET
Value: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

#### **For Make.com Webhooks** (optional)
```
Name: MAKE_WEBHOOK_TOKEN
Value: your_make_token_here
```

### C. After Adding Secrets

1. Click **Save**
2. Click **Deploy** next to each secret
3. Secrets are now available to Edge Functions as `Deno.env.get("SECRET_NAME")`

**Note**: Secrets don't auto-deploy. You need to redeploy Edge Functions after adding them.

---

## Step 2: Deploy Edge Functions ✅

Your 16 serverless functions are ready to deploy.

### A. Install Supabase CLI

```bash
# On macOS
brew install supabase/tap/supabase

# On Linux/WSL
curl -fsSL https://dl.supabase.com/cli/install.sh | sh

# On Windows (using npm)
npm install -g supabase
```

### B. Authenticate with Supabase

```bash
supabase login
# Opens browser to authenticate
# Paste access token when prompted
```

### C. Link to Your Project

```bash
cd /workspaces/sportsbnb
supabase link --project-ref aeyqnrwmqmvsfendqypd
```

### D. Deploy All Functions

```bash
supabase functions deploy
```

Expected output:
```
✓ Function "booking-notifications" deployed
✓ Function "calendar-auth" deployed
✓ Function "calendar-sync" deployed
✓ Function "check-connect-status" deployed
✓ Function "create-billing-portal" deployed
✓ Function "create-booking-checkout" deployed
✓ Function "create-connect-account" deployed
✓ Function "create-game-payment" deployed
✓ Function "get-billing-info" deployed
✓ Function "refund-booking" deployed
✓ Function "send-booking-confirmation" deployed
✓ Function "send-contact-email" deployed
✓ Function "verify-booking-payment" deployed
✓ Function "verify-game-payment" deployed
✓ Function "webhook-dispatcher" deployed
✓ Function "widget-data" deployed
```

### E. Verify Deployment

View functions in Supabase Dashboard:
1. Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd/functions
2. Each function shows:
   - Deployment status
   - Last deployed timestamp
   - Endpoint URL for calling it

---

## Step 3: Deploy Frontend to Vercel ✅

Vercel is the best hosting for Vite + React apps.

### A. Install Vercel CLI

```bash
npm install -g vercel
```

### B. Connect to GitHub

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select **AvagHovhannisyan2009/sportsbnb**
4. Click **Import**

### C. Configure Project

Vercel auto-detects Vite configuration. On the setup screen:

**Framework Preset**: Vite ✓ (auto-detected)  
**Build Command**: `npm run build` ✓ (auto-filled)  
**Output Directory**: `dist` ✓ (auto-filled)

### D. Environment Variables

Add to Vercel (Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://aeyqnrwmqmvsfendqypd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXFucndtcW12c2ZlbmRxeXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzQ5ODgsImV4cCI6MjA4MzkxMDk4OH0.kHuTrQ7771qRX5r4RdouM7Hk0QAU7Ny0eePsQ5fcqhU
VITE_SUPABASE_PROJECT_ID=aeyqnrwmqmvsfendqypd
```

### E. Deploy

1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Get URL: `https://sportsbnb-xxxxx.vercel.app`

### F. Connect Custom Domain

1. In Vercel dashboard, go to **Settings → Domains**
2. Add domain: `sportsbnb.org`
3. Follow DNS setup instructions (add CNAME record to your registrar)
4. Wait for DNS propagation (5-60 minutes)

**After DNS propagates:**
- https://sportsbnb.org loads your app ✓

### G. Enable Auto-Deploy

Every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Domain update to sportsbnb.org"
git push origin main
```

Vercel will automatically rebuild and deploy!

---

## Step 4: Deploy to Netlify (Alternative)

If you prefer Netlify instead of Vercel:

### A. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### B. Build Locally

```bash
npm run build
```

This creates `dist/` folder with production build.

### C. Deploy

```bash
netlify deploy --prod --dir=dist
```

Or use Netlify Dashboard:
1. Go to https://app.netlify.com
2. Click **Add new site → Import an existing project**
3. Connect GitHub repo
4. Build settings auto-fill
5. Deploy!

---

## Step 5: Test Signup/Login Flow ✅

Now test that everything works end-to-end.

### A. Run Locally First

```bash
npm install  # Install dependencies
npm run dev  # Start dev server
# Open http://localhost:8080
```

### B. Test Signup

1. Click **Sign Up**
2. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. Click **Sign Up**
4. Should redirect to onboarding/dashboard

### C. Check in Supabase

1. Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
2. Click **Authentication** in left sidebar
3. Click **Users** tab
4. You should see `test@example.com` in the list ✓

### D. Test Login

1. Log out
2. Click **Log In**
3. Enter email and password
4. Should log in successfully ✓

### E. Test on Production

After deploying to Vercel:

1. Go to https://sportsbnb.org
2. Repeat signup/login tests
3. Check Supabase Users table again - should show the new test user ✓

### F. Test Database Read/Write

1. Log in to your test account
2. Navigate to a page that creates data (e.g., add venue, create booking)
3. Go to Supabase Dashboard
4. Click **Editor** in left sidebar
5. Query the table:
   ```sql
   SELECT * FROM public.venues LIMIT 10;
   SELECT * FROM public.bookings LIMIT 10;
   ```
6. Should see your created data ✓

---

## Step 6: Verify Database in Supabase Dashboard ✅

### A. Check All Tables

1. Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
2. Click **Table Editor** in left sidebar
3. Expand tables and check data:

**Should see:**
- `profiles` - User accounts
- `bookings` - Booking records
- `venues` - Sports venue listings
- `games` - Game/event listings
- `chats` - Message threads
- `reviews` - User reviews
- `payments` - Payment records
- Plus: photos, amenities, availability, etc.

### B. Check Authentication

1. Click **Authentication** in sidebar
2. Click **Users** tab
3. Should show all signed-up users with:
   - Email
   - Sign-up date
   - Last login date

### C. Check Real-time Status

1. Click **Replication** in sidebar
2. All tables should show:
   - ✓ Realtime enabled
   - ✓ WAL (Write-Ahead Log) active
3. This powers live notifications, chats, etc.

### D. Run SQL Queries

1. Click **SQL Editor** in left sidebar
2. Run test queries:

```sql
-- Check user count
SELECT COUNT(*) as total_users FROM auth.users;

-- Check booking statistics
SELECT 
  COUNT(*) as total_bookings,
  AVG(total_price) as avg_price,
  MAX(created_at) as last_booking
FROM public.bookings;

-- Check venues
SELECT COUNT(*) as total_venues FROM public.venues;

-- Check if RLS policies work
SELECT * FROM public.profiles LIMIT 1;
-- Should only return your own profile (RLS in action!)
```

### E. Monitor Functions

1. Click **Edge Functions** in sidebar
2. Each function shows:
   - Last 24 hours invocations
   - Average execution time
   - Error count
3. Click a function to see detailed logs

### F. Check Webhooks (if configured)

1. Click **Database** → **Webhooks**
2. Should see configured webhooks for:
   - Booking creation events
   - Cancellation events
   - Connected to Make.com or other services

---

## Step 7: Configure Domains & SSL

### A. Add sportsbnb.org

**In Vercel:**
1. Settings → Domains
2. Add `sportsbnb.org`
3. Add DNS CNAME to your registrar pointing to `cname.vercel-dns.com`

**In Supabase:**
No domain configuration needed - API is always `aeyqnrwmqmvsfendqypd.supabase.co`

### B. SSL Certificate

- ✓ Vercel: Auto-generates free SSL via Let's Encrypt
- ✓ Supabase: Auto-configured with HTTPS
- ✓ Edge Functions: Auto-SSL via Supabase

No additional SSL setup needed!

---

## Step 8: Final Verification Checklist

Before considering deployment complete:

### Code
- [ ] `npm install` completes without errors
- [ ] `npm run build` produces `dist/` folder
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] `npm run lint` passes

### Local Testing
- [ ] `npm run dev` starts at http://localhost:8080
- [ ] Frontend loads without console errors
- [ ] Signup works (new user appears in Supabase)
- [ ] Login works (existing user can sign in)

### Supabase
- [ ] Auth users visible in dashboard
- [ ] Database tables populated with data
- [ ] Edge Functions deployed and active
- [ ] Secrets added and deployed
- [ ] Real-time enabled on tables
- [ ] RLS policies working (users see only their data)

### Production
- [ ] Vercel deployment successful
- [ ] https://sportsbnb.org loads
- [ ] Domain SSL certificate active (lock icon in browser)
- [ ] Signup/login works on production
- [ ] New users appear in Supabase

### API Integration
- [ ] Stripe webhook receiving events (if enabled)
- [ ] Email notifications sending (if enabled)
- [ ] Calendar sync working (if enabled)
- [ ] Make.com webhooks firing (if enabled)

---

## Troubleshooting

### Vercel Deployment Fails
```
Error: ENOENT no such file or directory dist/
```
**Solution**: 
```bash
npm run build  # Test locally first
git add -A && git commit -m "Build test" && git push
```

### Supabase Functions Not Working
```
Error: Function not found
```
**Solution**:
```bash
supabase functions deploy  # Re-deploy functions
supabase link --project-ref aeyqnrwmqmvsfendqypd  # Re-link project
```

### Environment Variables Not Loaded
```
Error: VITE_SUPABASE_URL is undefined
```
**Solution**:
- [ ] Check `.env` file has correct values
- [ ] In Vercel settings, environment variables added?
- [ ] Rebuild: `npm run build` locally
- [ ] Redeploy to Vercel

### Domain Not Resolving
```
Error: DNS_PROBE_FINISHED_NXDOMAIN
```
**Solution**:
- [ ] Check DNS CNAME record is set at registrar
- [ ] Wait for DNS propagation (up to 1 hour)
- [ ] Use https://dnschecker.org to verify

### Login Fails
```
Error: Database error at _auth
```
**Solution**:
- [ ] Check Supabase Auth users table
- [ ] Verify RLS policies allow reads
- [ ] Check JWT token valid in browser dev tools

---

## Next Steps

After completing deployment:

1. **Monitor performance** - Check Vercel analytics dashboard
2. **Set up error tracking** - Add Sentry for error monitoring
3. **Configure backups** - Supabase auto-backs up, but enable point-in-time recovery
4. **Set alerts** - Get notified if Functions fail or usage spikes
5. **Optimize images** - Use Vercel Image Optimization for faster loads
6. **Add CI/CD checks** - Auto-run tests on each push

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **Your Supabase Project**: https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
