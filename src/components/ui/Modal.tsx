import * as React from "react"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "./Button"
import FocusTrap from "focus-trap-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'

      // Focus close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 0)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={cn(
            "relative z-50 w-full max-w-lg bg-background rounded-lg shadow-lg p-4 lg:p-6 mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6"
                aria-label="Close modal"
                title="Close modal"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
          {children}
        </div>
      </div>
    </FocusTrap>
  )
}
