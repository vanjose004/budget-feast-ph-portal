export const EVENT_TYPES = [
  'Birthday',
  'Christening',
  'Wedding',
  'Debut',
  'Anniversary',
  'Corporate',
  'Others',
] as const

export const PAYMENT_SCHEMES = ['Full Payment', '50-50', 'Negotiated'] as const

export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'] as const

export const PAYMENT_TYPES = ['Reservation', '2nd Payment', 'Full Payment'] as const

export const PAYMENT_MODES = ['Cash', 'GCash', 'Bank Transfer'] as const

export const EXPENSE_CATEGORIES = ['Food Cost', 'Transport', 'Labor', 'Supplies', 'Others'] as const

export interface PackageOption {
  name: string
  pax: number | null
  price: number | null
}

export const PACKAGES: PackageOption[] = [
  { name: 'Starter Feast', pax: 50, price: 18000 },
  { name: 'Classic Feast', pax: 70, price: 22000 },
  { name: 'Grand Feast', pax: 100, price: 27000 },
  { name: 'Custom', pax: null, price: null },
]

export function packageLabel(pkg: PackageOption) {
  if (pkg.pax === null || pkg.price === null) return pkg.name
  return `${pkg.name} ${pkg.pax}pax ₱${pkg.price.toLocaleString('en-PH')}`
}

const SETTINGS_PRICE_KEYS: Record<string, string> = {
  'Starter Feast': 'package_starter_price',
  'Classic Feast': 'package_classic_price',
  'Grand Feast': 'package_grand_price',
}

export function packagesFromSettings(settings: Record<string, string>): PackageOption[] {
  return PACKAGES.map((pkg) => {
    const key = SETTINGS_PRICE_KEYS[pkg.name]
    const override = key ? settings[key] : undefined
    if (!override) return pkg
    const price = Number(override)
    return Number.isFinite(price) ? { ...pkg, price } : pkg
  })
}

export function computePaymentStatus(totalAmount: number, amountPaid: number): 'Unpaid' | 'Partial' | 'Paid' {
  if (amountPaid <= 0) return 'Unpaid'
  if (totalAmount > 0 && amountPaid >= totalAmount) return 'Paid'
  return 'Partial'
}
