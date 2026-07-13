'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CUSTOM_EXPENSE_CATEGORY, EXPENSE_CATEGORY_GROUPS } from '@/lib/constants'
import { addExpense } from '@/lib/actions'

const today = () => new Date().toISOString().slice(0, 10)

export function AddExpenseDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState(today())
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const isCustom = category === CUSTOM_EXPENSE_CATEGORY

  function reset() {
    setDate(today())
    setCategory('')
    setCustomCategory('')
    setDescription('')
    setAmount('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      toast.error('Enter a valid expense amount.')
      return
    }

    const finalCategory = isCustom ? customCategory.trim() : category

    if (isCustom && !finalCategory) {
      toast.error('Enter a name for the custom category.')
      return
    }

    startTransition(async () => {
      try {
        await addExpense({ date, category: finalCategory, description, amount: numericAmount })
        toast.success('Expense added.')
        reset()
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add expense.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button data-icon="inline-start" />}>
        <Plus className="h-4 w-4" />
        Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="expense_date">Date</Label>
            <Input id="expense_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense_category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger id="expense_category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORY_GROUPS.map((group) => (
                  <SelectGroup key={group.group}>
                    <SelectLabel>{group.group}</SelectLabel>
                    {group.categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <div className="space-y-1.5">
              <Label htmlFor="custom_category">Custom Category Name</Label>
              <Input
                id="custom_category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="expense_description">Description</Label>
            <Textarea
              id="expense_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense_amount">Amount</Label>
            <Input
              id="expense_amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
