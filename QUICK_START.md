# 🚀 QUICK START - Deployment in 3 Commands

**No secrets are stored in the repo. Provide keys at runtime via prompts or environment variables.**

## Run These 3 Commands (in order):

### 1️⃣ Verify Everything Works
```bash
chmod +x verify.sh && ./verify.sh
```
- Checks project structure
- Verifies dependencies
- Tests TypeScript
- Counts functions & migrations

**Expected**: "✅ All tests passed!"

---

### 2️⃣ Deploy to Supabase (Configures secrets & functions)
```bash
chmod +x deploy.sh && ./deploy.sh
```
- Prompts for (or reads env) 5 API keys, then sends them to Supabase Secrets
- Deploys 16 Edge Functions
- Builds production frontend
- Takes 5-10 minutes

**Browser opens**: Authenticate with Supabase (you'll be logged in)

**Expected**: "✅ All Edge Functions deployed"

---

### 3️⃣ Deploy to Vercel (Live frontend)
```bash
chmod +x deploy-vercel.sh && ./deploy-vercel.sh
```
- Deploys to Vercel
- Enables auto-deployments
- Configures environment variables
- Takes 3-5 minutes

**Browser opens**: Authenticate with Vercel

**Expected**: Your Vercel deployment URL appears

---

## What Gets Deployed

✅ **Supabase Secrets** (encrypted):
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET  
- RESEND_API_KEY
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET

✅ **16 Edge Functions** (serverless):
- booking-notifications
- calendar-auth
- calendar-sync
- check-connect-status
- create-billing-portal
- create-booking-checkout
- create-connect-account
- create-game-payment
- get-billing-info
- refund-booking
- send-booking-confirmation
- send-contact-email
- verify-booking-payment
- verify-game-payment
- webhook-dispatcher
- widget-data

✅ **Frontend** (Vercel):
- Your React/Vite app
- Connected to sportsbnb.org
- Auto-deploys on git push

---

## After Deployment

### Connect Domain
1. Vercel Dashboard → sportsbnb → Settings → Domains
2. Add: `sportsbnb.org`
3. Update DNS CNAME at your registrar
4. Wait 5-30 minutes for DNS to propagate

### Test the App
1. Visit https://sportsbnb.org (or Vercel URL)
2. Sign up with test email
3. Check Supabase Dashboard for new user
4. Log in and verify it works

### Verify Everything
1. Supabase: https://app.supabase.com (check users, functions, secrets)
2. Vercel: https://vercel.com/dashboard (check deployment)
3. Your App: https://sportsbnb.org (test signup/login)

---

## Dashboards

| Service | URL | Project |
|---------|-----|---------|
| **Supabase** | https://app.supabase.com | aeyqnrwmqmvsfendqypd |
| **Vercel** | https://vercel.com/dashboard | sportsbnb |
| **Your App** | https://sportsbnb.org | Live! |

---

## Need Help?

```bash
# Run tests anytime to verify health
./verify.sh

# Check function logs
supabase functions list
supabase functions logs booking-notifications

# View deployment logs
vercel logs
```

---

**Status**: ✅ Ready to Deploy  
**API Keys**: ✅ Supplied at runtime (env/prompt)  
**Secrets**: ✅ Added to Supabase during deploy  
**Functions**: ✅ Ready to deploy  
**Frontend**: ✅ Ready to deploy  

**Just run the 3 commands above and your app goes live!** 🎉
