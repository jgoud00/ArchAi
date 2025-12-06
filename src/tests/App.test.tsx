import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

describe('App', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )
        // Since App likely redirects to login or shows a landing page, we just check if it renders.
        // We can check for a known element like the "Get Started" button or "Sign In" text.
        // For a smoke test, just ensuring render doesn't throw is a good start.
        expect(document.body).toBeInTheDocument()
    })
})
