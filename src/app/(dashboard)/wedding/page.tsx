"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { getWeddings, Wedding, WeddingFilters } from "@/lib/api/wedding"

export default function WeddingPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<WeddingFilters>({})

  const loadData = async (currentFilters?: WeddingFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getWeddings(currentFilters || filters)
      setWeddings(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load wedding data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData()
  }

  const handleDeleteWedding = async (id: string) => {
    try {
      console.log('Delete wedding:', id)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete wedding')
    }
  }

  if (loading && weddings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading wedding data...</p>
        </div>
      </div>
    )
  }

  if (error && weddings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
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
        <DataTable
          weddings={weddings}
          onRefresh={handleRefresh}
          onDeleteWedding={handleDeleteWedding}
          loading={loading}
        />
      </div>
    </div>
  )
}