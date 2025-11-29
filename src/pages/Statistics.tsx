import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PieChart, Calendar, Download, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useState, useEffect } from 'react'
import { financialAPI } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export default function Statistics() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [titleData, setTitleData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('1month')
  const [allData, setAllData] = useState<any[]>([])
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [latestMonth, setLatestMonth] = useState<string>('')

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

        // const stats = statsResponse.data
        const fetchedData = allDataResponse.data
        setAllData(fetchedData)

        // Get latest month from data
        let latestMonth = ''
        if (fetchedData.length > 0) {
          const sortedData = [...fetchedData].sort(
            (a, b) =>
              new Date(b.date_added || b.created_at).getTime() -
              new Date(a.date_added || a.created_at).getTime(),
          )
          const latest = sortedData[0]
          latestMonth = `${latest.month} ${latest.year}`
          setLatestMonth(latestMonth)
        }

        // Filter data by date range
        const filteredData = filterDataByRange(fetchedData, dateRange)

        // Process category data for pie chart - only latest month
        const categoryTotals: Record<string, number> = {}

        for (const item of filteredData) {
          const currentMonth = `${item.month} ${item.year}`
          if (currentMonth !== latestMonth) continue

          const category = item.category
          const amount = Number(item.amount || 0)

          if (!categoryTotals[category]) {
            categoryTotals[category] = 0
          }
          categoryTotals[category] += amount
        }

        const newCategoryData = Object.entries(categoryTotals)
          .map(([name, value], index) => ({
            name,
            value: Number(value),
            color: CHART_COLORS[index % CHART_COLORS.length],
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setCategoryData(newCategoryData)

        // Process performance data by category - keep only latest entry per category
        const categoryPerfMap = []

        // Process performance data by category
        const performanceByCategory: Record<
          string,
          { liquid: number; invested: number; current: number; count: number }
        > = {}

        for (let item of filteredData) {
          const currentMonth = `${item.month} ${item.year}`

          if (currentMonth !== latestMonth) continue

          const category = item.category

          if (!performanceByCategory[category]) {
            performanceByCategory[category] = {
              liquid: 0,
              invested: 0,
              current: 0,
              count: 0,
            }
          }
          if (category == 'Cash in Hand' || category == 'Bank Account') {
            performanceByCategory[category].liquid += Number(item.cash)
          } else {
            // if (
            //   category == 'Recurring Deposit' ||
            //   category == 'Provident Fund'
            // ) {
            //   performanceByCategory[category].invested += Number(item.amount)
            //   performanceByCategory[category].current += Number(item.amount)
            // } else {
            performanceByCategory[category].invested += Number(item.investment)
            performanceByCategory[category].current += Number(
              item.current_value,
            )
            // }

            performanceByCategory[category].count += 1
          }
        }

        const newPerformanceData = Object.entries(performanceByCategory).map(
          ([category, data]) => {
            const returnPercent =
              data.invested > 0
                ? ((data.current - data.invested) / data.invested) * 100
                : 0
            return {
              category,
              liquid: data.liquid,
              invested: data.invested,
              current: data.current,
              return: returnPercent,
            }
          },
        )
        setPerformanceData(newPerformanceData)

        // Process individual records for title-based table
        // Group by title and keep only the latest entry for each title
        const lastesMonthData = []

        for (const item of filteredData) {
          const currentMonth = `${item.month} ${item.year}`

          if (currentMonth !== latestMonth) continue
          const itemDate = new Date(item.date_added || item.created_at)

          lastesMonthData.push({
            id: item.id,
            title: item.description,
            category: item.category,
            cash: Number(item.cash || 0),
            investment: Number(item.investment || 0),
            currentValue: Number(item.current_value || 0),
            month: item.month,
            year: item.year,
            date: itemDate,
          })
        }
        // sort by title
        lastesMonthData.sort((a, b) => {
          const titleCompare = a.title.localeCompare(b.title)
          return titleCompare == 0
            ? a.category.localeCompare(b.category)
            : titleCompare
        })

        setTitleData([...lastesMonthData])
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, dateRange])

  const filterDataByRange = (data: any[], range: string) => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (range) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return data
    }

    return data.filter((item: any) => {
      const itemDate = new Date(item.date_added || item.created_at)
      return itemDate >= cutoffDate
    })
  }

  const exportToExcel = () => {
    // Prepare title data
    const titleSheet = titleData.map(item => {
      const totalInvested = item.cash + item.investment
      const gainLoss = item.currentValue - totalInvested
      return {
        Title: item.title,
        Category: item.category,
        'Cash at Bank': item.cash,
        'Cash Invested': item.investment,
        'Current Value': item.currentValue,
        'Gain/Loss': gainLoss,
      }
    })

    // Prepare category performance data
    const performanceSheet = performanceData.map(item => ({
      Category: item.category,
      Liquid: item.liquid,
      Invested: item.invested,
      'Current Value': item.current,
      'Return %': item.return.toFixed(2),
      'Gain/Loss': item.current - item.invested,
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(titleSheet)
    const ws2 = XLSX.utils.json_to_sheet(performanceSheet)

    XLSX.utils.book_append_sheet(wb, ws1, 'Assets by Title')
    XLSX.utils.book_append_sheet(wb, ws2, 'Category Performance')

    // Save file
    XLSX.writeFile(
      wb,
      `Portfolio_Statistics_${new Date().toLocaleDateString()}.xlsx`,
    )
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text('Portfolio Statistics', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)

    // Assets by Title table
    const titleTableData = titleData.map(item => {
      const totalInvested = item.cash + item.investment
      const gainLoss = item.currentValue - totalInvested
      return [
        item.title,
        item.category,
        formatCurrency(item.cash),
        formatCurrency(item.investment),
        formatCurrency(item.currentValue),
        formatCurrency(gainLoss),
      ]
    })

    autoTable(doc, {
      head: [
        [
          'Title',
          'Category',
          'Cash at Bank',
          'Cash Invested',
          'Current Value',
          'Gain/Loss',
        ],
      ],
      body: titleTableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    })

    // Category Performance table
    const performanceTableData = performanceData.map(item => [
      item.liquid,
      item.category,
      formatCurrency(item.invested),
      formatCurrency(item.current),
      `${item.return.toFixed(2)}%`,
      formatCurrency(item.current - item.invested),
    ])

    autoTable(doc, {
      head: [
        ['Category', 'Invested', 'Current Value', 'Return %', 'Gain/Loss'],
      ],
      body: performanceTableData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    })

    // Save file
    doc.save(`Portfolio_Statistics_${new Date().toLocaleDateString()}.pdf`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column)
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    )
  }

  const sortedTitleData = [...titleData].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1

    switch (sortColumn) {
      case 'title':
        return direction * a.title.localeCompare(b.title)
      case 'category':
        return direction * a.category.localeCompare(b.category)
      case 'cash':
        return direction * (a.cash - b.cash)
      case 'investment':
        return direction * (a.investment - b.investment)
      case 'currentValue':
        return direction * (a.currentValue - b.currentValue)
      case 'gainLoss':
        const gainLossA = a.cash === 0 ? a.currentValue - a.investment : a.cash
        const gainLossB = b.cash === 0 ? b.currentValue - b.investment : b.cash
        return direction * (gainLossA - gainLossB)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
      </div>
    )
  }

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Add financial particulars to see statistics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Statistics & Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Detailed insights into your financial portfolio performance
            {latestMonth && (
              <span className="block text-sm mt-1 text-primary font-semibold">
                Latest data: {latestMonth}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <FileText className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6 group">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Assets by Title</h2>
          </div>

          <div className="h-[28rem] flex flex-col">
            {/* Fixed Header */}
            <div className="border-b border-border/50">
              <table className="w-full">
                <thead>
                  <tr>
                    <th
                      className="text-left py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <span className="inline-flex items-center">
                        Title{getSortIcon('title')}
                      </span>
                    </th>
                    <th
                      className="text-left py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      <span className="inline-flex items-center">
                        Category{getSortIcon('category')}
                      </span>
                    </th>
                    <th
                      className="text-right py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('cash')}
                    >
                      <span className="inline-flex items-center justify-end">
                        Cash at Bank{getSortIcon('cash')}
                      </span>
                    </th>
                    <th
                      className="text-right py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('investment')}
                    >
                      <span className="inline-flex items-center justify-end">
                        Cash Invested{getSortIcon('investment')}
                      </span>
                    </th>
                    <th
                      className="text-right py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('currentValue')}
                    >
                      <span className="inline-flex items-center justify-end">
                        Current Value{getSortIcon('currentValue')}
                      </span>
                    </th>
                    <th
                      className="text-right py-3 font-medium text-lg text-muted-foreground w-1/6 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('gainLoss')}
                    >
                      <span className="inline-flex items-center justify-end">
                        Gain/Loss{getSortIcon('gainLoss')}
                      </span>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent">
              <table className="w-full">
                <tbody>
                  {sortedTitleData.map((item, index) => {
                    const gainLoss =
                      item.cash == 0
                        ? item.currentValue - item.investment
                        : item.cash
                    const isProfit = gainLoss >= 0

                    const profitLossColor = isProfit
                      ? 'text-success'
                      : 'text-destructive'
                    const gainLossColor =
                      item.cash == 0 ? profitLossColor : 'text-muted-foreground'

                    return (
                      <motion.tr
                        key={item.id}
                        className="border-b border-border/20 hover:bg-accent/20 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() =>
                          navigate('/add-particulars', {
                            state: { editData: item },
                          })
                        }
                      >
                        <td className="py-4 font-medium w-1/6">{item.title}</td>
                        <td className="py-4 w-1/6">{item.category}</td>
                        <td className="py-4 text-right w-1/6">
                          {formatCurrency(item.cash)}
                        </td>
                        <td className="py-4 text-right w-1/6">
                          {formatCurrency(item.investment)}
                        </td>
                        <td className="py-4 text-right font-medium w-1/6 text-">
                          {formatCurrency(item.currentValue)}
                        </td>
                        <td
                          className={`py-4 text-right font-bold w-1/6 ${gainLossColor}`}
                        >
                          {isProfit ? '+' : ''}
                          {formatCurrency(gainLoss)}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Fixed Footer with Totals */}
            <div className="border-t border-border/50 bg-accent/10">
              <table className="w-full">
                <thead className="sr-only">
                  <tr>
                    <th>Summary</th>
                    <th>Category</th>
                    <th>Cash at Bank</th>
                    <th>Cash Invested</th>
                    <th>Current Value</th>
                    <th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold">
                    <td className="py-4 font-bold w-1/6">Total</td>
                    <td className="py-4 w-1/6">-</td>
                    <td className="py-4 text-right w-1/6">
                      {formatCurrency(
                        titleData.reduce((sum, item) => sum + item.cash, 0),
                      )}
                    </td>
                    <td className="py-4 text-right w-1/6">
                      {formatCurrency(
                        titleData.reduce(
                          (sum, item) => sum + item.investment,
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-4 text-right w-1/6">
                      {formatCurrency(
                        titleData.reduce(
                          (sum, item) => sum + item.currentValue,
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-4 text-right w-1/6">
                      {(() => {
                        const totalGainLoss = titleData.reduce((sum, item) => {
                          const gainLoss =
                            item.cash == 0
                              ? item.currentValue - item.investment
                              : item.cash
                          return sum + gainLoss
                        }, 0)
                        const isProfit = totalGainLoss >= 0
                        return (
                          <span
                            className={
                              isProfit ? 'text-success' : 'text-destructive'
                            }
                          >
                            {isProfit ? '+' : ''}
                            {formatCurrency(totalGainLoss)}
                          </span>
                        )
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6">Category Performance</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium text-lg text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 font-medium text-lg text-muted-foreground">
                    Liquid Balance
                  </th>
                  <th className="text-right py-3 font-medium text-lg text-muted-foreground">
                    Invested
                  </th>
                  <th className="text-right py-3 font-medium text-lg text-muted-foreground">
                    Current Value
                  </th>
                  <th className="text-right py-3 font-medium text-lg text-muted-foreground">
                    Return %
                  </th>
                  <th className="text-right py-3 font-medium text-lg text-muted-foreground">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item, index) => {
                  let gainLoss = item.liquid
                    ? item.liquid
                    : item.current - item.invested
                  // if (
                  //   item.category == 'Recurring Deposit' ||
                  //   item.category == 'Provident Fund'
                  // ) {
                  //   gainLoss = item.invested
                  // }
                  const isProfit = gainLoss >= 0

                  return (
                    <motion.tr
                      key={item.category}
                      className="border-b border-border/20 hover:bg-accent/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="py-4 font-medium">{item.category}</td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.liquid)}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.invested)}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(item.current)}
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isProfit ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {item.return.toFixed(1)}%
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isProfit ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {formatCurrency(gainLoss)}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
      {/* Portfolio Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Portfolio Distribution</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index + 1}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {categoryData.map(item => (
                <motion.div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (item.value /
                          categoryData.reduce(
                            (acc, curr) => acc + curr.value,
                            0,
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
