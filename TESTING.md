# Testing Guide

This document outlines how to run tests for the ArchitectAI platform. We use **Vitest** for unit and integration testing and **React Testing Library** for component testing.

## Prerequisites

Ensure you have installed the dependencies:

```bash
npm install
```

## Running Tests

### Run All Tests
To run all tests in the project:

```bash
npm test
```

### Run Tests in Watch Mode
To run tests and watch for file changes (useful during development):

```bash
npm run test:watch
```

### Run Tests with Coverage
To generate a code coverage report:

```bash
npm run test:coverage
```

### Run UI Interface
To open the Vitest UI:

```bash
npm run test:ui
```

## Writing Tests

### Unit Tests
Place unit tests alongside the file they test or in a `__tests__` directory. Use the `.test.ts` or `.spec.ts` extension.

**Example (`src/utils/math.test.ts`):**
```typescript
import { describe, it, expect } from 'vitest'
import { add } from './math'

describe('add', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3)
  })
})
```

### Component Tests
Use React Testing Library to test components. Use the `.test.tsx` extension.

**Example (`src/components/Button.test.tsx`):**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Continuous Integration

Tests are automatically run on every Pull Request via GitHub Actions. Ensure all tests pass before merging.
