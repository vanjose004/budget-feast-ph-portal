import type { MenuItem } from '@/lib/supabase'

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

export const CUSTOM_EXPENSE_CATEGORY = 'Custom'

export const EXPENSE_CATEGORY_GROUPS = [
  {
    group: 'Marketing',
    categories: ['Facebook Ads', 'Printed Materials (tarpaulin, flyers)', 'Promotions & Giveaways'],
  },
  {
    group: 'Food & Supplies',
    categories: [
      'Food Ingredients',
      'Condiments & Spices',
      'Packaging & Containers',
      'Disposables (plates, cups, utensils)',
    ],
  },
  {
    group: 'Operations',
    categories: ['Transportation / Delivery', 'Gas & Fuel', 'Parking'],
  },
  {
    group: 'Labor',
    categories: ['Waiter / Service Crew', 'Kitchen Staff', 'Extra Manpower'],
  },
  {
    group: 'Equipment',
    categories: ['Equipment Rental', 'Equipment Repair & Maintenance', 'Kitchen Supplies'],
  },
  {
    group: 'Utilities',
    categories: ['Load / Internet', 'Printing & Ink'],
  },
  {
    group: 'Others',
    categories: ['Miscellaneous', CUSTOM_EXPENSE_CATEGORY],
  },
] as const

export function expenseCategoryGroup(category: string | null | undefined): string {
  if (!category) return 'Others'
  for (const group of EXPENSE_CATEGORY_GROUPS) {
    if ((group.categories as readonly string[]).includes(category)) return group.group
  }
  return 'Others'
}

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

export const FOOD_ADD_ONS = [
  { key: 'beef', label: 'Beef dish', pricePerPax: 70 },
  { key: 'pork', label: 'Pork dish', pricePerPax: 60 },
  { key: 'pastaChickenFish', label: 'Pasta/Chicken/Fish dish', pricePerPax: 50 },
  { key: 'extraDessert', label: 'Extra Dessert', pricePerPax: 20 },
] as const

export type FoodAddOnKey = (typeof FOOD_ADD_ONS)[number]['key']

export const EQUIPMENT_ADD_ONS = [
  { key: 'singleChafing', label: 'Single Chafing Dish', price: 100 },
  { key: 'doubleChafing', label: 'Double Chafing Dish', price: 180 },
] as const

export type EquipmentAddOnKey = (typeof EQUIPMENT_ADD_ONS)[number]['key']

export const STYLING_ADD_ONS = [
  { key: 'birthdayChristening', label: 'Birthday/Christening Package', price: 3500 },
  { key: 'elegantCouch', label: '+ Elegant Couch', price: 500 },
  { key: 'entranceArchBalloons', label: '+ Entrance Arch Balloons', price: 500 },
  { key: 'debutStyling', label: 'Debut Styling Package', price: 7500 },
  { key: 'weddingStyling', label: 'Wedding Styling Package', price: 10000 },
] as const

export type StylingAddOnKey = (typeof STYLING_ADD_ONS)[number]['key']

export const SUPPLIER_ADD_ONS = [
  { key: 'otdCoordinator', label: 'Event OTD Coordinator', price: 8000 },
  { key: 'cake1Tier', label: 'Cake 1 Tier', price: 3500 },
  { key: 'cake2Tier', label: 'Cake 2 Tier', price: 6000 },
  { key: 'soundsLights', label: 'Sounds & Lights', price: 6000 },
  { key: 'photographer', label: 'Photographer', price: 5000 },
  { key: 'photobooth', label: 'Photobooth 2hrs', price: 4000 },
  { key: 'hostEmcee', label: 'Host/Emcee Wedding & Debut', price: 5000 },
  { key: 'clown', label: 'Clown', price: 4000 },
] as const

export type SupplierAddOnKey = (typeof SUPPLIER_ADD_ONS)[number]['key']

export interface AddOnsState {
  food: Record<FoodAddOnKey, number>
  equipment: Record<EquipmentAddOnKey, number>
  styling: Record<StylingAddOnKey, boolean>
  suppliers: Record<SupplierAddOnKey, boolean>
}

export function emptyAddOns(): AddOnsState {
  return {
    food: Object.fromEntries(FOOD_ADD_ONS.map((a) => [a.key, 0])) as Record<FoodAddOnKey, number>,
    equipment: Object.fromEntries(EQUIPMENT_ADD_ONS.map((a) => [a.key, 0])) as Record<EquipmentAddOnKey, number>,
    styling: Object.fromEntries(STYLING_ADD_ONS.map((a) => [a.key, false])) as Record<StylingAddOnKey, boolean>,
    suppliers: Object.fromEntries(SUPPLIER_ADD_ONS.map((a) => [a.key, false])) as Record<SupplierAddOnKey, boolean>,
  }
}

