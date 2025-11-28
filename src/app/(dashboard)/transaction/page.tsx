"use client"

import { useState, useEffect } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { Transaction, TransactionFormValues, getTransactions, createTransaction,
     updateTransaction, deleteTransaction, getTransactionStats, TransactionStats } from "@/lib/api/transaction"

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load transactions and stats
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [transactionsData, statsData] = await Promise.all([
        getTransactions(),
        getTransactionStats()
      ])
      
      setTransactions(transactionsData.transactions)
      setStats(statsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddTransaction = async (transactionData: TransactionFormValues) => {
    try {
      setError(null)
      const newTransaction = await createTransaction(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      
      // Reload stats to reflect new transaction
      const newStats = await getTransactionStats()
      setStats(newStats)
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction')
      throw err // Re-throw to handle in component
    }
  }

const handleEditTransaction = async (transactionId: string, transactionData: TransactionFormValues) => {
  try {
    setError(null)
    const updatedTransaction = await updateTransaction(transactionId, transactionData)
    setTransactions(prev => prev.map(t => 
      t._id === transactionId ? updatedTransaction : t
    ))
    
    // Reload stats to reflect updated transaction
    const newStats = await getTransactionStats()
    setStats(newStats)
  } catch (err: any) {
    setError(err.message || 'Failed to edit transaction')
    throw err
  }
}

const handleDeleteTransaction = async (id: string) => {
  try {
    setError(null)
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(transaction => transaction._id !== id))
    
    // Reload stats to reflect deleted transaction
    const newStats = await getTransactionStats()
    setStats(newStats)
  } catch (err: any) {
    setError(err.message || 'Failed to delete transaction')
    throw err
  }
}
  const handleRefresh = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error && transactions.length === 0) {
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
        <StatCards transactions={transactions} stats={stats} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={handleEditTransaction}
          onAddTransaction={handleAddTransaction}
          onRefresh={handleRefresh}
          loading={loading}
        />
      </div>
    </div>
  )
}