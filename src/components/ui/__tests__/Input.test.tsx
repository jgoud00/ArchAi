/**
 * Input Component Tests
 * 
 * Tests for Input component (basic HTML input wrapper)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../Input'

describe('Input Component', () => {
    it('should render input element', () => {
        render(<Input placeholder="Enter text" />)

        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
        render(<Input placeholder="Enter email" />)

        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
        render(<Input className="custom-class" placeholder="Test" />)

        expect(screen.getByPlaceholderText('Test')).toHaveClass('custom-class')
    })

    it('should call onChange handler when value changes', () => {
        const handleChange = vi.fn()
        render(<Input onChange={handleChange} placeholder="Test" />)

        const input = screen.getByPlaceholderText('Test')
        fireEvent.change(input, { target: { value: 'test@example.com' } })

        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
        render(<Input disabled placeholder="Test" />)

        expect(screen.getByPlaceholderText('Test')).toBeDisabled()
    })

    it('should render with correct type', () => {
        const { rerender } = render(<Input type="password" placeholder="Password" />)
        expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')

        rerender(<Input type="email" placeholder="Email" />)
        expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
    })

    it('should have required attribute when required prop is true', () => {
        render(<Input required placeholder="Test" />)

        expect(screen.getByPlaceholderText('Test')).toBeRequired()
    })

    it('should handle blur event', () => {
        const handleBlur = vi.fn()
        render(<Input onBlur={handleBlur} placeholder="Test" />)

        const input = screen.getByPlaceholderText('Test')
        fireEvent.blur(input)

        expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should accept value prop', () => {
        render(<Input value="preset value" onChange={() => { }} placeholder="Test" />)

        const input = screen.getByPlaceholderText('Test') as HTMLInputElement
        expect(input.value).toBe('preset value')
    })

    it('should spread all HTML input attributes', () => {
        render(<Input
            placeholder="Test"
            maxLength={10}
            minLength={3}
            name="testInput"
            id="test-input"
        />)

        const input = screen.getByPlaceholderText('Test')
        expect(input).toHaveAttribute('maxLength', '10')
        expect(input).toHaveAttribute('name', 'testInput')
        expect(input).toHaveAttribute('id', 'test-input')
    })
})
