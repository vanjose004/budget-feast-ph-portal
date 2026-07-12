'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSettings } from '@/lib/actions'

export interface SettingsValues {
  business_name: string
  address: string
  contact: string
  package_starter_price: string
  package_classic_price: string
  package_grand_price: string
  [key: string]: string
}

export function SettingsForm({ initialValues }: { initialValues: SettingsValues }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState<SettingsValues>(initialValues)

  function update<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateSettings(values)
        toast.success('Settings saved.')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save settings.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Business Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={values.business_name}
              onChange={(e) => update('business_name', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={values.address} onChange={(e) => update('address', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" value={values.contact} onChange={(e) => update('contact', e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Package Prices</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="package_starter_price">Starter Feast (50pax)</Label>
            <Input
              id="package_starter_price"
              type="number"
              min={0}
              value={values.package_starter_price}
              onChange={(e) => update('package_starter_price', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="package_classic_price">Classic Feast (70pax)</Label>
            <Input
              id="package_classic_price"
              type="number"
              min={0}
              value={values.package_classic_price}
              onChange={(e) => update('package_classic_price', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="package_grand_price">Grand Feast (100pax)</Label>
            <Input
              id="package_grand_price"
              type="number"
              min={0}
              value={values.package_grand_price}
              onChange={(e) => update('package_grand_price', e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
