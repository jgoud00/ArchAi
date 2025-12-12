import { memo, ReactNode } from 'react';

/**
 * Props for the AuthLayout component
 */
interface AuthLayoutProps {
    /** Form content to display on the left side */
    children: ReactNode;
    /** Optional visual/branding content for the right side */
    visualContent?: ReactNode;
}

/**
 * AuthLayout - Split-screen layout for authentication pages
 * 
 * @description Provides a responsive two-column layout with:
 * - Left side: Form content area with decorative gradients
 * - Right side: Visual branding area (hidden on mobile)
 * 
 * @example
 * ```tsx
 * <AuthLayout visualContent={<Testimonial />}>
 *   <LoginForm />
 * </AuthLayout>
 * ```
 * 
 * @param props - Component props
 * @param props.children - Form content for the left side
 * @param props.visualContent - Optional branding content for right side
 */
export const AuthLayout = memo(({ children, visualContent }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
            {/* Left Side (Form Area) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
                </div>
                {children}
            </div>

            {/* Right Side (Visual Area) */}
            <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/20" />
                <div className="blueprint-grid absolute inset-0 opacity-20" />

                {/* Abstract Shapes */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse-slow delay-1000" />

                {visualContent && (
                    <div className="relative z-10 max-w-lg text-center">
                        {visualContent}
                    </div>
                )}
            </div>
        </div>
    );
});

AuthLayout.displayName = 'AuthLayout';
