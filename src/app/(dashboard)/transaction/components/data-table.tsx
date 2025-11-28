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
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  Plus,
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
import { AddTransactionDialog } from "../../transaction/components/add-transaction-dialog"
import { Transaction, TransactionFormValues } from "@/lib/api/transaction"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface DataTableProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (id: string, transaction: TransactionFormValues) => void
  onAddTransaction: (transaction: TransactionFormValues) => void
  onRefresh?: () => void
  loading?: boolean
}

export function DataTable({ 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction, 
  onAddTransaction 
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "expense":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "salary":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "food":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "transportation":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "shopping":
        return "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20"
      case "bills":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      case "entertainment":
        return "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20"
      case "healthcare":
        return "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20"
      case "education":
        return "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20"
      case "investment":
        return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "bank transfer":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "credit card":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "debit card":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "e-wallet":
        return "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const exactFilter = (row: Row<Transaction>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<Transaction>[] = [
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
      accessorKey: "transactionDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("transactionDate"))
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {date.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "transactionName",
      header: "Transaction",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{transaction.transactionName}</span>
            <span className="text-sm text-muted-foreground line-clamp-1">
              {transaction.description}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "transactionType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("transactionType") as string
        return (
          <Badge variant="secondary" className={getTypeColor(type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const type = row.original.transactionType
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(amount)
        
        return (
          <div className={`font-bold`}>
            {formatted}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge variant="secondary" className={getCategoryColor(category)}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string
        return (
          <Badge variant="secondary" className={getPaymentMethodColor(method)}>
            {method}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleEditTransaction(transaction)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View transaction</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleEditTransaction(transaction)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit transaction</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600"
                  onClick={() => handleDeleteTransaction(transaction._id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Transaction
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: transactions,
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

  const typeFilter = table.getColumn("transactionType")?.getFilterValue() as string
  const categoryFilter = table.getColumn("category")?.getFilterValue() as string
  const paymentMethodFilter = table.getColumn("paymentMethod")?.getFilterValue() as string

  const handleAddTransaction = (data: TransactionFormValues) => {
    onAddTransaction(data)
    setIsAddDialogOpen(false)
  }

const handleEditTransaction = (transaction: Transaction) => {
  setEditingTransaction(transaction)
  setIsEditDialogOpen(true)
}


const handleUpdateTransaction = (transactionId: string, data: TransactionFormValues) => {
  onEditTransaction(transactionId, data)
  setIsEditDialogOpen(false)
  setEditingTransaction(null)
}

const handleDeleteTransaction = (transactionId: string) => {
  onDeleteTransaction(transactionId)
}


  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="type-filter" className="text-sm font-medium">
            Type
          </Label>
          <Select
            value={typeFilter || ""}
            onValueChange={(value) =>
              table.getColumn("transactionType")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="type-filter">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="category-filter">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="bills">Bills & Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-filter" className="text-sm font-medium">
            Payment Method
          </Label>
          <Select
            value={paymentMethodFilter || ""}
            onValueChange={(value) =>
              table.getColumn("paymentMethod")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="payment-filter">
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank transfer">Bank Transfer</SelectItem>
              <SelectItem value="credit card">Credit Card</SelectItem>
              <SelectItem value="debit card">Debit Card</SelectItem>
              <SelectItem value="e-wallet">E-Wallet</SelectItem>
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
                      {column.id === "transactionName" ? "Transaction" : 
                       column.id === "transactionDate" ? "Date" :
                       column.id === "transactionType" ? "Type" :
                       column.id === "paymentMethod" ? "Payment Method" :
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
                  No transactions found.
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

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTransaction}
      />
      <EditTransactionDialog
  open={isEditDialogOpen}
  onOpenChange={setIsEditDialogOpen}
  onSubmit={handleUpdateTransaction}
  transaction={editingTransaction}
/>
      
    </div>
  )
}