<!-- 
  ARCHITECT_AI README
  Theme: Neon Blue & Slate
  Style: Premium, Animated, Interactive
-->

<div align="center">
  <!-- Animated Header Banner -->
  <img src="docs/media/header-banner.svg" width="100%" alt="ArchitectAI Banner" />

  <!-- Typing Effect Intro -->
  <h1>
    <a href="https://github.com/jgoud00/ArchAi">
      <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=700&size=40&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=ArchitectAI;Construction+Management+Platform;Build+The+Future" alt="Typing SVG" />
    </a>
  </h1>

  <!-- Motion Badges -->
  <p>
    <a href="#">
      <img src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github" height="30" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=open-source-initiative" height="30" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/stack-React_%7C_Supabase_%7C_Tailwind-blueviolet?style=for-the-badge&logo=react" height="30" />
    </a>
  </p>

  <p align="center">
    <br />
    <b>A comprehensive, enterprise-grade platform for the modern construction era.</b>
    <br />
    <i>Streamline workflows. Visualize progress. Control budgets.</i>
    <br />
  </p>
</div>

<br />

<!-- Animated Divider -->
<img src="docs/media/divider.svg" width="100%" />

<br />

## 📋 Table of Contents

<details>
<summary><b>Click to Expand</b></summary>

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

</details>

<br />

## 🎯 Overview

**ArchitectAI** modernizes construction management by replacing fragmented tools with a centralized solution. Whether you are managing a single residential build or a portfolio of commercial projects, ArchitectAI provides the real-time visibility and control needed to deliver on time and on budget.

<table>
  <tr>
    <td width="60%">
      <h3>Why ArchitectAI?</h3>
      <ul>
        <li><b>Centralized Data</b>: All project data, from blueprints to budgets, in one place.</li>
        <li><b>Real-time Collaboration</b>: Seamless communication between field and office teams.</li>
        <li><b>Visual Documentation</b>: Integrated drone scans and progress photos.</li>
        <li><b>Role-Based Security</b>: Granular access control for Admins, Supervisors, and Users.</li>
      </ul>
    </td>
    <td width="40%">
      <img src="docs/media/demo-dashboard.svg" alt="Dashboard Preview" width="100%" />
    </td>
  </tr>
</table>

<br />

<!-- Animated Divider -->
<img src="docs/media/divider.svg" width="100%" />

<br />

## ✨ Key Features

<div align="center">

| Feature | Description | Preview |
|:---:|---|:---:|
| **📊 Project Management** | Create, track, and manage multiple projects with status indicators and dashboards. | <img src="docs/media/demo-project.svg" width="50" /> |
| **💰 Budget Tracking** | Real-time budget monitoring with expense categorization and alert thresholds. | <img src="docs/media/demo-budget.svg" width="50" /> |
| **📑 Document Control** | Secure upload, storage, and versioning for blueprints, contracts, and permits. | <img src="docs/media/demo-docs.svg" width="50" /> |
| **📸 Visual Progress** | Upload and organize drone scans and site photos to track construction milestones. | <img src="docs/media/demo-media.svg" width="50" /> |
| **✏️ Blueprint Sketcher** | Built-in canvas tool for quick sketches and annotations on blueprints. | <img src="docs/media/demo-blueprint.svg" width="50" /> |

</div>

<br />

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,supabase,postgres,docker,figma&perline=8" />
</div>

### Frontend
*   **Framework**: React 18 + TypeScript
*   **Styling**: Tailwind CSS + shadcn/ui
*   **State**: Zustand
*   **Visuals**: Recharts, Frappe Gantt

### Backend
*   **Core**: Supabase (PostgreSQL)
*   **Auth**: Supabase Auth (RLS enabled)
*   **Storage**: Supabase Storage Buckets

<br />

<!-- Animated Divider -->
<img src="docs/media/divider.svg" width="100%" />

<br />

## 🏗️ Architecture

ArchitectAI follows a modern **Client-Server** architecture leveraging Supabase as a backend-as-a-service.

<div align="center">
  <img src="docs/media/architecture.svg" width="80%" alt="Architecture Diagram" />
</div>

<br />

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   Git
*   Supabase Account

### Installation

<details>
<summary><b>View Installation Steps</b></summary>

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/architect-ai.git
    cd architect-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    ```bash
    cp .env.example .env
    ```

</details>

<br />

## 🔐 Environment Variables

Configure your `.env` file with the following keys. **Do not commit this file.**

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

> **Note**: You can find these credentials in your Supabase Dashboard under `Settings > API`.

<br />

## 🏃 Running Locally

### Development Server
Start the Vite development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Production Build
Build the application for production:
```bash
npm run build
```

<br />

## 📂 Project Structure

```bash
src/
├── components/       # Reusable UI components (Layouts, UI Kit)
├── pages/            # Application routes (Dashboard, Projects, etc.)
├── services/         # API services for Supabase interaction
├── store/            # Global state management (Zustand)
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces and types
├── utils/            # Helper functions and validators
└── App.tsx           # Main application entry point
```

<br />

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  **Fork** the repository.
2.  Create a **Feature Branch** (`git checkout -b feature/NewFeature`).
3.  **Commit** your changes (`git commit -m 'Add some NewFeature'`).
4.  **Push** to the branch (`git push origin feature/NewFeature`).
5.  Open a **Pull Request**.

<br />

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

<br />

<div align="center">
  <img src="docs/media/footer-logo.svg" width="50" />
  <br />
  <b>ArchitectAI</b> — Built for the future of construction.
</div>
