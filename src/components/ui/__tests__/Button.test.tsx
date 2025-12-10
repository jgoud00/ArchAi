/**
 * Unit tests for Button component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
    it('renders with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click me</Button>)

        await user.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders different variants correctly', () => {
        const { rerender } = render(<Button variant="default">Default</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-primary')

        rerender(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')

        rerender(<Button variant="outline">Outline</Button>)
        expect(screen.getByRole('button')).toHaveClass('border')

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
    })

    it('renders disabled state correctly', () => {
        render(<Button disabled>Disabled</Button>)
        const button = screen.getByRole('button')

        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled:opacity-50')
    })

    it('renders different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-9')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-11')

        rerender(<Button size="icon">Icon</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10')
    })

    it('does not call onClick when disabled', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()

        render(<Button disabled onClick={handleClick}>Disabled</Button>)

        await user.click(screen.getByRole('button'))
        expect(handleClick).not.toHaveBeenCalled()
    })
})

