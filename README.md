<div align="center">

# 🏗️ ArchitectAI

### Smart Construction Management Platform

*The all-in-one construction management solution for architects, engineers, and supervisors. Manage projects, track progress, and collaborate seamlessly with AI-powered insights.*

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ecf8e)](https://supabase.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**ArchitectAI** is a production-ready, enterprise-grade construction management platform built with modern web technologies. It empowers construction professionals to streamline project workflows, visualize designs in 3D, collaborate with teams, and track every aspect of construction from planning to completion.

### What Problem Does It Solve?

Construction projects involve complex coordination between architects, engineers, supervisors, and teams. ArchitectAI centralizes:
- **Project Management** - Unified dashboard for all construction projects
- **Blueprint Design** - Interactive 2D layout planning with drag-and-drop
- **3D Visualization** - Upload and inspect architectural models
- **Budget Tracking** - Real-time expense monitoring and budget alerts
- **Team Collaboration** - Role-based access and shared workspaces
- **Document Management** - Centralized storage for specifications, permits, and plans

### Who Is It For?

- **Architects** - Design blueprints, manage models, collaborate with clients
- **Construction Managers** - Oversee projects, track budgets, monitor timelines
- **Engineers** - Access technical documents, review specifications
- **Site Supervisors** - Log issues, upload progress photos, manage inventory

---

## ✨ Features

### 🎯 Core Capabilities

#### **Project Management**
- ✅ Create and manage multiple construction projects
- ✅ Project timeline visualization with calendar view
- ✅ Kanban-style task boards for workflow management
- ✅ Team member invitations with role-based permissions (owner, member)
- ✅ Real-time project status tracking

#### **Blueprint & Layout Planning**
- ✅ Interactive 2D blueprint sketcher
- ✅ Drag-and-drop node-based UI using @xyflow/react
- ✅ Save and export blueprint configurations
- ✅ Undo/redo functionality with temporal state management

#### **3D Model Visualization**
- ✅ Upload and render 3D architectural models (GLB/GLTF)
- ✅ Interactive 3D viewer powered by Three.js
- ✅ Orbit controls, zoom, and model inspection
- ✅ Real-time rendering with React Three Fiber

#### **Budget & Expense Management**
- ✅ Set project budgets and track spending
- ✅ Categorize expenses by type
- ✅ Visual analytics with charts and graphs
- ✅ Budget alerts and overspending notifications

#### **Document Management**
- ✅ Upload and organize project documents
- ✅ File versioning and metadata
- ✅ Secure storage with access controls
- ✅ Search and filter capabilities

#### **Inventory Tracking**
- ✅ Track construction materials and equipment
- ✅ Add, edit, and delete inventory items
- ✅ Low-stock alerts and notifications

#### **Issue Management**
- ✅ Create and track project issues
- ✅ Priority levels and status workflows
- ✅ Comment threads for collaboration
- ✅ Assignment to team members

#### **Progress Monitoring**
- ✅ Upload timestamped progress photos
- ✅ Visual timeline of construction milestones
- ✅ Before/after comparisons

#### **Security & Authentication**
- ✅ Secure email/password authentication
- ✅ Password reset flow with email verification
- ✅ Role-based access control (user, admin)
- ✅ Row-Level Security (RLS) at database level
- ✅ Protected routes with authentication guards

#### **Developer Experience**
- ✅ Full TypeScript coverage with strict mode
- ✅ Comprehensive testing with Vitest
- ✅ Hot Module Replacement (HMR) for fast development
- ✅ ESLint for code quality
- ✅ Internationalization (i18n) ready

---

## 🏗️ Architecture

### System Overview

ArchitectAI follows a **modern SPA architecture** with Backend-as-a-Service (BaaS):

```
┌──────────────────────────────────────────────────────────────┐
│                       Client (Browser)                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React 18 SPA (Vite-bundled)                  │   │
│  │                                                        │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  Pages  │→ │Components│→ │  UI Components   │   │   │
│  │  └────┬────┘  └─────┬────┘  └──────────────────┘   │   │
│  │       │             │                                │   │
│  │       └─────────────┼────────────────┐              │   │
│  │                     ▼                 ▼              │   │
│  │           ┌─────────────────┐  ┌──────────┐        │   │
│  │           │  Zustand Stores │  │  Hooks   │        │   │
│  │           │  + Temporal     │  │  Logic   │        │   │
│  │           └────────┬────────┘  └─────┬────┘        │   │
│  │                    │                  │              │   │
│  │                    └──────────┬───────┘              │   │
│  │                               ▼                      │   │
│  │                  ┌─────────────────────────┐        │   │
│  │                  │   Service Layer (TS)    │        │   │
│  │                  │  • auth.ts              │        │   │
│  │                  │  • projects.ts          │        │   │
│  │                  │  • documents.ts         │        │   │
│  │                  │  • tasks.ts             │        │   │
│  │                  └──────────┬──────────────┘        │   │
│  └─────────────────────────────┼───────────────────────┘   │
└────────────────────────────────┼───────────────────────────┘
                                 │
                                 ▼ HTTPS
                ┌────────────────────────────────────┐
                │      Supabase Backend (BaaS)       │
                │                                    │
                │  ┌──────────────────────────────┐ │
                │  │  PostgreSQL Database         │ │
                │  │  • RLS Policies              │ │
                │  │  • Tables & Relationships    │ │
                │  │  • Triggers & Functions      │ │
                │  └──────────────────────────────┘ │
                │                                    │
                │  ┌──────────────────────────────┐ │
                │  │  Supabase Auth               │ │
                │  │  • Email/Password            │ │
                │  │  • Session Management        │ │
                │  └──────────────────────────────┘ │
                │                                    │
                │  ┌──────────────────────────────┐ │
                │  │  Supabase Storage            │ │
                │  │  • File Uploads              │ │
                │  │  • Secure Access             │ │
                │  └──────────────────────────────┘ │
                └────────────────────────────────────┘
```

### Design Principles

1. **Modularity** - Components, services, and hooks are isolated and reusable
2. **Type Safety** - TypeScript everywhere with strict mode enabled
3. **Security by Default** - RLS policies, auth guards, content security policy
4. **Performance** - Code splitting, lazy loading, optimized builds
5. **Testability** - Clear separation of logic from UI
6. **Scalability** - Service layer can evolve to REST/GraphQL API

---

## 📁 Project Structure

```
ArchAi/
├── public/                      # Static assets
│   └── logo.svg
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI primitives (Button, Card, Input)
│   │   ├── layout/              # Layout components (Header, Sidebar)
│   │   ├── blueprint/           # Blueprint editor components
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── home/                # Landing page sections
│   │   ├── kanban/              # Kanban board components
│   │   └── projects/            # Project-specific components
│   ├── pages/                   # Route pages (lazy-loaded)
│   │   ├── Dashboard.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── projects/            # Nested project pages
│   │   │   ├── Budget.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── LayoutPlanner.tsx
│   │   │   └── Timeline.tsx
│   │   └── [auth pages]
│   ├── services/                # Backend service layer
│   │   ├── auth.ts              # Authentication service
│   │   ├── supabase.ts          # Supabase client
│   │   ├── projects.ts          # Project CRUD
│   │   ├── tasks.ts
│   │   ├── blueprints.ts
│   │   ├── documents.ts
│   │   ├── expenses.ts
│   │   └── [other services]
│   ├── store/                   # Zustand state stores
│   │   ├── authStore.ts         # Auth state + session
│   │   ├── blueprintStore.ts    # Blueprint state with undo/redo
│   │   └── temporalStore.ts     # Temporal wrapper
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   └── [other hooks]
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   ├── i18n/                    # Internationalization
│   ├── constants/               # App constants
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── supabase/                    # Database schema & migrations
│   ├── schema.sql               # Database schema
│   ├── migrations/              # Migration files
│   └── [policy files]
├── index.html                   # HTML entry with SEO
├── package.json                 # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Deployment config
└── vitest.config.ts             # Test configuration
```

---

## 🛠️ Tech Stack

### Frontend Core
- **[React 18.2](https://reactjs.org/)** - UI library with concurrent features
- **[TypeScript 5.2](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite 7.2](https://vitejs.dev/)** - Next-gen build tool with HMR
- **[React Router 6.20](https://reactrouter.com/)** - Client-side routing

### Styling & UI
- **[TailwindCSS 3.3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **Custom Design System** - HSL-based theme with CSS variables

### State Management
- **[Zustand 4.5](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Zundo 2.3](https://github.com/charkour/zundo)** - Temporal state for undo/redo

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - **PostgreSQL** - Relational database with RLS
  - **Supabase Auth** - Email/password authentication
  - **Supabase Storage** - File uploads and storage
  - **Real-time** - Auth state subscriptions

### 3D Graphics
- **[Three.js 0.158](https://threejs.org/)** - 3D rendering library
- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Helpers and abstractions

### Data Visualization
- **[Recharts 3.5](https://recharts.org/)** - Composable charting library

### Forms & Validation
- **[React Hook Form 7.48](https://react-hook-form.com/)** - Performant forms
- **[Zod 3.22](https://zod.dev/)** - TypeScript-first schema validation

### Calendar & Scheduling
- **[FullCalendar 6.1](https://fullcalendar.io/)** - Event calendar
  - DayGrid, TimeGrid, Interaction plugins

### Drag & Drop
- **[@dnd-kit/core 6.3](https://dndkit.com/)** - Drag-and-drop toolkit
- **[@xyflow/react 12.9](https://reactflow.dev/)** - Node-based UI for blueprints

### Additional Libraries
- **[axios 1.6](https://axios-http.com/)** - HTTP client
- **[date-fns 2.30](https://date-fns.org/)** - Date manipulation
- **[nanoid 5.1](https://github.com/ai/nanoid)** - Unique ID generation
- **[dompurify 3.3](https://github.com/cure53/DOMPurify)** - XSS sanitization
- **[i18next 23.7](https://www.i18next.com/)** - Internationalization
- **[jspdf 3.0](https://github.com/parallax/jsPDF)** - PDF generation
- **[html2canvas 1.4](https://html2canvas.hertzen.com/)** - Screenshot rendering

### Testing
- **[Vitest 4.0](https://vitest.dev/)** - Unit testing framework
- **[@testing-library/react 14.1](https://testing-library.com/react)** - Component testing
- **[@testing-library/jest-dom 6.1](https://github.com/testing-library/jest-dom)** - Custom matchers

### Code Quality
- **[ESLint 8.55](https://eslint.org/)** - Linting with TypeScript support
- **TypeScript Strict Mode** - Enforced type checking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **yarn** 1.22+)
- **Supabase Account** - [Create one here](https://supabase.com/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ArchAi.git
cd ArchAi
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: App URL for password reset emails
VITE_APP_URL=http://localhost:5173
```

**How to get Supabase credentials:**

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **Project Settings** → **API**
3. Copy the **Project URL** → `VITE_SUPABASE_URL`
4. Copy the **anon/public key** → `VITE_SUPABASE_ANON_KEY`

4. **Set up the database**

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase/schema.sql
# Paste and run in Supabase Dashboard → SQL Editor
```

Or run migrations:

```bash
# If using Supabase CLI
npx supabase db push
```

5. **Configure storage buckets**

In Supabase Dashboard → Storage, create the following buckets:

- `avatars` (public)
- `project-files` (private)
- `blueprint-images` (private)
- `progress-photos` (private)

Then apply storage policies:

```bash
# Run supabase/storage-policies.sql in SQL Editor
```

6. **Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🏭 Build & Deployment

### Production Build

```bash
# Compile TypeScript and build with Vite
npm run build

# Preview the production build locally
npm run preview
```

Build output will be in the `dist/` directory.

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ArchAi)

**Manual deployment:**

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Set environment variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Configuration:**

The `vercel.json` file is pre-configured for SPA routing and asset caching.

### Deploy to Other Platforms

<details>
<summary><b>Netlify</b></summary>

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables in Netlify UI
4. Add redirect rule in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

</details>

<details>
<summary><b>Cloudflare Pages</b></summary>

1. Build command: `npm run build`
2. Build output directory: `dist`
3. Set environment variables in Cloudflare dashboard
4. SPA mode is automatically handled

</details>

---

## 📖 Usage Guide

### Getting Started with ArchitectAI

#### 1. **Create an Account**

- Navigate to `/signup`
- Enter your email, password, and display name
- Check your email for confirmation (if email confirmation is enabled)

#### 2. **Create Your First Project**

1. Log in and go to the **Dashboard**
2. Click **"New Project"**
3. Fill in:
   - Project name
   - Description
   - Initial status (active/completed)
4. Click **"Create Project"**

#### 3. **Invite Team Members**

1. Open your project
2. Go to **Team** tab
3. Enter team member email and role (member/owner)
4. They'll receive access upon signing in

#### 4. **Design a Blueprint**

1. Navigate to **Projects** → **Layout Planner**
2. Use drag-and-drop to add nodes
3. Connect nodes to define room layouts
4. Save your blueprint

#### 5. **Upload a 3D Model**

1. Go to **3D Viewer** in your project
2. Click **"Upload Model"**
3. Select a `.glb` or `.gltf` file
4. View and inspect your model in 3D

#### 6. **Track Budget & Expenses**

1. Set your project budget in **Budget** tab
2. Add expenses with category and amount
3. View real-time budget utilization charts
4. Receive alerts when approaching budget limits

---

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production (TypeScript + Vite) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on TypeScript/TSX files |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:ui` | Open Vitest UI |

### Code Structure & Conventions

#### Service Layer Pattern

All backend interactions are abstracted in `src/services/`:

```typescript
// Example: projects.ts
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Project[];
};
```

#### State Management

Zustand stores with TypeScript:

```typescript
// Example: authStore.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  // ... actions
}));
```

#### Naming Conventions

- **Files**: PascalCase for components (`ProjectCard.tsx`), camelCase for utilities (`useAuth.ts`)
- **Functions**: camelCase (`getUserProjects`)
- **Constants**: UPPER_SNAKE_CASE (`USER_ROLES`, `STORAGE_BUCKETS`)
- **Types/Interfaces**: PascalCase (`User`, `Project`)

#### TypeScript Usage

- **Strict mode** enabled
- No implicit `any`
- All functions have explicit return types
- Zod for runtime validation

### Adding New Features

<details>
<summary><b>Creating a New Page</b></summary>

1. Create component in `src/pages/`:

```tsx
// src/pages/MyNewPage.tsx
export const MyNewPage = () => {
  return <div>My New Page</div>;
};
```

2. Add lazy-loaded route in `App.tsx`:

```tsx
const MyNewPage = lazy(() => import('./pages/MyNewPage').then(m => ({ default: m.MyNewPage })));

// In routes:
<Route path="my-page" element={<MyNewPage />} />
```

</details>

<details>
<summary><b>Adding a New Service</b></summary>

1. Create service file in `src/services/`:

```typescript
// src/services/myService.ts
import { supabase } from './supabase';

export const getMyData = async () => {
  const { data, error } = await supabase
    .from('my_table')
    .select('*');
  
  if (error) throw new Error(error.message);
  return data;
};
```

2. Use in components via hooks or directly

</details>

<details>
<summary><b>Database Migrations</b></summary>

1. Create migration file in `supabase/migrations/`:

```sql
-- 20240101_add_my_table.sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON my_table FOR SELECT
  USING (auth.uid() = user_id);
```

2. Apply migration in Supabase Dashboard or via CLI

</details>

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Writing Tests

Test files are located in `__tests__/` directories:

```typescript
// src/services/__tests__/auth.test.ts
import { describe, it, expect } from 'vitest';
import { login } from '../auth';

describe('Authentication', () => {
  it('should login successfully', async () => {
    const user = await login('test@example.com', 'password');
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Testing Utilities

- `@testing-library/react` for component testing
- `vitest` globals enabled
- `jsdom` for DOM simulation

---

## 🔐 Security

### Authentication & Authorization

- **Email/password authentication** via Supabase Auth
- **Session management** with JWT tokens
- **Role-based access control** (user, admin)
- **Protected routes** with auth guards

### Row-Level Security (RLS)

All database tables have RLS policies:

```sql
-- Example: Users can only view projects they own or are members of
CREATE POLICY "Users can view accessible projects"
  ON projects FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    )
  );
```

### Content Security Policy (CSP)

Defined in `index.html`:

- Restricts external script sources
- Allows only trusted domains (Supabase, Google Fonts, Sentry)
- Blocks inline scripts (except those marked safe)

### Input Validation

- **Zod schemas** for form validation
- **DOMPurify** for HTML sanitization
- **File type/size validation** for uploads

### Best Practices

✅ Never commit `.env` file  
✅ Use environment variables for secrets  
✅ Validate all user input  
✅ Sanitize HTML before rendering  
✅ Keep dependencies updated  
✅ Review Supabase RLS policies regularly  

---

## 🗄️ Database Schema

### Core Tables

#### `users`
User profiles extending Supabase Auth
```sql
id          UUID PRIMARY KEY (→ auth.users)
email       TEXT UNIQUE
display_name TEXT
avatar      TEXT
role        TEXT ('user', 'admin')
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### `projects`
Construction projects
```sql
id          UUID PRIMARY KEY
name        TEXT
description TEXT
owner_id    UUID → users.id
status      TEXT ('active', 'completed')
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### `team_members`
Project team memberships
```sql
id         UUID PRIMARY KEY
project_id UUID → projects.id
user_id    UUID → users.id
email      TEXT
role       TEXT ('owner', 'member')
joined_at  TIMESTAMPTZ
```

### Extended Tables

Additional tables for features (see `supabase/schema_v2.sql`):
- `tasks` - Project tasks
- `budgets` - Budget allocations
- `expenses` - Expense tracking
- `documents` - File metadata
- `issues` - Issue tracking
- `comments` - Comment threads
- `inventory` - Material/equipment inventory
- `progress_photos` - Progress photo metadata
- `blueprints` - Blueprint configurations

### Entity Relationships

```
users ─┬─< projects (owner_id)
       ├─< team_members (user_id)
       └─< scans (uploaded_by)

projects ─┬─< team_members (project_id)
          ├─< tasks (project_id)
          ├─< budgets (project_id)
          ├─< expenses (project_id)
          ├─< documents (project_id)
          ├─< issues (project_id)
          ├─< inventory (project_id)
          └─< progress_photos (project_id)
```

---

## 🎨 UI Components & Design System

### Tailwind Theme

Custom HSL-based color system defined in CSS variables:

```css
:root {
  --primary: 210 100% 50%;
  --secondary: 240 5% 64%;
  --accent: 180 100% 50%;
  --background: 0 0% 100%;
  /* ... more variables */
}
```

### Custom Animations

- `fade-in` - Fade in animation
- `slide-in-from-bottom` - Slide up + fade in
- `accordion-down/up` - Accordion animations

### Reusable Components

Located in `src/components/ui/`:
- `Button`, `Card`, `Input`, `Label`
- `Spinner`, `Modal`, `Toast`
- `Badge`, `Dropdown`, `Tabs`

---

## 📸 Screenshots

> **Note:** Add screenshots of your application here

### Dashboard
![Dashboard Screenshot](./docs/screenshots/dashboard.png)

### Blueprint Editor
![Blueprint Editor](./docs/screenshots/blueprint-editor.png)

### 3D Model Viewer
![3D Viewer](./docs/screenshots/3d-viewer.png)

### Project Timeline
![Timeline View](./docs/screenshots/timeline.png)

---

## ❓ FAQ

<details>
<summary><b>Q: Can I use this project commercially?</b></summary>

Yes! This project is licensed under the MIT License. You're free to use it for commercial purposes.

</details>

<details>
<summary><b>Q: Do I need a paid Supabase plan?</b></summary>

No. The free tier is sufficient for development and small-scale deployments. Upgrade as your project grows.

</details>

<details>
<summary><b>Q: How do I create an admin user?</b></summary>

Admin users must be manually set in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

</details>

<details>
<summary><b>Q: Can I add OAuth login (Google, GitHub)?</b></summary>

Yes! Supabase supports OAuth providers. Configure them in Supabase Dashboard → Authentication → Providers.

</details>

<details>
<summary><b>Q: Is there a mobile app?</b></summary>

Not yet. The web app is fully responsive and works on mobile browsers. Native apps are on the roadmap.

</details>

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Missing Supabase configuration" error

**Cause:** Environment variables not set  
**Solution:**
```bash
# Create .env file with:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

#### ❌ Build fails with TypeScript errors

**Cause:** Type mismatches or missing dependencies  
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

#### ❌ "Permission denied" when accessing data

**Cause:** RLS policies blocking access  
**Solution:**
- Check if user is authenticated
- Verify RLS policies in Supabase Dashboard → Database → Policies
- Ensure user is project owner or team member

#### ❌ File upload fails

**Cause:** Storage bucket not configured or RLS policy missing  
**Solution:**
1. Create storage bucket in Supabase
2. Set bucket to public (for avatars) or apply RLS policies
3. Run `supabase/storage-policies.sql`

#### ❌ Hot reload not working

**Cause:** Vite HMR connection issue  
**Solution:**
```bash
# Restart dev server
npm run dev
```

### Still Having Issues?

- Check [existing issues](https://github.com/yourusername/ArchAi/issues)
- Search [Supabase documentation](https://supabase.com/docs)
- Ask in [Discussions](https://github.com/yourusername/ArchAi/discussions)

---

## 🗺️ Roadmap

### Short-Term Goals
- [ ] AI-powered blueprint analysis
- [ ] Real-time collaboration (live cursors)
- [ ] Advanced reporting & analytics
- [ ] Export projects to PDF
- [ ] Mobile PWA support

### Long-Term Vision
- [ ] Native mobile apps (iOS/Android)
- [ ] AR visualization for construction sites
- [ ] Integration with drone APIs for automated scans
- [ ] Cost estimation AI
- [ ] Multi-language support (full i18n)
- [ ] Offline mode with sync
- [ ] Video conferencing integration
- [ ] Advanced 3D model editing

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. **Fork the repository**
2. **Clone your fork**

```bash
git clone https://github.com/yourusername/ArchAi.git
cd ArchAi
```

3. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

4. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Commit with conventional commits**

```bash
git commit -m "feat: add amazing feature"
```

6. **Push and create a Pull Request**

```bash
git push origin feature/amazing-feature
```

### Development Workflow

- Run `npm run lint` before committing
- Write tests for new features
- Update documentation as needed
- Follow TypeScript strict mode

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 ArchitectAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 👥 Authors & Acknowledgments

### Maintainers

- **Your Name** - *Initial work* - [@yourusername](https://github.com/yourusername)

### Contributors

See the list of [contributors](https://github.com/yourusername/ArchAi/contributors) who participated in this project.

### Acknowledgments

- [Supabase](https://supabase.com/) - Excellent BaaS platform
- [Vite](https://vitejs.dev/) - Blazing fast build tool
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D rendering made easy
- [shadcn/ui](https://ui.shadcn.com/) - Inspiration for component design
- All open-source library authors

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/yourusername/ArchAi/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/ArchAi/discussions)
- **Email:** support@architectai.com
- **Twitter:** [@ArchitectAI](https://twitter.com/ArchitectAI)

---

## 🔗 Related Projects

- [Supabase](https://github.com/supabase/supabase) - Open source Firebase alternative
- [React Flow](https://github.com/xyflow/xyflow) - Node-based UIs
- [Three.js](https://github.com/mrdoob/three.js/) - 3D library

---

<div align="center">

**Built with ❤️ by the ArchitectAI Team**

[⬆ Back to Top](#️-architectai)

</div>
