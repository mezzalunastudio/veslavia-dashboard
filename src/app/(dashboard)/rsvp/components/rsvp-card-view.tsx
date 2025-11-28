"use client"

import { useState } from "react"
import {
  Search,
  Trash2,
  User,
  MessageCircle,
  Calendar,
  Users,
  Link,
  ChartBar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteRSVP, RSVP } from "@/lib/api/rsvp"

interface RSVPCardViewProps {
  rsvps: RSVP[]
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  pathQuery: string
  onPathQueryChange: (query: string) => void
  attendanceFilter: string
  onAttendanceFilterChange: (filter: string) => void
  onClearFilters: () => void
  onDeleteRSVP: (id: string) => void
  loading?: boolean
}

export function RSVPCardView({
  rsvps,
  searchQuery,
  onSearchQueryChange,
  pathQuery,
  onPathQueryChange,
  attendanceFilter,
  onAttendanceFilterChange,
  onClearFilters,
  onDeleteRSVP,
  loading = false
}: RSVPCardViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rsvpToDelete, setRsvpToDelete] = useState<RSVP | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getAttendanceColor = (attendance: string) => {
    switch (attendance) {
      case "Hadir":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "Tidak hadir":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      case "Ragu-ragu":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const handleDeleteClick = (rsvp: RSVP) => {
    setRsvpToDelete(rsvp)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!rsvpToDelete) return

    try {
      setDeleting(true)
      await deleteRSVP(rsvpToDelete._id)
      onDeleteRSVP(rsvpToDelete._id)
      setDeleteDialogOpen(false)
      setRsvpToDelete(null)
    } catch (error) {
      console.error('Error deleting RSVP:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const hasActiveFilters = searchQuery || pathQuery || attendanceFilter !== "all"

  return (
    <div className="w-full space-y-6">
      {/* Filter Wrapper */}
      <div className="grid gap-4 sm:grid-cols-3 items-end">

        {/* Search by Path - Full width on mobile, 1 column on desktop */}
        <div className="flex flex-col space-y-2 sm:col-span-1">
          <Label htmlFor="path-search" className="text-sm font-medium">Search by Path</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="path-search"
              placeholder="e.g., john-doe"
              value={pathQuery}
              onChange={(event) => onPathQueryChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Search by Sender - Full width on mobile, 1 column on desktop */}
        <div className="flex flex-col space-y-2 sm:col-span-1">
          <Label htmlFor="sender-search" className="text-sm font-medium">Search by Sender</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sender-search"
              placeholder="Sender name..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Attendance Filter - Full width on mobile, 1 column on desktop */}
        <div className="flex flex-col space-y-2 sm:col-span-1">
          <Label htmlFor="attendance-filter" className="text-sm font-medium">Attendance</Label>
          <Select
            value={attendanceFilter}
            onValueChange={onAttendanceFilterChange}
          >
            <SelectTrigger id="attendance-filter" className="cursor-pointer w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Hadir">Hadir</SelectItem>
              <SelectItem value="Tidak hadir">Tidak Hadir</SelectItem>
              <SelectItem value="Ragu-ragu">Ragu-ragu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters + Count - Full width on mobile, 1 column on desktop */}
        <div className="flex flex-col space-y-2 sm:col-span-3">

          <div className="flex items-center justify-between gap-3 h-10">
            <Button
              variant="outline"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="flex-shrink-0 h-9"
            >
              Clear Filters
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              <Badge>{rsvps.length} RSVP{rsvps.length !== 1 ? "s" : ""}</Badge>
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading RSVP data...</p>
          </div>
        </div>
      )}

      {/* RSVP Cards Grid */}
      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rsvps.map((rsvp) => (
            <Card
              key={rsvp._id}
              className="flex flex-col hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-md flex items-center gap-2">
                      <User className="size-5 text-muted-foreground" />
                      {rsvp.sender}
                    </CardTitle>
                    {rsvp.wedding?.path && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link className="size-4" />
                          <span className="font-medium font-mono text-sm bg-muted px-2 py-1 rounded">
                            {rsvp.wedding.path}
                          </span>
                          <Badge variant="secondary" className={getAttendanceColor(rsvp.attendance)}>
                            {rsvp.attendance}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive/80 hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(rsvp)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col space-y-4 h-full">
                {/* Wedding Info */}


                {/* Message */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="size-4 min-w-4 min-h-4 text-muted-foreground mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Message</p>
                      <p className="text-sm mt-1 line-clamp-4 break-words">{rsvp.message}</p>
                    </div>
                  </div>
                </div>

                {/* Date — pinned bottom */}
                <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  <span>{formatDate(rsvp.createdDate)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && rsvps.length === 0 && (
        <div className="text-center py-12">
          <Users className="size-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No RSVP Found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? "Try adjusting your search criteria or clear filters."
              : "No RSVP responses have been submitted yet."
            }
          </p>
          {hasActiveFilters && (
            <Button onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RSVP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the RSVP from <strong>{rsvpToDelete?.sender}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}