
# Fix Google OAuth "Access blocked: This app's request is invalid" Error

## Problem Identified

After thorough code analysis, I found **two critical issues** in the Google OAuth implementation:

### Issue 1: Inconsistent Redirect URLs
The `redirectTo` parameter in `SignupPage.tsx` is incorrectly pointing directly to `/onboarding/player` instead of the OAuth callback handler:

| File | Current redirectTo | Should Be |
|------|-------------------|-----------|
| LoginPage.tsx | `/auth/callback` | Correct |
| SignupPage.tsx | `/onboarding/player` | **WRONG** - should be `/auth/callback` |

### Issue 2: How Google OAuth Works
The `redirectTo` parameter in Supabase's `signInWithOAuth` is **not** the URL that Google redirects to. Instead:

1. Google redirects to your **Supabase Auth callback** URL: `https://aeyqnrwmqmvsfendqypd.supabase.co/auth/v1/callback`
2. Supabase then redirects to **your app** using the `redirectTo` value

The error "Access blocked: This app's request is invalid" occurs because Google is receiving a malformed or misconfigured authorization request.

---

## Solution

### Code Fix Required

**File: `src/pages/SignupPage.tsx`**

Change line 182 from:
```typescript
redirectTo: `${window.location.origin}/onboarding/player`,
```

To:
```typescript
redirectTo: `${window.location.origin}/auth/callback`,
```

This ensures both LoginPage and SignupPage use the same OAuth callback handler, which properly handles the session and redirects users based on their profile status.

---

## Google Cloud Console Verification

Please verify these exact settings in your Google Cloud Console (APIs & Services → Credentials → Your OAuth 2.0 Client ID):

**Authorized JavaScript origins:**
```text
https://sportsbnb.lovable.app
https://id-preview--e3f1ccf9-01de-44d1-ad61-02d2eeff6597.lovable.app
```

**Authorized redirect URIs (CRITICAL):**
```text
https://aeyqnrwmqmvsfendqypd.supabase.co/auth/v1/callback
```

The redirect URI must be the **Supabase callback URL**, not your app URLs.

---

## Technical Details

The `AuthCallbackPage.tsx` at `/auth/callback` already handles:
- Session validation from the OAuth flow
- Profile creation for new Google users
- Redirect logic based on user type (player/owner) and onboarding status

By routing SignupPage's Google OAuth through the same callback, users will be:
1. Authenticated via Google
2. Redirected to `/auth/callback`
3. Automatically routed to the appropriate onboarding or dashboard page based on their profile

---

## Implementation Summary

| Task | Action |
|------|--------|
| Fix SignupPage.tsx | Change `redirectTo` to `/auth/callback` |
| Verify Google Console | Ensure redirect URI is the Supabase callback URL |

This single code change should resolve the "Access blocked" error.
