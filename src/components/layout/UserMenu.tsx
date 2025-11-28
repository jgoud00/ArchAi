import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (!user) return null

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors outline-none focus:ring-2 focus:ring-primary"
            >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground leading-none">
                        {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {user.role || 'Member'}
                    </p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-800 bg-slate-900 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-800 md:hidden">
                        <p className="text-sm font-medium text-white">
                            {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {user.email}
                        </p>
                    </div>

                    <div className="p-1">
                        <button
                            onClick={() => {
                                navigate('/settings')
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
