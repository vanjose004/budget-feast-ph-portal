'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateBookingNotes } from '@/lib/actions'

export function EditableNotes({ bookingId, notes }: { bookingId: string; notes: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(notes ?? '')

  function handleSave() {
    startTransition(async () => {
      try {
        await updateBookingNotes(bookingId, value)
        toast.success('Notes updated.')
        setIsEditing(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update notes.')
      }
    })
  }

  function handleCancel() {
    setValue(notes ?? '')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="space-y-2">
        {notes ? (
          <p className="whitespace-pre-wrap text-foreground">{notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)} className="print:hidden">
          Edit Notes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 print:hidden">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Special requests, allergies, reminders..."
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
