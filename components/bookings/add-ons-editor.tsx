import { Input } from '@/components/ui/input'
import {
  EQUIPMENT_ADD_ONS,
  FOOD_ADD_ONS,
  STYLING_ADD_ONS,
  SUPPLIER_ADD_ONS,
  type AddOnsState,
  type EquipmentAddOnKey,
  type FoodAddOnKey,
  type StylingAddOnKey,
  type SupplierAddOnKey,
} from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function AddOnsEditor({
  value,
  onChange,
}: {
  value: AddOnsState
  onChange: (next: AddOnsState) => void
}) {
  function updateFood(key: FoodAddOnKey, qty: number) {
    onChange({ ...value, food: { ...value.food, [key]: qty } })
  }

  function updateEquipment(key: EquipmentAddOnKey, qty: number) {
    onChange({ ...value, equipment: { ...value.equipment, [key]: qty } })
  }

  function toggleStyling(key: StylingAddOnKey) {
    onChange({ ...value, styling: { ...value.styling, [key]: !value.styling[key] } })
  }

  function toggleSupplier(key: SupplierAddOnKey) {
    onChange({ ...value, suppliers: { ...value.suppliers, [key]: !value.suppliers[key] } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Food Add-ons <span className="font-normal text-muted-foreground">(per pax)</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FOOD_ADD_ONS.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">+{formatCurrency(item.pricePerPax)}/pax</p>
              </div>
              <Input
                type="number"
                min={0}
                value={value.food[item.key] || ''}
                onChange={(e) => updateFood(item.key, e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-20"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Equipment Rental</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EQUIPMENT_ADD_ONS.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
              </div>
              <Input
                type="number"
                min={0}
                value={value.equipment[item.key] || ''}
                onChange={(e) => updateEquipment(item.key, e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-20"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Styling &amp; Decor</h3>
        <div className="space-y-2">
          {STYLING_ADD_ONS.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={value.styling[item.key]}
                  onChange={() => toggleStyling(item.key)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                {item.label}
              </span>
              <span className="text-sm text-muted-foreground">{formatCurrency(item.price)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Supplier Add-ons</h3>
        <div className="space-y-2">
          {SUPPLIER_ADD_ONS.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={value.suppliers[item.key]}
                  onChange={() => toggleSupplier(item.key)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                {item.label}
              </span>
              <span className="text-sm text-muted-foreground">{formatCurrency(item.price)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
