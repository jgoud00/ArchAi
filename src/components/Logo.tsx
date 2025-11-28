import React from 'react'
import { Logo as LogoIcon } from '@/components/ui/Logo'
import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  linkTo?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  linkTo = '/'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const Content = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon className={sizeClasses[size]} />
      {showText && (
        <span className={`font-bold tracking-tight ${textClasses[size]}`}>
          Architect<span className="text-primary">AI</span>
        </span>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-90 transition-opacity">
        <Content />
      </Link>
    )
  }

  return <Content />
}
