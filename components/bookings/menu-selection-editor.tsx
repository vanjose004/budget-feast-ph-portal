import type { MenuItem } from '@/lib/supabase'
import {
  MENU_CATEGORIES,
  activeMenuOptions,
  visibleMenuCategories,
  type AddOnsState,
  type SelectedMenu,
} from '@/lib/constants'

export function MenuSelectionEditor({
  value,
  onChange,
  addOns,
  menuItems,
}: {
  value: SelectedMenu
  onChange: (next: SelectedMenu) => void
  addOns: AddOnsState
  menuItems: MenuItem[]
}) {
  const categories = visibleMenuCategories(addOns)

  function select(categoryKey: (typeof MENU_CATEGORIES)[number]['key'], option: string) {
    onChange({ ...value, [categoryKey]: option })
  }

  function clear(categoryKey: (typeof MENU_CATEGORIES)[number]['key']) {
    const next = { ...value }
    delete next[categoryKey]
    onChange(next)
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const options = activeMenuOptions(menuItems, category.key)

        return (
          <div key={category.key}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {category.label}{' '}
                <span className="font-normal text-muted-foreground">
                  {category.required ? '(pick 1)' : '(optional)'}
                </span>
              </h3>
              {!category.required && value[category.key] && (
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
                {options.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="radio"
                      name={category.key}
                      checked={value[category.key] === item.dish_name}
                      onChange={() => select(category.key, item.dish_name)}
                      className="h-4 w-4 accent-primary"
                    />
                    {item.dish_name}
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
