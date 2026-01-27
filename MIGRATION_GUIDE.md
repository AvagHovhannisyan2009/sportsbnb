# Lovable Cloud to Supabase Full Migration Guide

**Status**: ✅ **90% Complete** - You've already removed Lovable dependencies  
**Date**: January 27, 2026  
**Supabase Project ID**: `aeyqnrwmqmvsfendqypd`

---

## What's Already Migrated ✅

### Code & Configuration
- ✅ Removed `lovable-tagger` package from `package.json`
- ✅ Removed Lovable imports from `vite.config.ts`
- ✅ Updated all URLs from `sportsbnb.lovable.app` to `sportsbnb.com` in metadata
- ✅ Updated `README.md` with proper tech stack documentation
- ✅ Supabase client properly configured in `src/integrations/supabase/client.ts`

### Backend Infrastructure
- ✅ Supabase project active: `aeyqnrwmqmvsfendqypd`
- ✅ 26 database migrations already defined (Jan 14-27, 2026)
- ✅ 16 Edge Functions configured in `supabase/functions/`
- ✅ All environment variables set in `.env`:
  - `VITE_SUPABASE_URL`: https://aeyqnrwmqmvsfendqypd.supabase.co
  - `VITE_SUPABASE_PROJECT_ID`: aeyqnrwmqmvsfendqypd
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: (valid JWT token)

### Database Schema
The following tables are defined and ready:
- `profiles` - User profile information
- `bookings` - Booking records
- `venues` - Sports venue listings
- `games` - Game/event listings
- `chats` - Messaging system
- `reviews` - User reviews
- `payments` - Payment records
- `notifications` - System notifications
- Plus: photos, amenities, availability, etc.

All tables have:
- ✅ Row-Level Security (RLS) policies
- ✅ Automatic timestamp triggers (`created_at`, `updated_at`)
- ✅ Proper foreign key relationships

---

## What You Need To Do Now

### Step 1: Clean Install Dependencies (2 minutes)

Remove old package-lock.json references to lovable-tagger:

```bash
cd /workspaces/sportsbnb
rm -rf node_modules package-lock.json
npm install
```

This regenerates `package-lock.json` without the lovable-tagger entry.

### Step 2: Verify Local Development (5 minutes)

```bash
npm run dev
```

Expected output:
```
VITE v5.4.19 ready in 123 ms

➜  Local:   http://localhost:8080/
```

Then test:
1. Open http://localhost:8080 in your browser
2. Navigate to login page - should work
3. Check browser console - no errors related to Lovable
4. Verify Supabase client initializes (check Network tab for supabase.co requests)

### Step 3: Update Domain References (5 minutes)

Replace placeholder domain `sportsbnb.com` with your actual production domain:

**Files to update:**
- `index.html` - Replace all 4 occurrences:
  - Line 10: canonical link
  - Line 31: Open Graph URL
  - Line 40: Twitter URL
  - Line 52: JSON-LD schema URL

- `README.md` - Update deployment instructions with your actual domain

**Example:**
```html
<!-- Before -->
<link rel="canonical" href="https://sportsbnb.com/" />

<!-- After (your actual domain) -->
<link rel="canonical" href="https://yourdomain.com/" />
```

### Step 4: Verify Supabase Connection (10 minutes)

Test database connectivity:

1. **Sign up through the app** - This tests auth
2. **Check Supabase Dashboard**:
   - Log in: https://app.supabase.com
   - Select project: `aeyqnrwmqmvsfendqypd`
   - Go to **SQL Editor** and run:
   ```sql
   SELECT COUNT(*) as total_profiles FROM public.profiles;
   SELECT COUNT(*) as total_bookings FROM public.bookings;
   ```
   - You should see new rows if user creation worked

3. **Check Real-time subscriptions** (if using in components):
   - Navigate to a page that uses real-time features
   - Open DevTools → Network tab
   - Filter by "supabase"
   - Should see WebSocket connection to `.supabase.co`

