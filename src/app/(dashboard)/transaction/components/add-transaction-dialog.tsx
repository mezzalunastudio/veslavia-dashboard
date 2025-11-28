"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TransactionFormValues } from "@/lib/api/transaction"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TransactionFormValues) => void
}

export function AddTransactionDialog({ open, onOpenChange, onSubmit }: AddTransactionDialogProps) {
  const [formData, setFormData] = useState<TransactionFormValues>({
    transactionDate: new Date().toISOString().split('T')[0],
    transactionName: "",
    transactionType: "expense",
    amount: 0,
    paymentMethod: "cash",
    description: "",
    category: "other"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      transactionDate: new Date().toISOString().split('T')[0],
      transactionName: "",
      transactionType: "expense",
      amount: 0,
      paymentMethod: "cash",
      description: "",
      category: "other"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(value: "income" | "expense") =>
                  setFormData({ ...formData, transactionType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Transaction Name</Label>
            <Input
              id="name"
              value={formData.transactionName}
              onChange={(e) => setFormData({ ...formData, transactionName: e.target.value })}
              placeholder="Enter transaction name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.amount}
                onKeyDown={(e) => {
                  const blocked = ["e", "E", "+", "-", ".", ","];

                  if (blocked.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, amount: Number(digitsOnly) });
                }}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit card">Credit Card</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                  <SelectItem value="debit card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invitation">Wedding Invitation</SelectItem>
                <SelectItem value="S3">Neo Object Storage</SelectItem>
                <SelectItem value="vercel">Vercel Plan</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter transaction description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}