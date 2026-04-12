// List of well-known and trusted email providers
const TRUSTED_EMAIL_DOMAINS = new Set([
  // Major providers
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'protonmail.com',
  'icloud.com',
  'mail.com',
  'zoho.com',
  'tutanota.com',
  'yandex.com',
  'mail.ru',
  'qq.com',
  '163.com',
  'sina.com',
  'foxmail.com',

  // Regional and country-specific
  'gmx.com',
  'web.de',
  'fastweb.it',
  'tiscali.it',
  'virgilio.it',
  'bbox.fr',
  'wanadoo.fr',
  'orange.fr',
  'sfr.fr',
  'free.fr',
  'laposte.net',
  'swisscom.com',
  'bluewin.ch',
  'sunrise.ch',
  'uol.com.br',
  'ig.com.br',
  'hotmail.co.jp',
  'yahoo.co.jp',
  'docomo.ne.jp',

  // Business/Microsoft
  'outlook.com',
  'microsoft.com',
  'office365.com',

  // Other reputable services
  'tutanota.com',
  'protonmail.ch',
  'posteo.de',
  'mailbox.org',
  'fastmail.com',
  'disroot.org',
])

export interface EmailValidation {
  isValid: boolean
  hasAtSign: boolean
  isTrustedDomain: boolean
  domain?: string
  error?: string
}

export function validateEmail(email: string): EmailValidation {
  const trimmedEmail = email.trim().toLowerCase()

  // Check for @ sign
  if (!trimmedEmail.includes('@')) {
    return {
      isValid: false,
      hasAtSign: false,
      isTrustedDomain: false,
      error: 'Email must contain an "@" symbol',
    }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      hasAtSign: true,
      isTrustedDomain: false,
      error: 'Please enter a valid email format',
    }
  }

  // Extract domain
  const domain = trimmedEmail.split('@')[1]

  // Check if domain is trusted
  const isTrustedDomain = TRUSTED_EMAIL_DOMAINS.has(domain)

  if (!isTrustedDomain) {
    return {
      isValid: false,
      hasAtSign: true,
      isTrustedDomain: false,
      domain,
      error: `"${domain}" is not a recognized email provider. Please use a well-known email service like Gmail, Yahoo, or Outlook.`,
    }
  }

  return {
    isValid: true,
    hasAtSign: true,
    isTrustedDomain: true,
    domain,
  }
}