### Step 5: Set Up Secrets for Edge Functions (10 minutes)

If you use Stripe or email services, add secrets to Supabase:

**In Supabase Dashboard:**
1. Navigate to **Settings → Secrets**
2. Add these (if used):
   ```
   RESEND_API_KEY=your_resend_key
   STRIPE_SECRET_KEY=your_stripe_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

**Update in Edge Functions** (in `supabase/functions/*/index.ts`):
```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
```

### Step 6: Deploy Edge Functions (5 minutes)

Deploy your Supabase Edge Functions to production:

```bash
# Install Supabase CLI if not already installed
brew install supabase/tap/supabase
# or
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref aeyqnrwmqmvsfendqypd

# Deploy functions
supabase functions deploy
```

Or deploy via Supabase Dashboard:
1. Go to **Edge Functions**
2. Each function has a **Deploy** button
3. Code from `supabase/functions/*/index.ts` gets deployed

### Step 7: Deploy Frontend (5 minutes)

Choose your hosting:

#### **Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Follow prompts to connect repo and deploy
```

#### **Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### **Option C: Self-hosted**
```bash
npm run build
# Deploy `dist/` folder to your server
```

### Step 8: Final Verification Checklist

- [ ] No Lovable references in code
- [ ] `npm list` shows no lovable packages
- [ ] `npm run dev` works without errors
- [ ] `npm run build` completes successfully
- [ ] Frontend app loads and connects to Supabase
- [ ] User authentication works (signup/login)
- [ ] Database reads/writes work (check Supabase Dashboard)
- [ ] Edge Functions deployed and accessible
- [ ] Custom domain configured and working
- [ ] All environment variables set in production
- [ ] RLS policies tested (users can only see their own data)

---

## Key Points About Supabase Architecture

### Authentication
- Uses Supabase Auth (powered by GoTrue)
- JWT tokens stored in localStorage
- Auto-refresh enabled via `supabase/client.ts`
- Email/password authentication configured

### Database
- PostgreSQL 14+
- All migrations tracked in `supabase/migrations/`
- RLS enabled on all tables for security
- Real-time subscriptions available via WebSocket

### Edge Functions
- 16 Deno-based serverless functions
- Handle: payments, emails, calendar sync, webhooks
- Secrets managed in Supabase dashboard
- Environment: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` auto-provided

### Real-time & Webhooks
- Supabase Realtime for live data (chats, notifications)
- Webhooks for external services (Make.com, Stripe)
- All configured in `platform_settings` table

---

## Troubleshooting

### "supabase is not defined"
- Missing import: `import { supabase } from "@/integrations/supabase/client"`
- Check `.env` variables are loaded in Vite

### Authentication fails
- Check `.env` values match Supabase project
- Verify user exists in Supabase Auth dashboard
- Check RLS policies in Supabase dashboard

### Edge Functions return 404
- Functions must be deployed: `supabase functions deploy`
- Check function name matches in code
- Verify secrets are set if function uses them

### Database not syncing
- Run migrations: `supabase db push`
- Check RLS policies aren't blocking access
- Verify JWT token is valid

---

## What's No Longer Happening

❌ **Lovable Component Tagging** - Not needed anymore  
❌ **Lovable Auto-deployment** - Use your own CI/CD (GitHub Actions, etc.)  
❌ **Lovable Hosting** - Self-host or use Vercel/Netlify  
❌ **Lovable Docs** - Use Supabase docs instead

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://app.supabase.com
- **Supabase CLI**: https://supabase.com/docs/reference/cli/introduction
- **Your Project URL**: https://aeyqnrwmqmvsfendqypd.supabase.co

---

## Questions?

Check the following files for more context:
- `README.md` - Project overview
- `src/integrations/supabase/client.ts` - Supabase client setup
- `src/integrations/supabase/types.ts` - Auto-generated database types
- `supabase/config.toml` - Supabase project config
- `supabase/migrations/` - All database schema changes
- `.env` - Environment variables (don't commit secrets!)
