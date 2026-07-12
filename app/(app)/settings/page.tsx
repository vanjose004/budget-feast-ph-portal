import { supabase } from '@/lib/supabase'
import { SettingsForm, type SettingsValues } from '@/components/settings/settings-form'

export const revalidate = 0

const DEFAULTS: SettingsValues = {
  business_name: 'Budget Feast PH',
  address: 'Sta. Clara, Santa Maria, Bulacan',
  contact: '',
  package_starter_price: '18000',
  package_classic_price: '22000',
  package_grand_price: '27000',
}

export default async function SettingsPage() {
  const { data } = await supabase.from('settings').select('key, value')
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value ?? '']))

  const initialValues: SettingsValues = {
    business_name: map.business_name ?? DEFAULTS.business_name,
    address: map.address ?? DEFAULTS.address,
    contact: map.contact ?? DEFAULTS.contact,
    package_starter_price: map.package_starter_price ?? DEFAULTS.package_starter_price,
    package_classic_price: map.package_classic_price ?? DEFAULTS.package_classic_price,
    package_grand_price: map.package_grand_price ?? DEFAULTS.package_grand_price,
  }

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Business information and package pricing.</p>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <SettingsForm initialValues={initialValues} />
      </div>
    </>
  )
}