export interface AddOnsLineItem {
  label: string
  amount: number
}

export function addOnsBreakdown(addOns: AddOnsState): AddOnsLineItem[] {
  const items: AddOnsLineItem[] = []

  for (const item of FOOD_ADD_ONS) {
    const qty = addOns.food[item.key] || 0
    if (qty > 0) items.push({ label: `${item.label} × ${qty} pax`, amount: qty * item.pricePerPax })
  }
  for (const item of EQUIPMENT_ADD_ONS) {
    const qty = addOns.equipment[item.key] || 0
    if (qty > 0) items.push({ label: `${item.label} × ${qty}`, amount: qty * item.price })
  }
  for (const item of STYLING_ADD_ONS) {
    if (addOns.styling[item.key]) items.push({ label: item.label, amount: item.price })
  }
  for (const item of SUPPLIER_ADD_ONS) {
    if (addOns.suppliers[item.key]) items.push({ label: item.label, amount: item.price })
  }

  return items
}

export function addOnsTotal(addOns: AddOnsState): number {
  return addOnsBreakdown(addOns).reduce((sum, item) => sum + item.amount, 0)
}

export function parseAddOns(raw: string | null | undefined): AddOnsState {
  const empty = emptyAddOns()
  if (!raw) return empty

  try {
    const parsed = JSON.parse(raw)
    return {
      food: { ...empty.food, ...parsed?.food },
      equipment: { ...empty.equipment, ...parsed?.equipment },
      styling: { ...empty.styling, ...parsed?.styling },
      suppliers: { ...empty.suppliers, ...parsed?.suppliers },
    }
  } catch {
    return empty
  }
}

export const MENU_CATEGORIES = [
  { key: 'chicken', label: 'Chicken', required: true, condition: null },
  { key: 'pork', label: 'Pork', required: true, condition: null },
  { key: 'pastaNoodles', label: 'Pasta/Noodles', required: true, condition: null },
  { key: 'beef', label: 'Beef', required: true, condition: 'beef' as FoodAddOnKey },
  { key: 'fishSeafood', label: 'Fish/Seafood', required: true, condition: 'pastaChickenFish' as FoodAddOnKey },
  { key: 'vegetables', label: 'Vegetables', required: false, condition: null },
  { key: 'soup', label: 'Soup', required: false, condition: null },
  { key: 'dessert', label: 'Dessert', required: true, condition: null },
  { key: 'drinks', label: 'Drinks', required: true, condition: null },
] as const

export type MenuCategoryKey = (typeof MENU_CATEGORIES)[number]['key']

export interface SelectedMenuEntry {
  dish: string
  pax: number
}

export type SelectedMenu = Partial<Record<MenuCategoryKey, SelectedMenuEntry>>

export function visibleMenuCategories(addOns: AddOnsState) {
  return MENU_CATEGORIES.filter((category) => {
    if (!category.condition) return true
    return (addOns.food[category.condition] || 0) > 0
  })
}

export function menuCategoryPax(
  category: (typeof MENU_CATEGORIES)[number],
  addOns: AddOnsState,
  basePax: number,
): number {
  if (category.condition) return addOns.food[category.condition] || 0
  return basePax
}

export function activeMenuOptions(items: MenuItem[], categoryKey: MenuCategoryKey): MenuItem[] {
  return items
    .filter((item) => item.category === categoryKey && item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.dish_name.localeCompare(b.dish_name))
}

export function parseSelectedMenu(raw: string | null | undefined): SelectedMenu {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const result: SelectedMenu = {}
    for (const key of Object.keys(parsed) as MenuCategoryKey[]) {
      const entry = parsed[key]
      if (typeof entry === 'string') {
        // Backward compatibility with the previous format, which stored just the dish name.
        result[key] = { dish: entry, pax: 0 }
      } else if (entry && typeof entry === 'object' && typeof entry.dish === 'string') {
        result[key] = { dish: entry.dish, pax: Number(entry.pax) || 0 }
      }
    }
    return result
  } catch {
    return {}
  }
}

export function selectedMenuBreakdown(selectedMenu: SelectedMenu): { label: string; dish: string; pax: number }[] {
  return MENU_CATEGORIES.filter((category) => selectedMenu[category.key]).map((category) => {
    const entry = selectedMenu[category.key] as SelectedMenuEntry
    return { label: category.label, dish: entry.dish, pax: entry.pax }
  })
}
