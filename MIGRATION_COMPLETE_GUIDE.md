# 🚀 Complete Migration Guide: Lovable Cloud → Supabase

This guide will walk you through the complete migration process in the correct order.

---

## Prerequisites

✅ Supabase project created (ID: `ifphycktfuymugqxvvbi`)  
✅ Code already configured for Supabase  
✅ Migrations and Edge Functions ready in `supabase/` folder

---

## Quick Start: Run These Commands

### 1️⃣ Run the Complete Migration

```bash
chmod +x migrate.sh && ./migrate.sh
```

This single command will:
- Install Supabase CLI (if needed)
- Log you into Supabase
- Link your project
- Run all 26 database migrations
- Deploy all 16 Edge Functions

**What it does:**
- Creates database tables (users, venues, bookings, games, etc.)
- Sets up RLS policies for security
- Creates database functions and triggers
- Deploys Edge Functions for payments, notifications, etc.

---

### 2️⃣ Set Up Environment Variables

```bash
chmod +x setup-env.sh && ./setup-env.sh
```

This will:
- Prompt you for your Supabase API keys
- Create `.env.local` with all necessary configuration
- Set up your project URL

**Where to get your API keys:**
Go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/settings/api

You need:
- **Anon key** (public, safe for frontend)
- **Service role key** (secret, for backend operations)

---

### 3️⃣ Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 and test:
- ✅ User signup/login
- ✅ Venue browsing
- ✅ Booking creation
- ✅ Profile management

---

### 4️⃣ Deploy to Vercel

```bash
chmod +x deploy-vercel.sh && ./deploy-vercel.sh
```

This will:
- Build your frontend
- Deploy to Vercel
- Set up environment variables in Vercel
- Give you a live URL

---

## Migration Status Checklist

Use this to track your progress:

### Backend Setup
- [ ] Run `migrate.sh` - Deploy database and functions
- [ ] Verify migrations: `supabase migration list`
- [ ] Check database: Visit Supabase Dashboard → Table Editor

### Frontend Setup  
- [ ] Run `setup-env.sh` - Configure environment
- [ ] Test locally: `npm run dev`
- [ ] Verify login/signup works
- [ ] Verify venue browsing works
- [ ] Verify booking flow works

### Deployment
- [ ] Run `deploy-vercel.sh` - Deploy to production
- [ ] Test live site
- [ ] Configure custom domain (optional)

### Data Migration (if needed)
- [ ] Export data from Lovable Cloud
- [ ] Import data to Supabase
- [ ] Verify all data migrated correctly

### Cleanup
- [ ] Disconnect Lovable Cloud
- [ ] Update any external links
- [ ] Monitor for errors

---

## Troubleshooting

### "supabase: command not found"
The script will install it automatically, or run:
```bash
npm install -g supabase
```

### "Failed to link project"
Make sure you're logged in:
```bash
supabase login
supabase link --project-ref ifphycktfuymugqxvvbi
```

### "Migration failed"
Check the error message. Common issues:
- Database already has tables (drop and recreate, or use `--reset`)
- RLS policies conflict
- Run: `supabase db reset` to start fresh

### "Edge Function deployment failed"
Some functions may need environment variables. Deploy individually:
```bash
supabase functions deploy booking-notifications
```

### App shows errors after migration
1. Check `.env.local` has correct keys
2. Verify migrations ran: `supabase migration list`
3. Check browser console for errors
4. Check Supabase logs: Dashboard → Logs

---

## Quick Commands Reference

```bash
# Complete migration (one command)
./migrate.sh

# Set up environment
./setup-env.sh

# Test locally
npm run dev

# Deploy to production
./deploy-vercel.sh

# Manual Supabase commands
supabase login
supabase link --project-ref ifphycktfuymugqxvvbi
supabase db push
supabase functions deploy --all
supabase migration list

# Reset database (careful!)
supabase db reset
```

---

## Data Migration (If You Have Existing Data)

If you have existing users, venues, bookings, etc. in Lovable Cloud:

### Option 1: Manual Export/Import
1. Export data from Lovable Cloud (usually via API or dashboard)
2. Format as SQL INSERT statements
3. Run in Supabase SQL editor

### Option 2: Use Migration Script
1. Create a script to fetch from Lovable API
2. Transform data to match new schema
3. Insert into Supabase using service key

Would you like me to create a data migration script? If so, provide:
- How to access your Lovable Cloud data
- What data needs to be migrated
- Any schema differences

---

## Support Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Scripts**: All in the root folder
  - `migrate.sh` - Complete backend migration
  - `setup-env.sh` - Environment configuration
  - `deploy-vercel.sh` - Frontend deployment
  - `verify.sh` - Verify setup

---

## What Each Script Does

### `migrate.sh` - Backend Migration
1. Installs Supabase CLI
2. Logs you in
3. Links your project
4. Runs 26 database migrations
5. Deploys 16 Edge Functions

### `setup-env.sh` - Environment Setup
1. Prompts for API keys
2. Creates `.env.local`
3. Configures project URLs

### `deploy-vercel.sh` - Frontend Deployment
1. Installs Vercel CLI
2. Logs you in
3. Deploys to Vercel
4. Sets environment variables
5. Returns live URL

### `verify.sh` - Verification
1. Checks all files exist
2. Verifies configuration
3. Lists migrations and functions
4. Validates setup

---

## Next Steps After Migration

1. **Test Everything**: Go through all user flows
2. **Set Up Stripe**: Add Stripe keys to environment
3. **Configure Email**: Set up email templates in Supabase
4. **Custom Domain**: Add domain in Vercel
5. **Monitoring**: Set up error tracking (Sentry, etc.)
6. **Backups**: Configure Supabase backups
7. **Disconnect Lovable**: Remove old deployment

---

**Ready to start? Run:**
```bash
chmod +x migrate.sh && ./migrate.sh
```
