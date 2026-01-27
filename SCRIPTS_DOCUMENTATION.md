# 📦 Automated Deployment Scripts

Your deployment has been fully automated with three shell scripts. Here's what each does:

---

## 1. `verify.sh` - Pre-Deployment Health Check

**Purpose**: Verify everything is ready before deploying

**What it does**:
- ✓ Checks project structure (package.json, supabase/, src/)
- ✓ Verifies required dependencies (@supabase/supabase-js, vite, react)
- ✓ Confirms environment variables are set
- ✓ Runs TypeScript type checking
- ✓ Counts and lists all 16 Edge Functions
- ✓ Counts and lists all 26 database migrations
- ✓ Checks for any remaining Lovable references
- ✓ Verifies sportsbnb.org domain is set

**How to run**:
```bash
chmod +x verify.sh
./verify.sh
```

**Expected output**:
```
================================
🧪 Sportsbnb Verification Tests
================================

Test Suite 1: Project Structure
✓ package.json exists
✓ supabase/config.toml exists
✓ supabase/functions directory exists
...

================================
Test Summary
================================
Passed: 25
Failed: 0

✅ All tests passed! Your app is ready to deploy.
```

**If tests fail**:
- Read the error message
- Run `npm install` if dependencies are missing
- Check `.env` file for environment variables
- See FULL_DEPLOYMENT.md troubleshooting section

---

## 2. `deploy.sh` - Supabase Configuration & Function Deployment

**Purpose**: Configure secrets and deploy Edge Functions to Supabase

**What it does**:
1. Verifies you're in correct project directory
2. Installs Node.js dependencies
3. Installs Supabase CLI if needed
4. **Opens browser for Supabase authentication**
5. Links your local project to Supabase project (aeyqnrwmqmvsfendqypd)
6. Adds 5 API secrets:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - RESEND_API_KEY
   - GOOGLE_OAUTH_CLIENT_ID
   - GOOGLE_OAUTH_CLIENT_SECRET
7. Deploys all 16 Edge Functions
8. Builds production frontend

**How to run**:
```bash
chmod +x deploy.sh
./deploy.sh
```

**What happens**:
- Terminal displays progress
- Browser opens → authenticate with Supabase
- Scripts runs automatically after auth
- Takes 5-10 minutes total

**Expected output**:
```
Step 1: Verifying project directory...
✓ Project structure verified

Step 2: Installing Node.js dependencies...
✓ Dependencies installed

Step 3: Checking Supabase CLI...
✓ Supabase CLI ready: supabase 1.80.0

Step 4: Configuring Supabase Secrets...
✓ STRIPE_SECRET_KEY set
✓ STRIPE_WEBHOOK_SECRET set
✓ RESEND_API_KEY set
✓ GOOGLE_OAUTH_CLIENT_ID set
✓ GOOGLE_OAUTH_CLIENT_SECRET set

Step 5: Deploying Edge Functions...
✓ Function "booking-notifications" deployed
✓ Function "calendar-auth" deployed
... (14 more functions)

================================
✅ Deployment Configuration Complete!
================================
```

**Verify after running**:
1. Go to https://app.supabase.com/project/aeyqnrwmqmvsfendqypd
2. Click **Settings** → **Secrets**
3. Should see 5 secrets listed
4. Click **Edge Functions**
5. Should see 16 functions deployed

---

## 3. `deploy-vercel.sh` - Frontend Deployment

**Purpose**: Deploy your React/Vite frontend to Vercel

**What it does**:
1. Checks if Vercel CLI is installed (installs if needed)
2. Verifies production build exists (runs `npm run build` if missing)
3. **Opens browser for Vercel authentication**
4. Deploys to Vercel with environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
   - VITE_SUPABASE_PROJECT_ID
5. Enables auto-deployments from main branch
6. Provides your Vercel deployment URL

**How to run**:
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

**What happens**:
- Terminal displays progress
- Browser opens → authenticate with Vercel
- Script deploys automatically after auth
- Takes 3-5 minutes total

