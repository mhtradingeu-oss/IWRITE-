# IWRITE Testing & Deployment Guide

## 🔐 Test Accounts

Use these credentials to test different user roles and permission levels:

### 1. **FREE User** (5 AI generations/day limit)
- **Email:** `test@example.com`
- **Password:** `Test1234`
- **Plan:** FREE
- **Daily Limit:** 5 AI generations
- **Features:** Limited daily usage, all templates/profiles, basic exports

### 2. **PRO User** (Unlimited AI generations)
- **Email:** `mhtrading@gmail.com`
- **Password:** `test@123`
- **Plan:** PRO_MONTHLY
- **Daily Limit:** Unlimited
- **Features:** All premium features, unlimited AI usage, priority support

### 3. **Super Admin** (Full system access)
- **Email:** `mhtrading@gmail.com`
- **Password:** `test@123`
- **Role:** admin
- **Access:** Admin panel, user management, system stats, plan resets

> **Note:** Admin uses same credentials as PRO (role field in database determines access)

---

## ✅ Feature Checklist by User Type

### All Users Can Access:

| Feature | FREE | PRO | ADMIN |
|---------|------|-----|-------|
| Dashboard | ✅ | ✅ | ✅ |
| AI Writer | ✅ (5/day) | ✅ | ✅ |
| Songwriter | ✅ (5/day) | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ |
| File Uploads | ✅ | ✅ | ✅ |
| Templates | ✅ | ✅ | ✅ |
| Style Profiles | ✅ | ✅ | ✅ |
| Search/Topics | ✅ | ✅ | ✅ |
| Archive | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Plans Page | ✅ | ✅ | ✅ |

### Admin-Only Features:

| Feature | Access |
|---------|--------|
| Admin Panel (`/admin`) | ADMIN only |
| User Management | ADMIN only |
| Change User Plans | ADMIN only |
| Reset Usage Limits | ADMIN only |
| System Statistics | ADMIN only |

---

## 📖 Pages to Test (All 19 Routes)

### Workspace Pages (All Users)
- [ ] `/dashboard` - Dashboard with stats and activity
- [ ] `/ai-writer` - AI document generation (respects daily limits)
- [ ] `/songwriter` - AI songwriting tool (respects daily limits)
- [ ] `/documents` - Document list and management
- [ ] `/documents/:id` - Document editor with AI features
- [ ] `/uploads` - File upload management
- [ ] `/templates` - Template library
- [ ] `/style-profiles` - Style profile management
- [ ] `/search` - Topic search functionality
- [ ] `/topics` - Topic management
- [ ] `/topics/:id` - Topic pack details
- [ ] `/archive` - Document archive
- [ ] `/settings` - Account settings and usage stats

### Billing & Plans (All Users)
- [ ] `/plans` - Subscription plans (shows Stripe "not configured" message gracefully)
- [ ] `/upgrade/success` - Upgrade confirmation page

### Admin (ADMIN only)
- [ ] `/admin` - Admin panel with user management and stats

### Legal (All Users)
- [ ] `/legal/imprint` - Legal company information
- [ ] `/legal/privacy` - Privacy policy
- [ ] `/legal/terms` - Terms of service
- [ ] `/legal/payment` - Payment policy

---

## 🧪 Testing Workflow

### Step 1: Test FREE Account
1. Go to login page (click "FREE User" demo button)
2. Sign in as `test@example.com / Test1234`
3. Check dashboard loads with stats
4. Try AI Writer - should allow 5 generations before hitting limit
5. Check Settings - should show "FREE" plan and daily usage counter
6. Check Plans page - should show upgrade options
7. Access all pages from sidebar (no 404s)

### Step 2: Test PRO Account
1. Go to login page (click "PRO User" demo button)
2. Sign in as `mhtrading@gmail.com / test@123`
3. Check dashboard loads
4. Try AI Writer - should allow unlimited generations
5. Check Settings - should show "PRO_MONTHLY" plan with unlimited usage
6. Access all pages from sidebar
7. Footer appears on every page with company info

