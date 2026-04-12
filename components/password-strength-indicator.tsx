import { PasswordStrength, getStrengthColor, getStrengthLabel } from '@/lib/password-validation'
import { CheckCircle2, Circle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength

}

export function PasswordStrengthIndicator({
  strength,
}: PasswordStrengthIndicatorProps) {

  const isEmpty = Object.values(strength.requirements).every(v => !v)

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Password Strength
          </span>
          <span
            className={`text-xs font-semibold ${
              strength.strength === 'weak'
                ? 'text-red-600'
                : strength.strength === 'fair'
                  ? 'text-yellow-600'
                  : strength.strength === 'good'
                    ? 'text-blue-600'
                    : 'text-green-600'
            }`}
          >
            {isEmpty ? '' : getStrengthLabel(strength.strength)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(strength.strength)}`}
            style={{
              width: `${(Object.values(strength.requirements).filter(Boolean).length / 5) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Password must contain:
        </p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            {strength.requirements.minLength ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-xs ${
                strength.requirements.minLength
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              At least 12 characters
            </span>
          </li>
          <li className="flex items-center gap-2">
            {strength.requirements.hasUppercase ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-xs ${
                strength.requirements.hasUppercase
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              One uppercase letter (A-Z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            {strength.requirements.hasLowercase ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-xs ${
                strength.requirements.hasLowercase
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              One lowercase letter (a-z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            {strength.requirements.hasNumber ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-xs ${
                strength.requirements.hasNumber
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              One number (0-9)
            </span>
          </li>
          <li className="flex items-center gap-2">
            {strength.requirements.hasSpecialChar ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-xs ${
                strength.requirements.hasSpecialChar
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              One special character (!@#$%^&* etc)
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
