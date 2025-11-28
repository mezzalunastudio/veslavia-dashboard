"use client"

import { useState, useEffect } from "react"
import { RSVPCardView } from "./components/rsvp-card-view"
import { RSVP, getAllRSVP, searchRSVP, SearchRSVPOptions } from "@/lib/api/rsvp"

export default function ManageRSVPPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pathQuery, setPathQuery] = useState("")
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all")

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getAllRSVP(1, 100)
      setRsvps(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load RSVP data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const options: SearchRSVPOptions = {
        search: searchQuery || undefined,
        path: pathQuery || undefined,
        attendance: attendanceFilter === "all" ? undefined : attendanceFilter,
        limit: 100
      }
      const response = await searchRSVP(options)
      setRsvps(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to search RSVP')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setPathQuery("")
    setAttendanceFilter("all")
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || pathQuery || attendanceFilter !== "all") {
        handleSearch()
      } else {
        loadData()
      }
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, pathQuery, attendanceFilter])

  const handleDeleteRSVP = async (id: string) => {
    try {
      setRsvps(prev => prev.filter(rsvp => rsvp._id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete RSVP')
    }
  }

  if (loading && rsvps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading RSVP data...</p>
        </div>
      </div>
    )
  }

  if (error && rsvps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">      
      {error && (
        <div className="mx-4 lg:mx-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-destructive text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="@container/main px-4 lg:px-6">
        <RSVPCardView 
          rsvps={rsvps}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          pathQuery={pathQuery}
          onPathQueryChange={setPathQuery} 
          attendanceFilter={attendanceFilter}
          onAttendanceFilterChange={setAttendanceFilter}
          onClearFilters={handleClearFilters}
          onDeleteRSVP={handleDeleteRSVP}
          loading={loading}
        />
      </div>
    </div>
  )
}