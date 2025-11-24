import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoIcon from '@/assets/logo.svg'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export const Logo = ({ size = 'md', showText = false, className = '' }: LogoProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-32 w-auto lg:h-40 lg:w-auto'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const handleClick = () => {
    navigate('/')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      aria-label="Navigate to home page"
      aria-current={location.pathname === '/' ? 'page' : undefined}
    >
      <img 
        src={logoIcon} 
        alt="ArchitectAI Logo" 
        className={`${sizeClasses[size]} transition-transform duration-300 ${
          isHovered ? (size === 'lg' ? 'scale-105' : 'scale-110') : 'scale-100'
        }`}
        loading="eager"
      />
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-primary`}>
          ArchitectAI
        </span>
      )}
    </button>
  )
}

