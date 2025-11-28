"use client"
import { DataTable } from "./components/data-table"
import { TemplateViewsChart } from "./components/TemplateViewsChart"
import { RecentInvitations } from "./components/recent-invitation"
import { getAllWeddingHistories, WeddingHistory } from "@/lib/api/weddingHistory"
import { useEffect, useState } from "react"
import { AnalyticsCards } from "./components/analytics-cards"
import { DashboardAnalytics, getDashboardAnalytics } from "@/lib/api/analytics"

export default function Page() {
  const [weddingHistories, setWeddingHistories] = useState<WeddingHistory[]>([])
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWedding = async () => {
    try {
      setLoading(true)
      setError(null)

      const histories = await getAllWeddingHistories()
      setWeddingHistories(histories)
    } catch (err: any) {
      setError(err.message || 'Failed to load wedding histories')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

   const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
    loadWedding()
  }, [])

  const handleRefresh = () => {
    loadAnalytics()
    loadWedding()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && weddingHistories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="@container/main px-4 lg:px-6 space-y-6">
                <AnalyticsCards 
          analytics={analytics || {
            totalIncome: 0,
            totalInvitations: 0,
            totalTemplateViews: 0,
            totalStorageUsage: 0,
            growthRate: 0,
            metrics: {
              incomeGrowth: 0,
              invitationGrowth: 0,
              viewsGrowth: 0,
              storageGrowth: 0
            }
          }} 
          loading={loading}
        />
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <RecentInvitations />
          <TemplateViewsChart />
        </div>
      </div>
      <div className="@container/main px-4 lg:px-6">
        <DataTable
          weddingHistories={weddingHistories}
          onRefresh={handleRefresh}
          loading={loading}
        />
      </div>
    </>
  )
}
