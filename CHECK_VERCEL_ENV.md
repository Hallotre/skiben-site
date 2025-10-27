# Vercel Environment Variables Setup

## 🚨 Current Error: 406 Not Acceptable

This error means Supabase is rejecting requests because the API key is missing.

### Error Details:
```
GET https://uchhknkcxidcylrasyoq.supabase.co/rest/v1/profiles?select=*&id=eq.76e7cdaa-7e64-4983-b84f-677efef0285e 406 (Not Acceptable)
```

This means:
- Supabase URL is set ✅ (we can see it in the URL)
- Supabase Anon Key is **MISSING** ❌ (no Authorization header)

---

## ✅ Fix: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your project: **skiben**
3. Go to **Settings** tab
4. Click **Environment Variables**

### Step 2: Add These Variables

Add these three environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uchhknkcxidcylrasyoq.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Supabase | Production, Preview, Development |

### Step 3: Get Your Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → use for `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Warning:** Never expose the `service_role` key in client-side code!

### Step 4: Save and Redeploy

1. After adding all 3 variables, click **Save**
2. Go to **Deployments** tab
3. Click the **three dots** (⋯) on latest deployment
4. Click **Redeploy**

---

## 🔍 How to Verify

After redeploying, check:

1. **Try to login:** Go to https://skiben.vercel.app
2. **Check browser console:** Should NOT see 406 errors
3. **Check Vercel logs:** Function logs should NOT show auth errors

---

## 📋 Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel
- [ ] All variables enabled for Production, Preview, Development
- [ ] Redeployed the latest version
- [ ] Tested login flow
- [ ] No 406 errors in console

---

## 🎯 Expected Behavior After Fix

**Before (❌):**
```
GET /rest/v1/profiles 406 (Not Acceptable)
```

**After (✅):**
```
GET /rest/v1/profiles 200 OK
- Returns user profile data
```

---

## 💡 Common Issues

### Issue 1: Wrong Environment
- Make sure to select **Production, Preview, Development** for each variable
- Don't just select one environment

### Issue 2: Typo in Variable Name
- Check for exact match: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (case-sensitive)
- No extra spaces or typos

### Issue 3: Old Deployment
- After adding variables, you MUST redeploy
- Environment variables only apply to NEW deployments

### Issue 4: Database Tables Missing
- Make sure you've run the SQL from `DATABASE_SETUP.md`
- Tables needed: `profiles`, `contests`, `submissions`, `moderation_logs`

---

## 🔗 Helpful Links

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/dashboard/project/_/settings/api)
- [Your Vercel Project](https://vercel.com/dashboard)

---

Once you've added the environment variables and redeployed, the 406 error should be fixed!

