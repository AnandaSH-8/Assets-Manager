import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  IndianRupee,
  Plus,
  BarChart3,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import EmptyDashboard from '@/components/EmptyDashboard'
import { useState, useEffect, useMemo } from 'react'
import { financialAPI } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface SummaryData {
  totalLiquidAssets: number
  totalInvestments: number
  monthlyGrowth: number
  totalGrowth: number
  liquidAssetsGrowthPercent: number
  investmentsGrowthPercent: number
  monthlyGrowthPercent: number
  totalGrowthPercent: number
  // Additional breakdown data for dialogs
  previousMonthCash?: number
  currentMonthCash?: number
  previousMonthInvestment?: number
  currentMonthInvestment?: number
  previousMonthTotal?: number
  currentMonthTotal?: number
  firstMonthTotal?: number
  previousMonthName?: string
  currentMonthName?: string
  firstMonthName?: string
}

interface ChartDataItem {
  month: string
  assets: number
  investments: number
}

interface GrowthDataItem {
  month: string
  growth: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasData, setHasData] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalLiquidAssets: 0,
    totalInvestments: 0,
    monthlyGrowth: 0,
    totalGrowth: 0,
    liquidAssetsGrowthPercent: 0,
    investmentsGrowthPercent: 0,
    monthlyGrowthPercent: 0,
    totalGrowthPercent: 0,
  })
  const [financialData, setFinancialData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [growthData, setGrowthData] = useState<GrowthDataItem[]>([])

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [statsResponse, allDataResponse] = await Promise.all([
          financialAPI.getStats(),
          financialAPI.getAll(),
        ])

        const stats = statsResponse.data
        const allData = allDataResponse.data

        setFinancialData(allData)

        // Find the latest month/year entry
        const sortedData = [...allData].sort((a: any, b: any) => {
          const yearDiff = (b.year || 0) - (a.year || 0)
          if (yearDiff !== 0) return yearDiff

          const monthOrder = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ]
          const aIndex = monthOrder.indexOf(a.month || '')
          const bIndex = monthOrder.indexOf(b.month || '')
          return bIndex - aIndex
        })

        const latestEntry = sortedData[0]
        const latestMonth = latestEntry?.month
        const latestYear = latestEntry?.year

        // Calculate totals for latest month only
        const latestMonthData = allData.filter(
          (item: any) => item.month === latestMonth && item.year === latestYear,
        )

        const latestMonthCash = latestMonthData.reduce(
          (sum: number, item: any) => sum + Number(item.cash || 0),
          0,
        )
        const latestMonthInvestment = latestMonthData.reduce(
          (sum: number, item: any) => sum + Number(item.investment || 0),
          0,
        )

        // Sort months chronologically
        const monthOrder = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]

        // Group data by month-year for charts (key format: "Month-Year")
        const monthlyData: Record<
          string,
          {
            cash: number
            investment: number
            count: number
            year: number
            monthIndex: number
          }
        > = {}
        allData.forEach((item: any) => {
          const month = item.month || 'Unknown'
          const year = item.year || new Date().getFullYear()
          const key = `${month}-${year}`
          if (!monthlyData[key]) {
            monthlyData[key] = {
              cash: 0,
              investment: 0,
              count: 0,
              year,
              monthIndex: monthOrder.indexOf(month),
            }
          }
          monthlyData[key].cash += Number(item.cash || 0)
          monthlyData[key].investment += Number(item.investment || 0)
          monthlyData[key].count += 1
        })

        // Convert to chart data format and sort by year then month
        const monthYearKeys = Object.keys(monthlyData).sort((a, b) => {
          const dataA = monthlyData[a]
          const dataB = monthlyData[b]
          // First sort by year
          if (dataA.year !== dataB.year) {
            return dataA.year - dataB.year
          }
          // Then sort by month within the same year
          return dataA.monthIndex - dataB.monthIndex
        })

        const newChartData = monthYearKeys.map(key => {
          const [month, year] = key.split('-')
          const shortMonth = month.substring(0, 3)
          return {
            month: `${shortMonth}-${year}`,
            assets: monthlyData[key].cash,
            investments: monthlyData[key].investment,
          }
        })
        setChartData(newChartData)

        // Calculate growth data (comparison with previous month for total)
        const newGrowthData = monthYearKeys.map((key, index) => {
          const [month, year] = key.split('-')
          const shortMonth = month.substring(0, 3)
          const displayKey = `${shortMonth}-${year}`

          if (index === 0) {
            return { month: displayKey, growth: 0 }
          }
          const currentTotal =
            monthlyData[key].cash + monthlyData[key].investment
          const previousKey = monthYearKeys[index - 1]
          const previousTotal =
            monthlyData[previousKey].cash + monthlyData[previousKey].investment
          const growth =
            previousTotal > 0
              ? ((currentTotal - previousTotal) / previousTotal) * 100
              : 0
          return { month: displayKey, growth: Number(growth.toFixed(2)) }
        })
        setGrowthData(newGrowthData)

        // Calculate actual percentage changes using sorted month-year keys
        const currentMonthKey =
          monthYearKeys.length > 0
            ? monthYearKeys[monthYearKeys.length - 1]
            : null
        const previousMonthKey =
          monthYearKeys.length > 1
            ? monthYearKeys[monthYearKeys.length - 2]
            : null
        const firstMonthKey = monthYearKeys.length > 0 ? monthYearKeys[0] : null

        const currentMonthCash = currentMonthKey
          ? monthlyData[currentMonthKey].cash
          : 0
        const previousMonthCash = previousMonthKey
          ? monthlyData[previousMonthKey].cash
          : 0
        const firstMonthCash = firstMonthKey
          ? monthlyData[firstMonthKey].cash
          : 0

        const currentMonthInvestment = currentMonthKey
          ? monthlyData[currentMonthKey].investment
          : 0
        const previousMonthInvestment = previousMonthKey
          ? monthlyData[previousMonthKey].investment
          : 0
        const firstMonthInvestment = firstMonthKey
          ? monthlyData[firstMonthKey].investment
          : 0

        const liquidAssetsGrowthPercent =
          previousMonthCash > 0
            ? ((currentMonthCash - previousMonthCash) / previousMonthCash) * 100
            : 0

        const investmentsGrowthPercent =
          previousMonthInvestment > 0
            ? ((currentMonthInvestment - previousMonthInvestment) /
                previousMonthInvestment) *
              100
            : 0

        // Monthly growth: current month total vs previous month total
        const currentMonthTotal = currentMonthCash + currentMonthInvestment
        const previousMonthTotal = previousMonthCash + previousMonthInvestment
        const monthlyGrowthAmount =
          Math.round((currentMonthTotal - previousMonthTotal) * 100) / 100
        const monthlyGrowthPercent =
          previousMonthTotal > 0
            ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) *
              100
            : 0

        const totalGrowthAmount =
          currentMonthCash +
          currentMonthInvestment -
          (firstMonthCash + firstMonthInvestment)
        const firstMonthTotal = firstMonthCash + firstMonthInvestment
        const totalGrowthPercent =
          firstMonthTotal > 0 ? (totalGrowthAmount / firstMonthTotal) * 100 : 0

        // Format display names for months (e.g., "Jan-2026")
        const formatMonthDisplay = (key: string | null) => {
          if (!key) return undefined
          const [month, year] = key.split('-')
          return `${month.substring(0, 3)}-${year}`
        }

        // Calculate summary data using latest month totals
        setSummaryData({
          totalLiquidAssets: latestMonthCash,
          totalInvestments: latestMonthInvestment,
          monthlyGrowth: monthlyGrowthAmount,
          totalGrowth: totalGrowthAmount,
          liquidAssetsGrowthPercent: Number(
            liquidAssetsGrowthPercent.toFixed(2),
          ),
          investmentsGrowthPercent: Number(investmentsGrowthPercent.toFixed(2)),
          monthlyGrowthPercent: Number(monthlyGrowthPercent.toFixed(2)),
          totalGrowthPercent: Number(totalGrowthPercent.toFixed(2)),
          // Additional breakdown data
          previousMonthCash,
          currentMonthCash,
          previousMonthInvestment,
          currentMonthInvestment,
          previousMonthTotal: previousMonthCash + previousMonthInvestment,
          currentMonthTotal: currentMonthCash + currentMonthInvestment,
          firstMonthTotal,
          previousMonthName: formatMonthDisplay(previousMonthKey),
          currentMonthName: formatMonthDisplay(currentMonthKey),
          firstMonthName: formatMonthDisplay(firstMonthKey),
        })

        setHasData(allData.length > 0)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setHasData(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
      </div>
    )
  }

  if (!hasData) {
    return <EmptyDashboard />
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Welcome to Assets Manager
        </h1>
        <p className="text-muted-foreground text-lg">
          Track, manage, and grow your financial portfolio with ease
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Dialog>
          <DialogTrigger asChild>
            <div>
              <GlassCard hover className="p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Liquid Assets
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(summaryData.totalLiquidAssets)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                  {summaryData.liquidAssetsGrowthPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                  )}
                  <span
                    className={
                      summaryData.liquidAssetsGrowthPercent >= 0
                        ? 'text-success font-medium'
                        : 'text-destructive font-medium'
                    }
                  >
                    {summaryData.liquidAssetsGrowthPercent >= 0 ? '+' : ''}
                    {summaryData.liquidAssetsGrowthPercent}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </GlassCard>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Liquid Assets Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.previousMonthName || 'Previous Month'}
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.previousMonthCash || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.currentMonthName || 'Current Month'}
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.currentMonthCash || 0)}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Calculation
                </p>
                <p className="text-sm font-mono">
                  ({formatCurrency(summaryData.currentMonthCash || 0)} -{' '}
                  {formatCurrency(summaryData.previousMonthCash || 0)}) /{' '}
                  {formatCurrency(summaryData.previousMonthCash || 0)} × 100 ={' '}
                  {summaryData.liquidAssetsGrowthPercent}%
                </p>
              </div>
            </div>
            <ScrollArea className="max-h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">
                      {summaryData.currentMonthName || 'Current'}
                    </TableHead>
                    <TableHead className="text-right">
                      {summaryData.previousMonthName || 'Previous'}
                    </TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Parse month-year keys back to match data
                    const parseMonthYear = (display: string | undefined) => {
                      if (!display) return { month: null, year: null }
                      const [shortMonth, year] = display.split('-')
                      const monthMap: Record<string, string> = {
                        Jan: 'January',
                        Feb: 'February',
                        Mar: 'March',
                        Apr: 'April',
                        May: 'May',
                        Jun: 'June',
                        Jul: 'July',
                        Aug: 'August',
                        Sep: 'September',
                        Oct: 'October',
                        Nov: 'November',
                        Dec: 'December',
                      }
                      return {
                        month: monthMap[shortMonth],
                        year: parseInt(year),
                      }
                    }

                    const current = parseMonthYear(summaryData.currentMonthName)
                    const previous = parseMonthYear(
                      summaryData.previousMonthName,
                    )
                    const grouped: Record<
                      string,
                      { current: number; previous: number; category: string }
                    > = {}

                    financialData
                      .filter((item: any) => Number(item.cash || 0) > 0)
                      .forEach((item: any) => {
                        const name = item.description || item.category
                        if (!grouped[name]) {
                          grouped[name] = {
                            current: 0,
                            previous: 0,
                            category: item.category,
                          }
                        }
                        if (
                          item.month === current.month &&
                          item.year === current.year
                        ) {
                          grouped[name].current += Number(item.cash || 0)
                        } else if (
                          item.month === previous.month &&
                          item.year === previous.year
                        ) {
                          grouped[name].previous += Number(item.cash || 0)
                        }
                      })

                    return Object.entries(grouped).map(([name, data]) => {
                      const diff = data.current - data.previous
                      return (
                        <TableRow key={name}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(data.current)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(data.previous)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${diff >= 0 ? 'text-success' : 'text-destructive'}`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {formatCurrency(diff)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  })()}
                </TableBody>
              </Table>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <div>
              <GlassCard hover className="p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Investments
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(summaryData.totalInvestments)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                  {summaryData.investmentsGrowthPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                  )}
                  <span
                    className={
                      summaryData.investmentsGrowthPercent >= 0
                        ? 'text-success font-medium'
                        : 'text-destructive font-medium'
                    }
                  >
                    {summaryData.investmentsGrowthPercent >= 0 ? '+' : ''}
                    {summaryData.investmentsGrowthPercent}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </GlassCard>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Investments Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.previousMonthName || 'Previous Month'}
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.previousMonthInvestment || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.currentMonthName || 'Current Month'}
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.currentMonthInvestment || 0)}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Calculation
                </p>
                <p className="text-sm font-mono">
                  ({formatCurrency(summaryData.currentMonthInvestment || 0)} -{' '}
                  {formatCurrency(summaryData.previousMonthInvestment || 0)}) /{' '}
                  {formatCurrency(summaryData.previousMonthInvestment || 0)} ×
                  100 = {summaryData.investmentsGrowthPercent}%
                </p>
              </div>
            </div>
            <ScrollArea className="max-h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">
                      {summaryData.currentMonthName || 'Current'}
                    </TableHead>
                    <TableHead className="text-right">
                      {summaryData.previousMonthName || 'Previous'}
                    </TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Parse month-year keys back to match data
                    const parseMonthYear = (display: string | undefined) => {
                      if (!display) return { month: null, year: null }
                      const [shortMonth, year] = display.split('-')
                      const monthMap: Record<string, string> = {
                        Jan: 'January',
                        Feb: 'February',
                        Mar: 'March',
                        Apr: 'April',
                        May: 'May',
                        Jun: 'June',
                        Jul: 'July',
                        Aug: 'August',
                        Sep: 'September',
                        Oct: 'October',
                        Nov: 'November',
                        Dec: 'December',
                      }
                      return {
                        month: monthMap[shortMonth],
                        year: Number.parseInt(year),
                      }
                    }

                    const current = parseMonthYear(summaryData.currentMonthName)
                    const previous = parseMonthYear(
                      summaryData.previousMonthName,
                    )
                    const grouped: Record<
                      string,
                      { current: number; previous: number; category: string }
                    > = {}

                    financialData
                      .filter((item: any) => Number(item.investment || 0) > 0)
                      .forEach((item: any) => {
                        const name = item.description || item.category
                        if (!grouped[name]) {
                          grouped[name] = {
                            current: 0,
                            previous: 0,
                            category: item.category,
                          }
                        }
                        if (
                          item.month === current.month &&
                          item.year === current.year
                        ) {
                          grouped[name].current += Number(item.investment || 0)
                        } else if (
                          item.month === previous.month &&
                          item.year === previous.year
                        ) {
                          grouped[name].previous += Number(item.investment || 0)
                        }
                      })

                    return Object.entries(grouped).map(([name, data]) => {
                      const diff = data.current - data.previous
                      return (
                        <TableRow key={name}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(data.current)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(data.previous)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${diff >= 0 ? 'text-success' : 'text-destructive'}`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {formatCurrency(diff)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  })()}
                </TableBody>
              </Table>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <div>
              <GlassCard hover className="p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Monthly Growth
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {summaryData.monthlyGrowth > 0 ? '+' : '-'}
                      {''}
                      {formatCurrency(summaryData.monthlyGrowth)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                  {summaryData.monthlyGrowthPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                  )}
                  <span
                    className={
                      summaryData.monthlyGrowthPercent >= 0
                        ? 'text-success font-medium'
                        : 'text-destructive font-medium'
                    }
                  >
                    {summaryData.monthlyGrowthPercent >= 0 ? '+' : ''}
                    {summaryData.monthlyGrowthPercent.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </GlassCard>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Monthly Growth Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.previousMonthName || 'Previous Month'} Total
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.previousMonthTotal || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.currentMonthName || 'Current Month'} Total
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.currentMonthTotal || 0)}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Growth Calculation
                </p>
                <p className="text-sm font-mono mb-3">
                  ({formatCurrency(summaryData.currentMonthTotal || 0)} -{' '}
                  {formatCurrency(summaryData.previousMonthTotal || 0)}) /{' '}
                  {formatCurrency(summaryData.previousMonthTotal || 0)} × 100 ={' '}
                  {summaryData.monthlyGrowthPercent.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  This represents the percentage change in total assets from{' '}
                  {summaryData.previousMonthName} to{' '}
                  {summaryData.currentMonthName}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <div>
              <GlassCard hover className="p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Growth
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(summaryData.totalGrowth)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-chart-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                  {summaryData.totalGrowthPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                  )}
                  <span
                    className={
                      summaryData.totalGrowthPercent >= 0
                        ? 'text-success font-medium'
                        : 'text-destructive font-medium'
                    }
                  >
                    {summaryData.totalGrowthPercent >= 0 ? '+' : ''}
                    {summaryData.totalGrowthPercent}%
                  </span>
                  <span className="text-muted-foreground">total growth</span>
                </div>
              </GlassCard>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Total Growth Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.firstMonthName || 'First Month'} Total
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.firstMonthTotal || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    {summaryData.currentMonthName || 'Current Month'} Total
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(summaryData.currentMonthTotal || 0)}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-chart-4/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Growth Amount
                </p>
                <p className="text-2xl font-bold mb-3">
                  {formatCurrency(summaryData.totalGrowth)}
                </p>
                <p className="text-sm font-mono mb-3">
                  {formatCurrency(summaryData.currentMonthTotal || 0)} -{' '}
                  {formatCurrency(summaryData.firstMonthTotal || 0)} ={' '}
                  {formatCurrency(summaryData.totalGrowth)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Growth Percentage Calculation
                </p>
                <p className="text-sm font-mono mb-3">
                  {formatCurrency(summaryData.totalGrowth)} /{' '}
                  {formatCurrency(summaryData.firstMonthTotal || 0)} × 100 ={' '}
                  {summaryData.totalGrowthPercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  This represents the overall percentage increase from{' '}
                  {summaryData.firstMonthName} to {summaryData.currentMonthName}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/add-particulars')}
              className="flex-1 h-12 bg-gradient-primary hover:shadow-hover-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
            <Button
              onClick={() => navigate('/statistics')}
              variant="outline"
              className="flex-1 h-12 hover:bg-accent/50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets vs Investments Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Assets vs Investments
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={value => [formatCurrency(Number(value)), '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="assets"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Liquid Assets (Cash)"
                  />
                  <Bar
                    dataKey="investments"
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                    name="Investments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Growth Tracking Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Growth Tracking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={value => `${value}%`}
                  />
                  <Tooltip
                    formatter={value => [`${value}%`, 'Growth']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="growthGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--success))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--success))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="growth"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
