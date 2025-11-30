# Contributing to ArchitectAI

Thank you for your interest in contributing to ArchitectAI! We welcome contributions from the community to help make this the best construction management platform.

## Code of Conduct

Please be respectful and considerate of others. We strive to create a welcoming and inclusive environment.

## Development Standards

To maintain code quality and consistency, please adhere to the following standards:

### TypeScript
- **Strict Mode**: TypeScript strict mode is enabled. Do not disable it.
- **No `any`**: Avoid using the `any` type. Use `unknown` or define proper interfaces/types.
- **Interfaces**: Define interfaces for all props, state, and API responses. Place reusable types in `src/types/`.

### Styling
- **Tailwind CSS**: Use Tailwind CSS for all styling. Avoid inline styles (`style={{ ... }}`) unless absolutely necessary for dynamic values.
- **Shadcn UI**: Use the provided UI components in `src/components/ui/` whenever possible.
- **Responsiveness**: Ensure designs are responsive and work on mobile, tablet, and desktop.

### State Management
- **Global State**: Use **Zustand** for global application state (e.g., user session, theme, project data).
- **Local State**: Use React's `useState` or `useReducer` for component-local state.
- **Server State**: Use `useEffect` or dedicated data fetching hooks for server data.

### Component Structure
- **Functional Components**: Use React functional components with hooks.
- **Props**: Destructure props in the function signature.
- **Naming**: Use PascalCase for component filenames and function names (e.g., `ProjectCard.tsx`).

## Branching Strategy

- **`main`**: The production-ready branch. Do not push directly to `main`.
- **Feature Branches**: Create a new branch for each feature or fix.
  - Format: `feat/feature-name` or `fix/bug-description`
  - Example: `feat/add-dashboard-stats`, `fix/calendar-drag-drop`

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Example:**
```
feat: add drag-and-drop to timeline
fix: resolve z-index issue in modal
docs: update readme with architecture diagram
```

## Pull Request Process

1.  **Fork** the repository and create your branch from `main`.
2.  **Implement** your changes, adhering to the coding standards.
3.  **Test** your changes locally.
4.  **Push** your branch to your fork.
5.  **Open a Pull Request** (PR) to the `main` branch.
6.  **Description**: Provide a clear description of what the PR does and link to any relevant issues.
7.  **Review**: Wait for a code review. Address any feedback provided.

## Supabase Integration

- **Migrations**: If you change the database schema, include a migration file in `supabase/migrations/`.
- **Types**: Update TypeScript types to reflect schema changes.
- **RLS**: Ensure Row Level Security (RLS) policies are updated if adding new tables or changing access patterns.

## Testing

- Write unit tests for utility functions and complex logic.
- Write component tests for critical UI elements.
- Ensure all tests pass before submitting a PR.

Happy Coding!
