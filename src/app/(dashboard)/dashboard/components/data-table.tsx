"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  Eye,
  Download,
  Search,
  RefreshCw,
  Users,
  Image,
  Music,
  Calendar,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WeddingHistory } from "@/lib/api/weddingHistory"
import StatusBadge from "@/components/ui/statusBadge"
import TemplateBadge from "@/components/ui/TemplateBadge"

interface DataTableProps {
  weddingHistories: WeddingHistory[]
  onRefresh?: () => void
  loading?: boolean
}

export function DataTable({ 
  weddingHistories, 
  onRefresh,
  loading = false 
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid 
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      : "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

   const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const exactFilter = (row: Row<WeddingHistory>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<WeddingHistory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "weddingId",
      header: "Wedding ID",
      cell: ({ row }) => {
        const weddingId = row.getValue("weddingId") as string
        return (
          <div className="flex flex-col">
            <span className="font-medium font-bold text-sm">{row.original.path}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {weddingId}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Template",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
         <TemplateBadge name={category} />
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(price)
        
        return (
          <div className="font-medium">
            {formatted}
          </div>
        )
      },
    },
    {
      accessorKey: "isPaid",
      header: "Payment",
      cell: ({ row }) => {
        const isPaid = row.getValue("isPaid") as boolean
        return (
          <Badge variant="secondary" className={getPaymentStatusColor(isPaid)}>
            {isPaid ? "Paid" : "Unpaid"}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <StatusBadge status={status} />
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "totalRsvp",
      header: "RSVP",
      cell: ({ row }) => {
        const rsvp = row.getValue("totalRsvp") as number
        return (
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="font-medium">{rsvp}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "totalView",
      header: "Views",
      cell: ({ row }) => {
        const views = row.getValue("totalView") as number
        return (
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-muted-foreground" />
            <span className="font-medium">{views}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "totalRecipient",
      header: "Recipients",
      cell: ({ row }) => {
        const recipients = row.getValue("totalRecipient") as number
        return (
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="font-medium">{recipients}</span>
          </div>
        )
      },
    },
        {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        if (!createdAt) return <span className="text-muted-foreground">-</span>
        
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDate(createdAt)}
            </span>
          </div>
        )
      },
    },
    {
      id: "storage",
      header: "Storage",
      cell: ({ row }) => {
        const history = row.original
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Image className="size-3" />
              <span>Images: {formatFileSize(history.totalImageSize)}</span>
            </div>
            {history.audioSize > 0 && (
              <div className="flex items-center gap-1">
                <Music className="size-3" />
                <span>Audio: {formatFileSize(history.audioSize)}</span>
              </div>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: weddingHistories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const categoryFilter = table.getColumn("category")?.getFilterValue() as string
  const statusFilter = table.getColumn("status")?.getFilterValue() as string
  const paymentFilter = table.getColumn("isPaid")?.getFilterValue() as string

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search wedding IDs, paths..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Template
          </Label>
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="category-filter">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All template</SelectItem>
              <SelectItem value="valoria">Valoria</SelectItem>
              <SelectItem value="valverra">Valvera</SelectItem>
              <SelectItem value="veloura">Veloura</SelectItem>
              <SelectItem value="veralice">Veralice</SelectItem>
              <SelectItem value="verlisse">Verlisse</SelectItem>
              <SelectItem value="vernella">Vernella</SelectItem>
              <SelectItem value="veylora">Veylora</SelectItem>
              <SelectItem value="volette">Volette</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-filter" className="text-sm font-medium">
            Payment
          </Label>
          <Select
            value={paymentFilter === undefined ? "" : paymentFilter.toString()}
            onValueChange={(value) =>
              table.getColumn("isPaid")?.setFilterValue(value === "all" ? "" : value === "true")
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="payment-filter">
              <SelectValue placeholder="Select Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="true">Paid</SelectItem>
              <SelectItem value="false">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="cursor-pointer w-full">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "weddingId" ? "Wedding ID" : 
                       column.id === "totalRsvp" ? "RSVP" :
                       column.id === "totalView" ? "Views" :
                       column.id === "totalRecipient" ? "Recipients" :
                       column.id === "totalImageSize" ? "Image Size" :
                       column.id === "audioSize" ? "Audio Size" :
                       column.id === "createdAt" ? "Created Date" :
                       column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No wedding histories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 hidden sm:block">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}