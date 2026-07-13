import { MENU_CATEGORIES, visibleMenuCategories, type AddOnsState, type SelectedMenu } from '@/lib/constants'

export function MenuSelectionEditor({
  value,
  onChange,
  addOns,
}: {
  value: SelectedMenu
  onChange: (next: SelectedMenu) => void
  addOns: AddOnsState
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
      {categories.map((category) => (
        <div key={category.key}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {category.label}{' '}
              <span className="font-normal text-muted-foreground">{category.required ? '(pick 1)' : '(optional)'}</span>
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {category.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition-colors hover:bg-muted/50"
              >
                <input
                  type="radio"
                  name={category.key}
                  checked={value[category.key] === option}
                  onChange={() => select(category.key, option)}
                  className="h-4 w-4 accent-primary"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
