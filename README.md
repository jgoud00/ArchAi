# 🏗️ ArchitectAI — Construction Management Platform

> A comprehensive web-based platform for architects, engineers, and supervisors to manage construction projects, upload drone scans, track budgets, handle documents, manage inventory, sketch blueprints, and collaborate effectively.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Database Overview](#-database-overview)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Running the Project](#-running-the-project)
- [Build Instructions](#-build-instructions)
- [Environment Variables](#-environment-variables)
- [Supabase Setup Guide](#-supabase-setup-guide)
- [Authentication Guide](#-authentication-guide)
- [Screenshots](#-screenshots)
- [TODO / Roadmap](#-todo--roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

ArchitectAI is a modern, full-featured construction management platform designed to streamline project workflows for construction teams. The platform enables real-time collaboration, comprehensive project tracking, and efficient resource management through an intuitive web interface.

### Core Capabilities

- **Project Management**: Create, organize, and track multiple construction projects
- **Team Collaboration**: Invite team members, assign roles, and manage permissions
- **Document Management**: Upload, organize, and share project documents
- **Budget Tracking**: Monitor expenses, track budgets, and generate financial reports
- **Visual Documentation**: Upload drone scans, progress photos, and sketch blueprints
- **Issue Tracking**: Report, track, and resolve project issues with priority levels
- **Inventory Management**: Track materials and resources across projects
- **Timeline Planning**: Create and manage project timelines with Gantt charts
- **Role-Based Access**: Secure access control with Admin, Supervisor, and User roles

---

## ✨ Key Features

### ✅ Implemented Features

#### Authentication & Authorization
- [x] User registration and login
- [x] Password reset functionality
- [x] Role-based access control (Admin, Supervisor, User)
- [x] Protected routes and permission guards
- [x] Session management with Supabase Auth

#### Project Management
- [x] Create, view, update, and delete projects
- [x] Project status tracking (active, completed, archived)
- [x] Project dashboard with statistics
- [x] Team member management (owner, editor, viewer roles)
- [x] Project activity logging

#### Drone Scans & Media
- [x] Upload drone scan images and videos
- [x] View and manage scan library
- [x] Progress photo gallery
- [x] Media organization by project

#### Budget & Expense Tracking
- [x] Budget creation and management
- [x] Expense tracking (material and labour)
- [x] Budget vs. actual cost comparison
- [x] Expense categorization and reporting

#### Document Management
- [x] File upload and storage
- [x] Document organization by category
- [x] File preview and download
- [x] Document metadata tracking

#### Blueprint Sketching
- [x] Canvas-based blueprint editor
- [x] Drawing tools (lines, rectangles)
- [x] Save and load blueprints
- [x] Export blueprints as images

#### Issue Tracking
- [x] Create and manage project issues
- [x] Priority levels (low, medium, high)
- [x] Status tracking (open, in_progress, resolved)
- [x] Issue photo attachments
- [x] Issue detail views

#### Inventory Management
- [x] Track inventory items by project
- [x] Quantity and unit management
- [x] Category organization
- [x] Inventory updates and edits

#### Timeline & Tasks
- [x] Gantt chart visualization
- [x] Task creation and management
- [x] Task status tracking (pending, in_progress, completed)
- [x] Date range management

#### Admin Features
- [x] User management panel
- [x] Role assignment and updates
- [x] System-wide project oversight
- [x] User activity monitoring

### 🚧 Partially Implemented Features

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app support
- [ ] Email notifications
- [ ] Advanced blueprint tools (shapes, text, layers)
- [ ] Export reports (PDF, Excel)
- [ ] Integration with external tools

### 📅 Planned Features

- [ ] 3D model viewer for blueprints
- [ ] AI-powered progress analysis from drone scans
- [ ] Automated budget alerts
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Calendar integration
- [ ] API for third-party integrations
- [ ] Mobile responsive improvements
- [ ] Dark mode theme
- [ ] Project templates

---

## 👥 User Roles

The platform supports three distinct user roles with different permission levels:

| Role | Permissions | Use Case |
|------|------------|----------|
| **Admin** | • Full system access<br>• Manage all users and roles<br>• View all projects<br>• System configuration | System administrators and platform managers |
| **Supervisor** | • View all projects<br>• Manage assigned projects<br>• Create and edit projects<br>• Manage team members | Project supervisors and managers |
| **User** | • Create own projects<br>• View assigned projects<br>• Collaborate on team projects<br>• Limited editing permissions | Regular users, architects, engineers |

### Role-Based Access Matrix

| Feature | Admin | Supervisor | User |
|---------|:-----:|:----------:|:----:|
| View all projects | ✅ | ✅ | ❌ |
| Create projects | ✅ | ✅ | ✅ |
| Edit own projects | ✅ | ✅ | ✅ |
| Edit any project | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ |
| View admin panel | ✅ | ❌ | ❌ |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.2.2 | Type safety and developer experience |
| **Vite** | 7.2.4 | Build tool and dev server |
| **React Router DOM** | 6.20.0 | Client-side routing |
| **Tailwind CSS** | 3.3.6 | Utility-first CSS framework |
| **Lucide React** | 0.294.0 | Icon library |
| **Zustand** | 4.4.7 | State management |
| **React Hook Form** | 7.48.2 | Form handling |
| **Zod** | 3.22.4 | Schema validation |
| **Recharts** | 3.5.0 | Chart library |
| **Frappe Gantt** | 1.0.4 | Gantt chart visualization |
| **React Dropzone** | 14.2.3 | File upload handling |
| **html2canvas** | 1.4.1 | Canvas to image conversion |
| **jsPDF** | 3.0.4 | PDF generation |
| **date-fns** | 2.30.0 | Date manipulation |

### Backend & Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database (via Supabase) |
| **Supabase Auth** | Authentication and authorization |
| **Supabase Storage** | File storage for scans, documents, photos |
| **Row Level Security (RLS)** | Database-level access control |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **TypeScript ESLint** | TypeScript-specific linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

---

## 🗄️ Database Overview

The platform uses PostgreSQL via Supabase with the following schema:

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User profiles and authentication | `id`, `email`, `display_name`, `role`, `avatar` |
| **projects** | Construction projects | `id`, `name`, `description`, `owner_id`, `status` |
| **team_members** | Project team assignments | `project_id`, `user_id`, `role` |
| **scans** | Drone scan uploads | `project_id`, `name`, `url`, `type`, `uploaded_by` |

### Feature Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **issues** | Project issue tracking | `project_id`, `title`, `priority`, `status`, `photo_url` |
| **progress_photos** | Construction progress photos | `project_id`, `photo_url`, `caption`, `uploaded_by` |
| **budgets** | Project budget tracking | `project_id`, `estimated_cost`, `actual_cost` |
| **expenses** | Project expenses | `project_id`, `type`, `name`, `amount`, `date` |
| **documents** | Project document storage | `project_id`, `name`, `file_url`, `file_type` |
| **blueprints** | Blueprint sketches | `project_id`, `png_url`, `json_url` |
| **inventory** | Inventory item tracking | `project_id`, `item_name`, `quantity`, `unit`, `category` |
| **tasks** | Project timeline tasks | `project_id`, `task_name`, `start_date`, `end_date`, `status` |

### Extended Tables (Schema v2)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **project_files** | Enhanced file management | `project_id`, `name`, `file_url`, `category`, `description` |
| **project_comments** | Project comments/notes | `project_id`, `user_id`, `content` |
| **project_activities** | Activity logging | `project_id`, `user_id`, `activity_type`, `description`, `metadata` |

### Database Features

- **Row Level Security (RLS)**: All tables have RLS enabled for secure data access
- **Foreign Key Constraints**: Ensures data integrity across relationships
- **Indexes**: Optimized queries for performance
- **Triggers**: Automatic `updated_at` timestamp management
- **Functions**: Helper functions for role checking (`is_admin()`, `is_supervisor_or_admin()`)

---

## 📁 Project Structure

```
DTI/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Sidebar, Topbar, MainLayout)
│   │   ├── ui/             # Base UI components (Button, Card, Modal, etc.)
│   │   ├── ProjectCard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── FileUpload.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Settings.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── Documentation.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── projects/       # Project-specific pages
│   │       ├── IssuesList.tsx
│   │       ├── NewIssue.tsx
│   │       ├── IssueDetail.tsx
│   │       ├── ProgressPhotos.tsx
│   │       ├── Budget.tsx
│   │       ├── AddExpense.tsx
│   │       ├── Documents.tsx
│   │       ├── BlueprintSketcher.tsx
│   │       ├── Inventory.tsx
│   │       ├── Timeline.tsx
│   │       └── NewTask.tsx
│   ├── services/           # API service layer
│   │   ├── supabase.ts     # Supabase client configuration
│   │   ├── auth.ts         # Authentication services
│   │   ├── projects.ts     # Project CRUD operations
│   │   ├── files.ts        # File upload/download
│   │   ├── storage.ts      # Storage bucket operations
│   │   ├── issues.ts       # Issue management
│   │   ├── progressPhotos.ts
│   │   ├── budgets.ts      # Budget operations
│   │   ├── expenses.ts     # Expense management
│   │   ├── documents.ts    # Document operations
│   │   ├── blueprints.ts   # Blueprint operations
│   │   ├── inventory.ts    # Inventory management
│   │   ├── tasks.ts        # Task management
│   │   ├── userManagement.ts # Admin user management
│   │   └── ...
│   ├── store/              # State management
│   │   └── authStore.ts    # Authentication state (Zustand)
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   └── useToast.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── cn.ts           # Class name utilities
│   │   └── validators.ts   # Zod validation schemas
│   ├── config/             # Configuration files
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_new_modules.sql
│   │   ├── 003_add_user_roles.sql
│   │   ├── 004_create_test_users.sql
│   │   ├── 005_create_admin_supervisor_accounts.sql
│   │   └── 006_fix_projects_rls.sql
│   ├── schema.sql          # Base schema
│   ├── schema_v2.sql       # Enhanced schema
│   └── storage-policies.sql # Storage bucket policies
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

---

## 🚀 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Git**
- **Supabase account** (free tier available)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DTI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials (see [Environment Variables](#-environment-variables))

4. **Set up Supabase database**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the migrations in order (see [Supabase Setup Guide](#-supabase-setup-guide))

5. **Configure Supabase Storage**
   - Create storage buckets for `scans`, `documents`, `photos`, and `blueprints`
   - Set up storage policies (see `supabase/storage-policies.sql`)

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

This command:
- Starts the Vite development server
- Enables hot module replacement (HMR)
- Opens the app at `http://localhost:5173`
- Watches for file changes and auto-reloads

### Preview Production Build

```bash
npm run build
npm run preview
```

This builds the project and serves it locally to preview the production build.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

---

## 📦 Build Instructions

### Production Build

1. **Build the project**
   ```bash
   npm run build
   ```

   This command:
   - Compiles TypeScript
   - Bundles the application with Vite
   - Optimizes assets
   - Generates production-ready files in `dist/` directory

2. **Deploy the `dist/` folder**
   - Deploy to platforms like:
     - **Vercel**: `vercel deploy`
     - **Netlify**: Drag and drop `dist/` folder
     - **AWS S3 + CloudFront**: Upload `dist/` contents
     - **GitHub Pages**: Configure GitHub Actions
     - Any static hosting service

### Build Output

The build process generates:
- Optimized JavaScript bundles
- Minified CSS
- Static assets (images, fonts, etc.)
- `index.html` entry point

### Environment-Specific Builds

For different environments, create separate `.env` files:
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for server-side operations only)
# VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Security Notes

- ⚠️ **Never commit** `.env` files to version control
- ⚠️ The `anon` key is safe for client-side use (protected by RLS)
- ⚠️ The `service_role` key should **never** be exposed in client-side code
- ✅ Add `.env` to `.gitignore`

---

## 🗄️ Supabase Setup Guide

### 1. Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize

### 2. Run Database Migrations

Execute the migrations in order:

```bash
# Option 1: Using Supabase CLI (Recommended)
supabase db push

# Option 2: Manual execution via Supabase Dashboard
# Go to SQL Editor and run each migration file in order:
# 1. 001_initial_schema.sql
# 2. 002_new_modules.sql
# 3. 003_add_user_roles.sql
# 4. 004_create_test_users.sql (optional)
# 5. 005_create_admin_supervisor_accounts.sql (optional)
# 6. 006_fix_projects_rls.sql
```

### 3. Set Up Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create the following buckets:
   - `scans` - For drone scan uploads
   - `documents` - For project documents
   - `photos` - For progress photos
   - `blueprints` - For blueprint images

3. Configure bucket policies:
   - Run `supabase/storage-policies.sql` in SQL Editor
   - Or configure via Dashboard: **Storage** → **Policies**

### 4. Enable Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up password reset redirect URL

### 5. Configure Row Level Security

RLS is automatically enabled by migrations, but verify:
- Go to **Table Editor**
- Check that RLS is enabled on all tables
- Review policies in **Authentication** → **Policies**

### 6. Create Helper Functions

The migrations create these functions:
- `is_admin(user_uuid)` - Check if user is admin
- `is_supervisor_or_admin(user_uuid)` - Check supervisor/admin status
- `is_project_member(project_id, user_uuid)` - Check project membership

Verify they exist in **Database** → **Functions**.

---

## 🔑 Authentication Guide

### User Registration

1. Navigate to `/signup`
2. Enter email and password
3. Click "Sign Up"
4. Verify email (if email verification is enabled)
5. User is created with default `user` role

### User Login

1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. Session is stored automatically

### Password Reset

1. Navigate to `/forgot-password`
2. Enter email address
3. Check email for reset link
4. Click link to navigate to `/reset-password`
5. Enter new password

### Role Assignment

**For Admins:**
1. Log in as admin
2. Navigate to `/admin`
3. Find user in list
4. Click "Edit Role"
5. Select new role (admin, supervisor, user)
6. Save changes

**Via Database (for initial setup):**
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Session Management

- Sessions are managed by Supabase Auth
- Tokens are automatically refreshed
- Sessions persist across browser restarts
- Logout clears session and redirects to login

---

## 📸 Screenshots

> **Note**: Add screenshots of your application here. Suggested screenshots:

### Dashboard
![Dashboard View](./screenshots/dashboard.png)
*Main dashboard showing project overview and statistics*

### Project Detail
![Project Detail](./screenshots/project-detail.png)
*Individual project page with all modules*

### Blueprint Sketcher
![Blueprint Sketcher](./screenshots/blueprint-sketcher.png)
*Interactive blueprint drawing tool*

### Budget Tracking
![Budget Tracking](./screenshots/budget.png)
*Budget and expense management interface*

### Issue Tracking
![Issue Tracking](./screenshots/issues.png)
*Project issue management with priorities*

### Admin Panel
![Admin Panel](./screenshots/admin-panel.png)
*User management and role assignment*

---

## 📋 TODO / Roadmap

### Short-term (Next Release)

- [ ] Add real-time notifications using Supabase Realtime
- [ ] Implement advanced search and filtering
- [ ] Add export functionality (PDF reports, Excel exports)
- [ ] Improve mobile responsiveness
- [ ] Add dark mode theme
- [ ] Enhance blueprint editor with more drawing tools
- [ ] Add email notifications for important events

### Medium-term (Future Releases)

- [ ] 3D model viewer integration
- [ ] AI-powered progress analysis from drone scans
- [ ] Automated budget alerts and warnings
- [ ] Calendar integration for task scheduling
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics and reporting dashboard
- [ ] Project templates for quick setup
- [ ] Mobile app (React Native)

### Long-term (Vision)

- [ ] API for third-party integrations
- [ ] Webhook support for external systems
- [ ] Advanced collaboration features (comments, mentions)
- [ ] Integration with construction management tools
- [ ] Machine learning for project risk prediction
- [ ] IoT device integration for real-time monitoring

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Add comments for complex logic
- Follow existing code style and patterns

### Pull Request Process

1. Ensure all tests pass (if applicable)
2. Update documentation if needed
3. Request review from maintainers
4. Address feedback and suggestions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 📞 Support

For support, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation page in the app (`/documentation`)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Powered by [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for construction professionals**