**Expected output**:
```
================================
🚀 Deploying to Vercel
================================

Step 1: Checking Vercel CLI...
✓ Vercel CLI ready

Step 2: Checking production build...
✓ Production build verified

Step 3: Verifying environment variables...
✓ Environment variables ready

Step 4: Verifying Vercel authentication...
✓ Authenticated with Vercel

Step 5: Deploying to Vercel...
✓ Deployment successful

================================
✅ Vercel Deployment Complete!
================================

Your deployment URL: https://sportsbnb-xxxxx.vercel.app
Vercel Dashboard: https://vercel.com/dashboard
```

**Verify after running**:
1. Go to https://vercel.com/dashboard
2. Click **sportsbnb** project
3. Should see "✓ Production Deployment"
4. Get your deployment URL
5. Visit the URL to test

---

## How API Keys Are Handled

**Location**: Provided at runtime (env vars or secure prompts) and sent directly to Supabase Secrets

**Security**:
- Keys are never stored in repo or scripts
- Script reads env vars or prompts interactively, then writes to Supabase Secrets
- Secrets only accessible to Edge Functions
- Never exposed to frontend or browser

---

## File Structure After Running Scripts

```
sportsbnb/
├── node_modules/           ← Downloaded after `npm install`
├── dist/                    ← Production build (created by `npm run build`)
│   ├── index.html
│   ├── assets/
│   └── ...
├── supabase/
│   ├── functions/          ← All 16 functions deploy from here
│   │   ├── booking-notifications/
│   │   ├── send-booking-confirmation/
│   │   └── ...
│   └── migrations/         ← Database schema
├── src/                    ← Your React app
├── .env                    ← Environment variables (local)
├── verify.sh              ← ✅ Pre-deployment check
├── deploy.sh              ← ✅ Supabase deployment
├── deploy-vercel.sh       ← ✅ Vercel deployment
├── package.json
├── vite.config.ts
└── ...
```

---

## Running Scripts Multiple Times

**It's safe to run scripts multiple times:**

```bash
# Safe to re-run anytime
./verify.sh                # Just checks, doesn't change anything

# Safe to re-run (updates existing functions)
./deploy.sh               # Deploys latest function code

# Safe to re-run (creates new deployment version)
./deploy-vercel.sh        # Deploys latest frontend build
```

---

## Troubleshooting Scripts

### Script won't execute
```bash
# Make executable
chmod +x verify.sh deploy.sh deploy-vercel.sh

# Try running
./verify.sh
```

### Permission denied
```bash
# Run with bash explicitly
bash verify.sh
bash deploy.sh
bash deploy-vercel.sh
```

### Script can't find npm
```bash
# Make sure Node.js is installed
node --version

# If not found, install from https://nodejs.org
```

### Supabase authentication fails
```bash
# Clear cached auth
supabase logout
supabase login

# Try deploy.sh again
./deploy.sh
```

### Vercel authentication fails
```bash
# Clear cached auth
vercel logout
vercel login

# Try deploy-vercel.sh again
./deploy-vercel.sh
```

---

## What Happens After Scripts Run

| Script | Creates | Deploys | Next Step |
|--------|---------|---------|-----------|
| `verify.sh` | None | Nothing | Read output, fix issues |
| `deploy.sh` | .env.secrets | Secrets + 16 functions | Check Supabase dashboard |
| `deploy-vercel.sh` | .vercel/ | Frontend + env vars | Connect domain |

---

## Command Reference

```bash
# Pre-deployment
npm install                    # Install dependencies
./verify.sh                    # Check everything

# Supabase deployment
./deploy.sh                    # Configure secrets + deploy functions

# Vercel deployment
./deploy-vercel.sh             # Deploy frontend

# Verify everything worked
supabase functions list        # See deployed functions
vercel ls                      # See Vercel deployments

# View logs
supabase functions logs booking-notifications
vercel logs
```

---

## Success Indicators

✅ **After verify.sh**:
- All tests pass (Passed: 25, Failed: 0)

✅ **After deploy.sh**:
- 5 secrets visible in Supabase Dashboard
- 16 functions listed in Edge Functions
- dist/ folder created with production build

✅ **After deploy-vercel.sh**:
- Deployment URL provided
- Visible in Vercel Dashboard
- Environment variables configured

✅ **Overall**:
- https://sportsbnb.org loads your app
- Signup/login works
- Data appears in Supabase
- No errors in browser console or function logs
