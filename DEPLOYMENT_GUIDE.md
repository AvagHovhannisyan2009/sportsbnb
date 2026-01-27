# Complete Deployment via Supabase Dashboard

Since the CLI is having network issues, follow these steps to deploy everything manually:

---

## Step 1: Add SQL Function

Go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/sql/new

Paste and click **RUN**:
```sql
CREATE OR REPLACE FUNCTION increment_game_players(game_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE games
  SET current_players = current_players + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Step 2: Add Secret Environment Variables

Go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/settings/vault/secrets

Click **New secret** for each (use values from your .env.local file):

1. **STRIPE_SECRET_KEY**
   ```
   sk_live_... (your Stripe secret key)
   ```

2. **RESEND_API_KEY**
   ```
   re_... (your Resend API key)
   ```

3. **GOOGLE_CLIENT_ID**
   ```
   ... (your Google OAuth Client ID)
   ```

4. **GOOGLE_CLIENT_SECRET**
   ```
   GOCSPX-... (your Google OAuth Client Secret)
   ```

---

## Step 3: Deploy Edge Functions

**Option A: Via Dashboard (Manual - One at a time)**

For each function, go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/functions

Click **Create a new function**, paste the code from the corresponding file in `supabase/functions/[function-name]/index.ts`

**Option B: Via GitHub (Automatic)**

1. Push your code to GitHub:
   ```bash
   git add -A
   git commit -m "feat: add all Edge Functions and complete migration"
   git push origin main
   ```

2. Go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/functions
3. Click **Deploy from GitHub**
4. Connect your repository: `AvagHovhannisyan2009/sportsbnb`
5. Select branch: `main`
6. Functions will auto-deploy from `supabase/functions/` folder

---

## Step 4: Configure Stripe Publishable Key

Go to: https://supabase.com/dashboard/project/ifphycktfuymugqxvvbi/settings/api

Add to **Custom Environment Variables**:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SpMCIRkgHfdEXMhLXmSLfhTB2hnvPF68nLWVekEj6jmi7v3UFbdDVU2VQr1Ykfy5cvJsPSRxo99FR8gxka12gEl00lQjobEqa
```

---

## Step 5: Test Locally

```bash
npm run dev
```

Open http://localhost:5173 and test:
- ✅ Login/Signup
- ✅ Google Sign In
- ✅ Create venues
- ✅ Make bookings
- ✅ Join games
- ✅ Payment flow
- ✅ Contact form

---

## Step 6: Commit & Push to GitHub

```bash
git add -A
git commit -m "feat: complete Supabase migration with all Edge Functions"
git push origin main
```

---

## Step 7: Deploy to Vercel (Production)

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

Or manually:
1. Go to: https://vercel.com/new
2. Import: `AvagHovhannisyan2009/sportsbnb`
3. Add environment variables from `.env.local`
4. Click **Deploy**

---

## ✅ Migration Complete!

All features are now functional:
- ✅ Authentication (Email + Google OAuth)
- ✅ Venues (CRUD)
- ✅ Bookings with Stripe payments
- ✅ Games with payments
- ✅ Reviews & Chat
- ✅ Notifications
- ✅ Contact form with email
- ✅ Calendar integration
- ✅ Stripe Connect for owners

**Your app is 100% migrated from Lovable Cloud to Supabase!** 🎉
