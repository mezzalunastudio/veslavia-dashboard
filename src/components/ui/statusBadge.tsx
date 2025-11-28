"use client"
import { Badge } from "@/components/ui/badge"
import { getStatusColor, getStatusLabel, StatusType } from "@/utils/status-badge"


export default function StatusBadge({ status }: { status: StatusType }) {
  return (
    <Badge
      variant="secondary"
      className={`px-2 py-0.5 text-xs font-medium rounded-md ${getStatusColor(status)}`}
    >
      {getStatusLabel(status)}
    </Badge>
  )
}