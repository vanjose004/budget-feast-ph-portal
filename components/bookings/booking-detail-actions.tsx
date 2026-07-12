'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Printer, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { deleteBooking } from '@/lib/actions'

export function BookingDetailActions({ bookingId, clientName }: { bookingId: string; clientName: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBooking(bookingId)
        toast.success(`Booking for ${clientName} deleted.`)
        router.push('/bookings')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete booking.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button variant="outline" onClick={() => window.print()} data-icon="inline-start">
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Link href={`/bookings/${bookingId}/edit`}>
        <Button variant="outline" data-icon="inline-start">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </Link>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" data-icon="inline-start" />}>
          <Trash2 className="h-4 w-4" />
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the booking for {clientName} and its payment history. This can&apos;t be
              undone.
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
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
