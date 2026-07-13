import type { MenuItem } from '@/lib/supabase'
import {
  activeMenuOptions,
  menuCategoryPax,
  visibleMenuCategories,
  type AddOnsState,
  type MenuCategoryKey,
  type SelectedMenu,
} from '@/lib/constants'

export function MenuSelectionEditor({
  value,
  onChange,
  addOns,
  menuItems,
  pax,
}: {
  value: SelectedMenu
  onChange: (next: SelectedMenu) => void
  addOns: AddOnsState
  menuItems: MenuItem[]
  pax: number
}) {
  const categories = visibleMenuCategories(addOns)

  function clear(categoryKey: MenuCategoryKey) {
    const next = { ...value }
    delete next[categoryKey]
    onChange(next)
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const options = activeMenuOptions(menuItems, category.key)
        const selected = value[category.key]

        function select(dishName: string) {
          onChange({
            ...value,
            [category.key]: { dish: dishName, pax: menuCategoryPax(category, addOns, pax) },
          })
        }

        function updatePax(newPax: number) {
          if (!selected) return
          onChange({ ...value, [category.key]: { ...selected, pax: newPax } })
        }

        return (
          <div key={category.key}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {category.label}{' '}
                <span className="font-normal text-muted-foreground">
                  ({category.required ? 'pick 1' : 'optional'})
                </span>
              </h3>
              {!category.required && selected && (
                <button
                  type="button"
                  onClick={() => clear(category.key)}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {options.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                No dishes configured for this category yet. Add some in Settings &rarr; Menu Management.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((item) => {
                  const isSelected = selected?.dish === item.dish_name

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                        isSelected ? 'border-primary' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <label className="flex flex-1 cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={category.key}
                          checked={isSelected}
                          onChange={() => select(item.dish_name)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        {item.dish_name}
                      </label>
                      {isSelected && (
                        <div className="flex shrink-0 items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={selected.pax}
                            onChange={(e) => updatePax(e.target.value === '' ? 0 : Number(e.target.value))}
                            className="w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">pax</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
