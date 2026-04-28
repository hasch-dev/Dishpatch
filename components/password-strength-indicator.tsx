'use client'

import { PasswordStrength } from '@/lib/password-validation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
}

// Define the keys explicitly to satisfy TypeScript
type RequirementKey = keyof PasswordStrength['requirements']

export function PasswordStrengthIndicator({
  strength,
}: PasswordStrengthIndicatorProps) {
  const isEmpty = Object.values(strength.requirements).every((v) => !v)
  
  const requirementsList: { key: RequirementKey; label: string }[] = [
    { key: 'minLength', label: '12+ Characters' },
    { key: 'hasUppercase', label: 'Uppercase' },
    { key: 'hasLowercase', label: 'Lowercase' },
    { key: 'hasNumber', label: 'Numeric' },
    { key: 'hasSpecialChar', label: 'Symbol' },
  ]

  return (
    <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* 1. ELEGANT STRENGTH GAUGE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground/60">
            Complexity Analysis
          </span>
          {!isEmpty && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "text-[9px] uppercase tracking-[0.2em] font-bold italic",
                strength.strength === 'weak' && "text-destructive",
                strength.strength === 'fair' && "text-orange-400",
                strength.strength === 'good' && "text-primary/80",
                strength.strength === 'strong' && "text-primary"
              )}
            >
              {strength.strength}
            </motion.span>
          )}
        </div>

        {/* Multi-segment bar */}
        <div className="flex gap-1.5 h-[3px] w-full">
          {[1, 2, 3, 4, 5].map((segment) => {
            const activeSegments = Object.values(strength.requirements).filter(Boolean).length
            const isActive = segment <= activeSegments
            
            return (
              <div 
                key={segment}
                className={cn(
                  "h-full flex-1 transition-all duration-700",
                  isActive 
                    ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" 
                    : "bg-primary/10"
                )}
              />
            )
          })}
        </div>
      </div>

      {/* 2. MINIMALIST CHECKLIST */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {requirementsList.map((req) => {
          const isMet = strength.requirements[req.key]
          
          return (
            <div 
              key={req.key} 
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isMet ? "opacity-100" : "opacity-40"
              )}
            >
              <div className={cn(
                "h-1 w-1 rounded-full shrink-0 transition-all",
                isMet ? "bg-primary scale-125" : "bg-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-medium",
                isMet ? "text-foreground font-bold" : "text-muted-foreground"
              )}>
                {req.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 3. SUCCESS MESSAGE */}
      {strength.strength === 'strong' && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 py-2 px-3 border border-primary/20 bg-primary/5 italic"
        >
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-primary font-medium tracking-tight">
            Security standards exceptional.
          </span>
        </motion.div>
      )}
    </div>
  )
}