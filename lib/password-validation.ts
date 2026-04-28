export interface PasswordStrength {
  isValid: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong'
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length

  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (metRequirements <= 2) strength = 'weak'
  else if (metRequirements === 3) strength = 'fair'
  else if (metRequirements === 4) strength = 'good'
  else strength = 'strong'

  const isValid = Object.values(requirements).every(Boolean)

  return {
    isValid,
    strength,
    requirements,
  }
}

export function getStrengthColor(
  strength: 'weak' | 'fair' | 'good' | 'strong'
): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'good':
      return 'bg-blue-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

export function getStrengthLabel(
  strength: 'weak' | 'fair' | 'good' | 'strong'
): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
    default:
      return 'Unknown'
  }
}
