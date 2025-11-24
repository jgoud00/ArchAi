# 🚀 ArchitectAI - Deployment Setup Guide

Complete guide for deploying the ArchitectAI Construction Management Platform to production.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
  - [Vercel Deployment](#vercel-deployment)
  - [Netlify Deployment](#netlify-deployment)
  - [Other Platforms](#other-platforms)
- [Supabase Configuration](#supabase-configuration)
- [Build Commands](#build-commands)
- [Troubleshooting](#troubleshooting)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Folder Structure](#folder-structure)

---

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

### Verify Installation

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
git --version
```

### Required Accounts

- **Supabase Account**: [https://supabase.com](https://supabase.com) (free tier available)
- **Deployment Platform**: Vercel, Netlify, or similar

---

## Environment Variables

### Required Variables

The application requires the following environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Getting Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project (or select existing)
3. Navigate to **Project Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Environment File Setup

#### For Local Development

Create a `.env.local` file in the project root:

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: `.env.local` is already in `.gitignore` - never commit this file!

#### For Production

Set environment variables in your hosting platform's dashboard (see deployment sections below).

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd DTI
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Configure Environment

Create `.env.local` file with your Supabase credentials (see [Environment Variables](#environment-variables)).

### Step 4: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or next available port).

### Step 5: Verify Setup

1. Open `http://localhost:5173` in your browser
2. You should see either:
   - **Login page** (if Supabase is configured correctly)
   - **Configuration Error page** (if environment variables are missing)

---

## Production Deployment

### Build Command

Before deploying, test the production build locally:

```bash
npm run build
```

This will:
1. Run TypeScript type checking (`tsc`)
2. Build optimized production bundle (`vite build`)
3. Output files to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

This serves the `dist/` folder locally for testing.

---

## Vercel Deployment

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**

### Vercel Configuration File (Optional)

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Netlify Deployment

### Method 1: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Initialize Site**:
   ```bash
   netlify init
   ```

4. **Set Environment Variables**:
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Method 2: Netlify Dashboard

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Go to **Site settings** → **Environment variables**
6. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **Deploy site**

### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Other Platforms

### GitHub Pages

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### AWS Amplify / Cloudflare Pages / Render

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

---

## Supabase Configuration

### Database Setup

1. **Run Migrations**:
   - Go to Supabase Dashboard → **SQL Editor**
   - Run all migration files from `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_new_modules.sql`
     - `003_add_user_roles.sql`
     - `004_create_test_users.sql` (optional, for testing)
     - `005_create_admin_supervisor_accounts.sql` (optional)
     - `006_fix_projects_rls.sql`
     - `007_add_budget_alerts.sql`
     - `008_add_ai_analysis.sql`
     - `009_add_api_keys.sql`

2. **Storage Buckets**:
   - Create storage buckets:
     - `project-files` (public)
     - `avatars` (public)
     - `scans` (public)
     - `blueprints` (public)

3. **Row Level Security (RLS)**:
   - Ensure RLS is enabled on all tables
   - Policies are included in migration files

### Authentication Setup

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Add your production domain
   - **Email Templates**: Customize if needed

### API Keys Security

- **Anon Key**: Safe to expose in frontend (protected by RLS)
- **Service Role Key**: NEVER expose in frontend (server-side only)

---

## Build Commands

### Development

```bash
npm run dev          # Start dev server (port 5173)
```

### Production

```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Type Checking

```bash
npm run lint         # Run ESLint
tsc --noEmit         # Type check without building
```

---

## Troubleshooting

### Build Errors

#### TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

#### "Configuration Error" Page

**Problem**: Supabase environment variables not set.

**Solution**:
1. Verify `.env.local` exists (local) or environment variables are set (production)
2. Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart dev server or redeploy

#### "Failed to fetch" / Network Errors

**Problem**: CORS or Supabase connection issues.

**Solution**:
1. Verify Supabase URL is correct
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check browser console for specific errors

#### Authentication Not Working

**Problem**: Users can't login or signup.

**Solution**:
1. Verify Supabase Auth is enabled
2. Check email confirmation settings
3. Verify user table exists and has correct schema
4. Check browser console for auth errors

### Deployment-Specific Issues

#### Vercel: Build Fails

- Check Node.js version (should be 18.x)
- Verify build command: `npm run build`
- Check build logs for specific errors

#### Netlify: 404 on Routes

- Add `netlify.toml` with redirect rules (see above)
- Verify publish directory is `dist`

#### Environment Variables Not Working

- **Vercel**: Variables must start with `VITE_` to be exposed to client
- **Netlify**: Same requirement
- Restart/redeploy after adding variables

---

## Pre-Deployment Checklist

Before deploying to production, verify:

### Code Quality

- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] No console errors in browser
- [ ] All routes work correctly
- [ ] Authentication flow works
- [ ] Protected routes redirect properly

### Configuration

- [ ] Environment variables set in hosting platform
- [ ] Supabase project configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] RLS policies enabled

### Testing

- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Test file uploads
- [ ] Test project creation
- [ ] Test on mobile devices (responsive)

### Security

- [ ] No API keys in code (use environment variables)
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies configured correctly
- [ ] CORS settings correct in Supabase

### Performance

- [ ] Production build size is reasonable
- [ ] Images optimized
- [ ] Lazy loading implemented where needed

---

## Folder Structure

```
DTI/
├── dist/                    # Production build output (generated)
├── node_modules/            # Dependencies (generated)
├── public/                  # Static assets (if any)
├── src/
│   ├── api/                 # Public API endpoints
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI primitives
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Internationalization
│   ├── pages/                # Page components
│   │   └── projects/       # Project-related pages
│   ├── services/            # API services
│   ├── store/               # State management (Zustand)
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database migrations
├── .env.local               # Local environment variables (not in git)
├── .gitignore              # Git ignore rules
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── DEPLOYMENT_SETUP.md     # This file
```

### Key Files

- **`package.json`**: Dependencies and npm scripts
- **`vite.config.ts`**: Build configuration
- **`tsconfig.json`**: TypeScript compiler options
- **`tailwind.config.js`**: Tailwind CSS configuration
- **`src/services/supabase.ts`**: Supabase client setup
- **`src/App.tsx`**: Main application router

---

## Additional Resources

### Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Support

- Check project `README.md` for feature documentation
- Review Supabase dashboard for database issues
- Check browser console for runtime errors
- Review build logs for deployment issues

---

## Quick Reference

### Essential Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
vercel --prod           # Deploy to Vercel
netlify deploy --prod  # Deploy to Netlify
```

### Environment Variables Template

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**Last Updated**: 2024
**Project Version**: 1.0.0

