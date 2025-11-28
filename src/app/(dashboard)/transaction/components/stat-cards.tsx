import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowUpRight, Wallet, BarChart3, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { Transaction, TransactionStats } from "@/lib/api/transaction"

interface StatCardsProps {
  transactions: Transaction[]
  stats?: TransactionStats | null
}

export function StatCards({ transactions, stats }: StatCardsProps) {
  const totalIncome = stats?.summary.totalIncome ||
    transactions.filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = stats?.summary.totalExpense ||
    transactions.filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = stats?.summary.netBalance || totalIncome - totalExpense

  const averageTransaction = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
    : 0

  const performanceMetrics = [
    {
      title: 'Total Income',
      current: `Rp ${totalIncome.toLocaleString()}`,
      previous: 'Rp 0',
      growth: transactions.length > 0 ? 100 : 0,
      icon: TrendingUp,
      type: 'income' as const
    },
    {
      title: 'Total Expense',
      current: `Rp ${totalExpense.toLocaleString()}`,
      previous: 'Rp 0',
      growth: transactions.length > 0 ? -100 : 0,
      icon: TrendingDown,
      type: 'expense' as const
    },
    {
      title: 'Net Balance',
      current: `Rp ${netBalance.toLocaleString()}`,
      previous: 'Rp 0',
      growth: netBalance >= 0 ? 100 : -100,
      icon: Wallet,
      type: 'balance' as const
    },
    {
      title: 'Total Transactions',
      current: stats?.summary.transactionCount.toString() || transactions.length.toString(),
      previous: '0',
      growth: 100,
      icon: BarChart3,
      type: 'count' as const
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className='border'>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <metric.icon className={cn(
                'size-6',
                metric.type === 'income' ? 'text-green-600' :
                  metric.type === 'expense' ? 'text-red-600' :
                    metric.type === 'balance' ? 'text-blue-600' : 'text-purple-600'
              )} />
              <Badge
                variant='outline'
                className={cn(
                  metric.growth >= 0
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400',
                )}
              >
                {metric.growth >= 0 ? (
                  <>
                    <TrendingUp className='me-1 size-3' />
                    {metric.growth >= 0 ? '+' : ''}
                    {metric.growth}%
                  </>
                ) : (
                  <>
                    <TrendingDown className='me-1 size-3' />
                    {metric.growth}%
                  </>
                )}
              </Badge>
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
              <div className='text-2xl font-bold'>{metric.current}</div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>from {metric.previous}</span>
                <ArrowUpRight className='size-3' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}