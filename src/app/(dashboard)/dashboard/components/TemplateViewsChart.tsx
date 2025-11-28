"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getAllTemplatesAnalytics, TemplateAnalytics } from "@/utils/apihelper"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"


// Data dummy template views - fallback jika API belum tersedia
const defaultTemplateViewsData = [
  { name: "Valverra", views: 2450, fill: "var(--color-valverra)" },
  { name: "Veloura", views: 1630, fill: "var(--color-veloura)" },
  { name: "Veralice", views: 1200, fill: "var(--color-veralice)" },
  { name: "Valoria", views: 980, fill: "var(--color-valoria)" },
  { name: "Volette", views: 750, fill: "var(--color-volette)" },
]

const chartConfig = {
  views: {
    label: "Views",
  },
  valverra: {
    label: "Valverra",
    color: "var(--chart-1)",
  },
  veloura: {
    label: "Veloura", 
    color: "var(--chart-2)",
  },
  veralice: {
    label: "Veralice",
    color: "var(--chart-3)",
  },
  valoria: {
    label: "Valoria",
    color: "var(--chart-4)",
  },
  volette: {
    label: "Volette",
    color: "var(--chart-5)",
  },
  verlisse: {
    label: "Verlisse",
    color: "var(--chart-6)",
  },
  vernella: {
    label: "Vernella",
    color: "var(--chart-7)",
  },
}

interface TemplateViewsChartProps {
  data?: Array<{ name: string; views: number; fill: string }>
}

export function TemplateViewsChart({ data = defaultTemplateViewsData }: TemplateViewsChartProps) {
  const id = "template-views"
  const [activeTemplate, setActiveTemplate] = React.useState(data[0]?.name || "valverra")
  const [templateData, setTemplateData] = React.useState(data)
  const [loading, setLoading] = React.useState(false)

  // Fetch real data dari API
  React.useEffect(() => {
    const fetchTemplateAnalytics = async () => {
      setLoading(true)
      try {
        const analyticsData = await getAllTemplatesAnalytics()
        
        // Transform data dari API ke format yang dibutuhkan chart
        const transformedData = analyticsData
          .sort((a: TemplateAnalytics, b: TemplateAnalytics) => b.views - a.views) // Urutkan dari views tertinggi
          .slice(0, 5) // Ambil 5 teratas
          .map((item: TemplateAnalytics, index: number) => ({
            name: item.name.toLowerCase(),
            views: item.views,
            fill: `var(--color-${item.name.toLowerCase()})`,
            label: item.name,
            originalName: item.name
          }))

        if (transformedData.length > 0) {
          setTemplateData(transformedData)
          setActiveTemplate(transformedData[0].name)
        }
      } catch (error) {
        console.error('Failed to fetch template analytics:', error)
        // Tetap gunakan data default jika API error
      } finally {
        setLoading(false)
      }
    }

    fetchTemplateAnalytics()
  }, [])

  const activeIndex = React.useMemo(
    () => templateData.findIndex((item) => item.name === activeTemplate),
    [activeTemplate, templateData]
  )

  const activeTemplateData = templateData[activeIndex] || templateData[0]

  // Hitung total views untuk persentase
  const totalViews = React.useMemo(() => 
    templateData.reduce((sum, item) => sum + item.views, 0),
    [templateData]
  )

  const calculatePercentage = (views: number) => {
    return totalViews > 0 ? ((views / totalViews) * 100).toFixed(1) : "0"
  }

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Template Views</CardTitle>
          <CardDescription>Loading template analytics...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Template Views</CardTitle>
          <CardDescription>Top 5 most viewed templates</CardDescription>
        </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Pie Chart Section */}
          <div className="flex justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={templateData}
                  dataKey="views"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        innerRadius={outerRadius + 12}
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {activeTemplateData?.views.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Views
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          
          {/* Template List Section */}
          <div className="flex flex-col justify-center space-y-4">
            {templateData.map((item, index) => {
              const config = chartConfig[item.name as keyof typeof chartConfig]
              const isActive = item.name === activeTemplate
              const percentage = calculatePercentage(item.views)
              
              return (
                <div 
                  key={item.name}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveTemplate(item.name)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `var(--color-${item.name})`,
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {percentage}% of total views
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.views.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}