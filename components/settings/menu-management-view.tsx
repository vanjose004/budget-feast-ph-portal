'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MENU_CATEGORIES, type MenuCategoryKey } from '@/lib/constants'
import { addMenuItem, deleteMenuItem, moveMenuItem, setMenuItemActive } from '@/lib/actions'
import type { MenuItem } from '@/lib/supabase'

function MenuItemRow({ item, isFirst, isLast }: { item: MenuItem; isFirst: boolean; isLast: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function move(direction: 'up' | 'down') {
    startTransition(async () => {
      try {
        await moveMenuItem(item.id, direction)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to reorder dish.')
      }
    })
  }

  function toggleActive() {
    startTransition(async () => {
      try {
        await setMenuItemActive(item.id, !item.is_active)
        toast.success(item.is_active ? 'Dish disabled.' : 'Dish enabled.')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update dish.')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteMenuItem(item.id)
        toast.success(`"${item.dish_name}" removed.`)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove dish.')
      }
    })
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2.5">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => move('up')}
          disabled={isPending || isFirst}
          aria-label="Move up"
          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => move('down')}
          disabled={isPending || isLast}
          aria-label="Move down"
          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className={`flex-1 text-sm ${item.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
        {item.dish_name}
      </span>

      <Button type="button" variant="outline" size="sm" onClick={toggleActive} disabled={isPending}>
        {item.is_active ? 'Disable' : 'Enable'}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete dish"
        >
          <Trash2 className="h-4 w-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove dish?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes &quot;{item.dish_name}&quot;. Past bookings that selected it keep their
              record, but it won&apos;t be selectable anymore. Consider Disable instead if you might bring it back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AddDishForm({ category }: { category: MenuCategoryKey }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dishName, setDishName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = dishName.trim()
    if (!trimmed) return

    startTransition(async () => {
      try {
        await addMenuItem(category, trimmed)
        toast.success(`"${trimmed}" added.`)
        setDishName('')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add dish.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={dishName}
        onChange={(e) => setDishName(e.target.value)}
        placeholder="New dish name"
        className="flex-1"
      />
      <Button type="submit" disabled={isPending || !dishName.trim()} data-icon="inline-start">
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  )
}

export function MenuManagementView({ items }: { items: MenuItem[] }) {
  return (
    <Tabs defaultValue={MENU_CATEGORIES[0].key} className="w-full">
      <TabsList className="flex-wrap">
        {MENU_CATEGORIES.map((category) => (
          <TabsTrigger key={category.key} value={category.key}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {MENU_CATEGORIES.map((category) => {
        const categoryItems = items
          .filter((item) => item.category === category.key)
          .sort((a, b) => a.sort_order - b.sort_order)

        return (
          <TabsContent key={category.key} value={category.key} className="space-y-4 pt-4">
            {categoryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dishes in this category yet.</p>
            ) : (
              <div className="space-y-2">
                {categoryItems.map((item, index) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    isFirst={index === 0}
                    isLast={index === categoryItems.length - 1}
                  />
                ))}
              </div>
            )}
            <AddDishForm category={category.key} />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