### Step 3: Test ADMIN Account
1. Use same credentials as PRO (`mhtrading@gmail.com / test@123`)
2. Check sidebar - "Admin" link should appear in footer
3. Click Admin link → `/admin` page loads
4. Admin page should show:
   - Users table with email, role, plan, usage
   - Change plan functionality
   - Reset usage functionality
   - System statistics
5. Test changing a FREE user to PRO
6. Test resetting a user's daily usage counter

### Step 4: Test All Pages Load Without 404
- Sidebar navigation - click each item, page should load
- Footer links - click legal pages, they should load
- Check no JavaScript errors in browser console
- Check page renders correctly in dark/light mode

### Step 5: Test Features by Plan
- **FREE user:** AI generation hits limit after 5 uses, shows message
- **PRO user:** No daily limit message, unlimited AI generations
- **ADMIN user:** Can access all admin endpoints, can view all user data

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] All 19 routes tested and working
- [ ] FREE, PRO, and ADMIN accounts tested
- [ ] No 404 errors
- [ ] No JavaScript console errors
- [ ] Footer appears on all pages
- [ ] Legal pages display company metadata correctly
- [ ] Dark/light mode works on all pages
- [ ] Data test IDs are present for automation
- [ ] Database connection is properly configured
- [ ] JWT secret is set in production (`JWT_SECRET` env var)
- [ ] OpenAI API key is configured (`AI_INTEGRATIONS_OPENAI_API_KEY`)
- [ ] Free daily limit is set (`FREE_DAILY_LIMIT` env var, default: 20)
- [ ] Admin email configured (`ADMIN_EMAIL`, default: mhtrading@gmail.com)
- [ ] Company metadata env vars set (optional, has sensible defaults)

### Optional for Payment Support
- [ ] Stripe API key configured (`STRIPE_SECRET_KEY`)
- [ ] Stripe price IDs configured (`STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`)
- [ ] Stripe webhook secret configured (`STRIPE_WEBHOOK_SECRET`)
- [ ] Webhook endpoint registered in Stripe dashboard

---

## 🔍 Key API Endpoints

### Auth
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new account
- `GET /auth/me` - Get current user (includes role & plan)

### Admin
- `GET /api/admin/users` - List all users with usage
- `PUT /api/admin/users/:id/plan` - Change user plan
- `PUT /api/admin/users/:id/reset-usage` - Reset daily usage
- `GET /api/admin/stats` - System statistics

### Public
- `GET /api/public/company-info` - Company metadata (no auth needed)
- `GET /healthz` - Health check endpoint

### Billing
- `POST /api/billing/create-checkout-session` - Create Stripe checkout (returns 503 if not configured)
- `POST /api/billing/webhook` - Stripe webhook handler

---

## 📱 Multi-Language Support

The app supports:
- **English** (default)
- **Arabic** (RTL)
- **German**

Language preference is stored in local state. All UI text is translated.

---

## ⚡ Performance Notes

- Build size: ~730 KB JS (gzipped: 210 KB)
- CSS: ~97 KB (gzipped: 15 KB)
- 1,874 modules compiled
- Hot Module Replacement enabled in development
- All pages use React Query for data fetching with caching

---

## 🆘 Troubleshooting

### 404 on Pages
- Check that route is registered in `client/src/App.tsx`
- Check sidebar link path matches route path
- Clear browser cache

### useQuery Errors
- Ensure all useQuery hooks properly destructure response
- Check query key is unique and uses array format `['/api/path']`
- Verify API endpoint exists and is working

### Auth Errors
- Check JWT_SECRET env var is set
- Verify cookies are enabled in browser
- Check token hasn't expired (7 day expiration)

### Stripe Not Configured
- This is expected if `STRIPE_SECRET_KEY` is not set
- UI gracefully shows amber banner informing user
- No crashes or errors - designed to degrade gracefully

---

## 📧 Support

For issues or questions:
1. Check DEPLOYMENT.md for detailed configuration
2. Review this testing guide
3. Check browser console for JavaScript errors
4. Verify environment variables are set correctly
