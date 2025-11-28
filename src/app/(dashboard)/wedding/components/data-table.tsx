// app/wedding/components/data-table.tsx
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
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Search,
  RefreshCw,
  Calendar,
  Link,
  Plus,
  SquareCheckBig,
  SquareX,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { updateStatusWedding, Wedding } from "@/lib/api/wedding"
import TemplateBadge from "@/components/ui/TemplateBadge"
import { useRouter } from 'next/navigation';

interface DataTableProps {
  weddings: Wedding[]
  onRefresh?: () => void
  onDeleteWedding: (id: string) => void
  loading?: boolean
}

export function DataTable({
  weddings,
  onRefresh,
  onDeleteWedding,
  loading = false
}: DataTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
  }

  const exactFilter = (row: Row<Wedding>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAddsWedding = () => {
    //open new page
  }

  const handleUpdateStatus = async (weddingId: string) => {
    try {
      setUpdatingStatus(weddingId)
      await updateStatusWedding(weddingId)

      // Refresh data after status update
      if (onRefresh) {
        onRefresh()
      }

    } catch (err: any) {
      console.error("Failed to update wedding status:", err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const columns: ColumnDef<Wedding>[] = [
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
      accessorKey: "path",
      header: "Path",
      cell: ({ row }) => {
        const path = row.getValue("path") as string
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-medium font-mono text-sm">{path}</span>
              <span className="text-xs text-muted-foreground">
                {row.original._id}
              </span>
            </div>
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant="secondary" className={getStatusColor(isActive)}>
            {isActive ? (
              <>
                <Eye className="mr-1 size-3" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="mr-1 size-3" />
                Inactive
              </>
            )}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "akad.date",
      header: "Akad Date",
      cell: ({ row }) => {
        const akadDate = row.original.akad.date
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(akadDate)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "resepsi.date",
      header: "Event Date",
      cell: ({ row }) => {
        const resepsi = row.original.resepsi
        if (!resepsi) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(resepsi.date)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "updateAt",
      header: "Last Update",
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt
        if (!updatedAt) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(updatedAt)}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const wedding = row.original
        const isUpdating = updatingStatus === wedding._id
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() =>
                wedding.isActive &&
                window.open(`https://www.veslavia.com/${wedding.category}/${wedding.path}`, "_blank")
              }
              disabled={!wedding.isActive}
              title={wedding.isActive ? "View wedding" : "Wedding inactive"}
            >
              {wedding.isActive ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4 text-gray-400" />
              )}
              <span className="sr-only">View wedding</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 cursor-pointer ${!wedding.isActive
                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                : "text-gray-600 hover:text-red-700 hover:bg-gray-50"
                }`}
              onClick={() => handleUpdateStatus(wedding._id)}
              disabled={isUpdating}
              title={wedding.isActive ? "Deactivate wedding" : "Activate wedding"}
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : wedding.isActive ? (
                <SquareX className="size-4" />
              ) : (
                <SquareCheckBig className="size-4" />
              )}
              <span className="sr-only">
                {wedding.isActive ? "Deactivate wedding" : "Activate wedding"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => router.push(`/wedding/${wedding._id}/edit`)}
            >
              <Edit className="size-4" />
              <span className="sr-only">Edit wedding</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Duplicate Wedding
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600"
                  onClick={() => onDeleteWedding(wedding._id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Wedding
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: weddings,
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
  const statusFilter = table.getColumn("isActive")?.getFilterValue() as string

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by path or names..."
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
          <Button
            // onClick={handleAddWedding()}
            className="cursor-pointer"
          >
            <Plus className="mr-2 size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="path-filter" className="text-sm font-medium">
            Path
          </Label>
          <Input
            id="path-filter"
            placeholder="Filter by path..."
            value={(table.getColumn("path")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("path")?.setFilterValue(event.target.value)
            }
            className="w-full"
          />
        </div>
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
              <SelectItem value="all">All Templates</SelectItem>
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
            value={statusFilter === undefined ? "" : statusFilter.toString()}
            onValueChange={(value) =>
              table.getColumn("isActive")?.setFilterValue(value === "all" ? "" : value === "true")
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
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
                      {column.id === "path" ? "Path" :
                        column.id === "category" ? "Template" :
                          column.id === "isActive" ? "Status" :
                            column.id === "akad.date" ? "Akad date" :
                              column.id === "resepsi.date" ? "Resepsi date" :
                                column.id === "updateAt" ? "Last Update" :
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
                  No weddings found.
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