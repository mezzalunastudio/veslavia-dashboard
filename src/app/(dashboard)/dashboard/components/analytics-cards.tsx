import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Eye, Database, DollarSign } from "lucide-react"
import { DashboardAnalytics } from "@/lib/api/analytics"

interface AnalyticsCardsProps {
  analytics: DashboardAnalytics;
  loading?: boolean;
}

export function AnalyticsCards({ analytics, loading = false }: AnalyticsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(analytics.totalIncome),
      description: "Total revenue from transactions",
      growth: analytics.metrics.incomeGrowth,
      icon: DollarSign,
      color: "text-green-600",
      badgeColor: analytics.metrics.incomeGrowth >= 0 ? 
        "border-green-200 bg-green-50 text-green-700" : 
        "border-red-200 bg-red-50 text-red-700"
    },
    {
      title: "Total Invitations",
      value: formatNumber(analytics.totalInvitations),
      description: "Wedding invitations created this month",
      growth: analytics.metrics.invitationGrowth,
      icon: Users,
      color: "text-blue-600",
      badgeColor: analytics.metrics.invitationGrowth >= 0 ? 
        "border-green-200 bg-green-50 text-green-700" : 
        "border-red-200 bg-red-50 text-red-700"
    },
    {
      title: "Template Visitor",
      value: formatNumber(analytics.totalTemplateViews),
      description: "Total template views this month",
      growth: analytics.metrics.viewsGrowth,
      icon: Eye,
      color: "text-purple-600",
      badgeColor: analytics.metrics.viewsGrowth >= 0 ? 
        "border-green-200 bg-green-50 text-green-700" : 
        "border-red-200 bg-red-50 text-red-700"
    },
    {
      title: "Storage Usage",
      value: formatFileSize(analytics.totalStorageUsage),
      description: "Total S3 storage used",
      growth: analytics.metrics.storageGrowth,
      icon: Database,
      color: "text-orange-600",
      badgeColor: analytics.metrics.storageGrowth >= 0 ? 
        "border-green-200 bg-green-50 text-green-700" : 
        "border-red-200 bg-red-50 text-red-700"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mt-2"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-sm font-medium">
              {card.title}
            </CardDescription>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <div className="mt-3">
              <Badge 
                variant="outline" 
                className={card.badgeColor}
              >
                {card.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(card.growth)}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0">
            <div className={`line-clamp-1 flex gap-2 font-medium ${
              card.growth >= 0 ? 'text-grey-600' : 'text-red-200'
            }`}>
              {card.growth >= 0 ? (
                <>
                  Trending up this month <TrendingUp className="size-4" />
                </>
              ) : (
                <>
                  Down this period <TrendingDown className="size-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground">
              {card.description}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}