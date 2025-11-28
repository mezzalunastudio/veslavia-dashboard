"use client"

import { Eye, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { formatRelativeTime } from "@/utils/dateFormatter"
import { getRecentInvitations, WeddingHistory } from "@/lib/api/weddingHistory"
import StatusBadge from "@/components/ui/statusBadge"

export function RecentInvitations() {
  const [invitations, setInvitations] = useState<WeddingHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentInvitations = async () => {
      try {
        const data = await getRecentInvitations(5)
        setInvitations(data)
      } catch (error) {
        console.error('Failed to fetch recent invitations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentInvitations()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Recent Invitations</CardTitle>
            <CardDescription>Latest wedding invitations</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex p-3 rounded-lg border gap-2 animate-pulse">
              <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                <div className="flex items-center space-x-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Invitations</CardTitle>
          <CardDescription>Latest wedding invitations</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation._id}>
            <div className="flex p-3 rounded-lg border gap-2">
              <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                <div className="flex items-center space-x-3">
                <StatusBadge status={invitation.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate capitalize">
                      {invitation.path}
                    </p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {invitation.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                 
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {invitation.totalView.toLocaleString()} views  • {invitation.totalRsvp} rsvp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(invitation.updatedAt)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Analytics Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Edit Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        {invitation.isPaid ? 'Payment Details' : 'Process Payment'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}