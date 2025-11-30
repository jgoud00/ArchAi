# Getting Started with ArchitectAI

Welcome to the ArchitectAI developer guide! This document will help you set up your local development environment and get started with contributing to the project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher.
- **npm**: Comes with Node.js.
- **Git**: For version control.
- **VS Code**: Recommended IDE (with ESLint and Prettier extensions).

## Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/architect-ai.git
    cd architect-ai
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your Supabase credentials:

    ```bash
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Run Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Application routes/screens.
- `src/services`: API calls to Supabase.
- `src/store`: Global state management (Zustand).
- `src/types`: TypeScript definitions.

## Common Tasks

### Creating a New Component

1.  Create a new file in `src/components/` (e.g., `MyComponent.tsx`).
2.  Use functional components with TypeScript interfaces for props.
3.  Style using Tailwind CSS classes.

### Adding a New Route

1.  Create a page component in `src/pages/`.
2.  Add the route in `src/App.tsx`.

### Database Changes

1.  Create a migration file in `supabase/migrations/`.
2.  Apply the migration using Supabase CLI or Dashboard.
3.  Update TypeScript types if the schema changed.

## Testing

Run unit tests to ensure your changes don't break existing functionality:

```bash
npm test
```

## Need Help?

Check the `docs/` folder for more detailed documentation or open an issue on GitHub.
