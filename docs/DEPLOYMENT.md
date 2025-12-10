# ArchAi Deployment Guide

**Version**: 1.0  
**Last Updated**: December 10, 2025

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/arch-ai.git
cd arch-ai
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run locally
npm run dev

# 4. Build for production
npm run build
```

---

## Prerequisites

### Required

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Supabase Account**: Free tier works
- **Git**: For version control

### Optional

- **Vercel Account**: For deployment
- **Sentry Account**: For error monitoring

---

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: ArchAi Production
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to users
4. Wait for project to initialize (~2 minutes)

### 2. Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJhbG...` (public key)

### 3. Configure Environment Variables

Create `.env` file:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Error Monitoring (OPTIONAL)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags (OPTIONAL)
VITE_AI_MOCK_MODE=false
```

**Security Notes**:
- ✅ `.env` is gitignored by default
- ✅ Anon key is safe for client-side
- ❌ Never commit `.env` to Git
- ❌ Never use Service Role key client-side

---

## Database Migration

### Apply Migrations

**In Supabase Dashboard → SQL Editor**:

#### Migration 1: Issue Comments
```sql
-- Copy/paste entire content from:
-- supabase/migrations/20251210_add_issue_comments.sql
```

#### Migration 2: Scans Security
```sql
-- Copy/paste from:
-- supabase/migrations/20251210_fix_scans_rls.sql
```

#### Migration 3: Inventory Security
```sql
-- Copy/paste from:
-- supabase/migrations/20251210_fix_inventory_rls.sql
```

#### Migration 4: Blueprints Security
```sql
-- Copy/paste from:
-- supabase/migrations/20251210_fix_blueprints_rls.sql
```

### Verify Migrations

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('issue_comments', 'scans', 'inventory', 'blueprints');

-- Expected: All rows show rowsecurity = true ✅
```

---

## Storage Configuration

### Create Storage Buckets

**In Supabase Dashboard → Storage**:

1. **blueprints** (Private)
   - Max file size: 50MB
   - Allowed types: `.glb, .gltf, .png, .jpg, .pdf`

2. **avatars** (Public)
   - Max file size: 2MB
   - Allowed types: `.jpg, .png, .webp`

3. **documents** (Private)
   - Max file size: 25MB
   - Allowed types: `.pdf, .jpg, .png, .docx`

4. **progress-photos** (Private)
   - Max file size: 10MB
   - Allowed types: `.jpg, .png, .webp`

5. **receipts** (Private)
   - Max file size: 5MB
   - Allowed types: `.jpg, .png, .webp, .pdf`

### Apply Storage Policies

**In Supabase Dashboard → Storage → Policies**:

For each bucket, run the policies from:
```
supabase/storage_policies.sql
```

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5173`

### Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
npm run test         # Run tests
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

#### Initial Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow prompts:
   - Link to existing project or create new
   - Set root directory: `./`
   - Build command: `npm run build`
   - Output directory: `dist`

#### Configure Environment Variables

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy again:
```bash
vercel --prod
```

#### Automatic Deployments

- **Main branch**: Auto-deploys to production
- **Other branches**: Auto-deploys to preview URLs
- **Pull requests**: Preview deployment

---

### Option 2: Netlify

#### Deploy with Git

1. Push to GitHub/GitLab
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables in Netlify dashboard

#### Deploy with CLI

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

---

### Option 3: Custom Server

#### Build

```bash
npm run build
```

Output in `dist/` folder.

#### Serve

```bash
# Using serve
npm i -g serve
serve -s dist -p 3000

# Using nginx
# Copy dist/ contents to /var/www/html
# Configure nginx to serve SPA
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Post-Deployment Checklist

### Verify Deployment

- [ ] Site loads correctly
- [ ] Login/signup works
- [ ] Database connections work
- [ ] File uploads work
- [ ] No console errors
- [ ] RLS policies enforced

### Security Checks

- [ ] HTTPS enabled
- [ ] CSP headers set
- [ ] CORS configured
- [ ] Environment variables secure
- [ ] No sensitive data in logs

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size acceptable

---

## Monitoring Setup

### Sentry (Error Monitoring)

1. Create Sentry project
2. Get DSN
3. Add to `.env`:
```bash
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```
4. Uncomment Sentry init in `src/utils/logger.ts`

### Supabase Logs

Dashboard → Logs section shows:
- Database queries
- Auth events
- Storage operations
- Edge function logs

---

## Troubleshooting

### Build Fails

**Problem**: `npm run build` fails

**Solutions**:
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm install --legacy-peer-deps
```

### Database Connection Issues

**Problem**: "Invalid API key" or connection timeout

**Solutions**:
- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_ANON_KEY` is anon key, not service role
- Check Supabase project is not paused
- Verify network/firewall allows Supabase access

### File Upload Fails

**Problem**: 413 Request Entity Too Large

**Solutions**:
- Check file size against bucket limits
- Verify storage policies are applied
- Check user has permission to upload

### RLS Denies Access

**Problem**: "new row violates row-level security policy"

**Solutions**:
- Verify user is authenticated
- Check user is project member
- Verify RLS policies are applied correctly
- Use Supabase Dashboard → Table Editor to test

---

## Scaling Considerations

### Database

- **Connections**: Supabase handles pooling
- **Queries**: Use indexes (already applied)
- **Storage**: Auto-scales with usage

### Frontend

- **CDN**: Vercel/Netlify handles automatically
- **Bundle**: Code-split routes already
- **Images**: Use `next/image` equivalent if needed

### Costs (Supabase Free Tier)

- Database: 500MB
- Storage: 1GB
- Bandwidth: 2GB
- Auth users: Unlimited
- **Upgrade**: When exceeding limits

---

## Backup Strategy

### Automated (Supabase)

- **Daily backups**: Last 7 days
- **Point-in-time recovery**: Pro plan
- **Download**: Dashboard → Settings → Backups

### Manual Backup

```bash
# Export database schema
pg_dump -h db.xxx.supabase.co -U postgres -s > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -a > data.sql
```

---

## Rollback Procedure

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard
2. Click Deployments
3. Find previous working deployment
4. Click "Promote to Production"

### Database Rollback

1. Supabase Dashboard → Settings → Backups
2. Select backup point
3. Click "Restore"
4. Confirm restoration

---

## Environment-Specific Configuration

### Development

```bash
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_AI_MOCK_MODE=true  # Use mock AI
```

### Staging

```bash
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_AI_MOCK_MODE=false
VITE_SENTRY_DSN=https://staging@sentry.io/xxx
```

### Production

```bash
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_AI_MOCK_MODE=false
VITE_SENTRY_DSN=https://prod@sentry.io/xxx
```

---

## Support

### Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **Component Library**: `docs/COMPONENTS.md`
- **API Reference**: `docs/API.md`

### Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

## Conclusion

Your ArchAi deployment is now complete! The application is:

✅ Secure (RLS + validation)  
✅ Scalable (Supabase + CDN)  
✅ Performant (optimized build)  
✅ Monitored (logging + Sentry ready)  
✅ Production-ready

**Happy deploying!** 🚀
