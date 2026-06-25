import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Calendar,
  Download,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Search,
  X,
  Upload,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useState, useEffect, useMemo, useRef } from 'react'
import { financialAPI } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useDemoReadOnly } from '@/lib/demo-user'
import { useToast } from '@/hooks/use-toast'
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const ALL_CATEGORIES = [
  'All Categories',
  'Bank Account', 'Mutual Fund', 'Recurring Deposit',
  'Provident Fund', 'Stocks', 'Crypto Currency',
  'Cash in Hand', 'Gold', 'Other',
]

export default function Statistics() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDemoUser = useDemoReadOnly()
  const { toast } = useToast()

  // ─── Core data state ─────────────────────────────────────────────────────
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [titleData, setTitleData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [allData, setAllData] = useState<any[]>([])
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([])
  const [latestMonth, setLatestMonth] = useState<string>('')

  // ─── Sort state ───────────────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // ─── Search / Filter state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All Categories')

  // ─── Delete state ─────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ─── Copy-month state ─────────────────────────────────────────────────────
  const [isCopying, setIsCopying] = useState(false)

  // ─── Bulk import state ────────────────────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!user) { setIsLoading(false); return }
    try {
      setIsLoading(true)
      const [, allDataResponse] = await Promise.all([
        financialAPI.getStats(),
        financialAPI.getAll(),
      ])
      const fetchedData = allDataResponse.data
      setAllData(fetchedData)

      // Build sorted month options
      const monthSet = new Map<string, { month: string; year: number; monthNumber: number }>()
      for (const item of fetchedData) {
        const key = `${item.month}-${item.year}`
        if (!monthSet.has(key)) {
          monthSet.set(key, { month: item.month, year: item.year, monthNumber: item.month_number || 0 })
        }
      }
      const sortedMonths = Array.from(monthSet.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.monthNumber - a.monthNumber
      })
      const monthOptions = sortedMonths.map(m => ({
        value: `${m.month}-${m.year}`,
        label: `${m.month.substring(0, 3)}-${m.year}`,
      }))
      setAvailableMonths(monthOptions)

      let activeMonth = selectedMonth
      if (!activeMonth && monthOptions.length > 0) {
        activeMonth = monthOptions[0].value
        setSelectedMonth(activeMonth)
      }

      processMonthData(fetchedData, activeMonth)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processMonthData = (data: any[], activeMonth: string) => {
    const [monthName, yearStr] = activeMonth ? activeMonth.split('-') : ['', '']
    setLatestMonth(`${monthName} ${yearStr}`)

    const filteredData = data.filter((item: any) => `${item.month}-${item.year}` === activeMonth)

    // Category totals for pie chart
    const categoryTotals: Record<string, number> = {}
    for (const item of filteredData) {
      const amount = Number(item.amount || 0)
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amount
    }
    const newCategoryData = Object.entries(categoryTotals)
      .map(([name, value], index) => ({ name, value: Number(value), color: CHART_COLORS[index % CHART_COLORS.length] }))
      .sort((a, b) => a.name.localeCompare(b.name))
    setCategoryData(newCategoryData)

    // Category performance
    const performanceByCategory: Record<string, { liquid: number; invested: number; current: number; count: number }> = {}
    for (const item of filteredData) {
      const category = item.category
      if (!performanceByCategory[category]) {
        performanceByCategory[category] = { liquid: 0, invested: 0, current: 0, count: 0 }
      }
      if (category === 'Cash in Hand' || category === 'Bank Account') {
        performanceByCategory[category].liquid += Number(item.cash)
      } else {
        performanceByCategory[category].invested += Number(item.investment)
        performanceByCategory[category].current += Number(item.current_value)
        performanceByCategory[category].count += 1
      }
    }
    const newPerformanceData = Object.entries(performanceByCategory).map(([category, data]) => {
      const returnPercent = data.invested > 0 ? ((data.current - data.invested) / data.invested) * 100 : 0
      return { category, liquid: data.liquid, invested: data.invested, current: data.current, return: returnPercent }
    })
    setPerformanceData(newPerformanceData)

    // Individual title rows
    const rows = filteredData.map((item: any) => ({
      id: item.id,
      title: item.description,
      category: item.category,
      cash: Number(item.cash || 0),
      investment: Number(item.investment || 0),
      currentValue: Number(item.current_value || 0),
      month: item.month,
      year: item.year,
      date: new Date(item.date_added || item.created_at),
    }))
    rows.sort((a, b) => {
      const t = a.title.localeCompare(b.title)
      return t === 0 ? a.category.localeCompare(b.category) : t
    })
    setTitleData(rows)
  }

  useEffect(() => { fetchData() }, [user, selectedMonth])

  // ─────────────────────────────────────────────────────────────────────────
  // Delete single entry
  // ─────────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await financialAPI.delete(id)
      setTitleData(prev => prev.filter(item => item.id !== id))
      // Refresh category/performance data from updated list
      const updatedAll = allData.filter(item => item.id !== id)
      setAllData(updatedAll)
      processMonthData(updatedAll, selectedMonth)
      toast({ title: 'Deleted', description: 'Entry removed successfully.' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete entry.', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Copy month → next month
  // ─────────────────────────────────────────────────────────────────────────
  const handleCopyToNextMonth = async () => {
    if (!selectedMonth || titleData.length === 0) return
    const [monthName, yearStr] = selectedMonth.split('-')
    const monthIndex = MONTHS.indexOf(monthName)
    const nextMonthIndex = (monthIndex + 1) % 12
    const nextMonth = MONTHS[nextMonthIndex]
    const nextYear = nextMonthIndex === 0 ? Number(yearStr) + 1 : Number(yearStr)

    // Check if next month already has data
    const nextKey = `${nextMonth}-${nextYear}`
    const nextExists = availableMonths.some(m => m.value === nextKey)
    if (nextExists) {
      toast({
        title: 'Month already has data',
        description: `${nextMonth} ${nextYear} already has entries. Delete them first or pick a different month.`,
        variant: 'destructive',
      })
      return
    }

    setIsCopying(true)
    try {
      await Promise.all(
        titleData.map(item =>
          financialAPI.create({
            category: item.category,
            description: item.title,
            amount: item.cash + item.investment,
            cash: item.cash,
            investment: item.investment,
            current_value: item.currentValue,
            month: nextMonth,
            month_number: nextMonthIndex + 1,
            year: nextYear,
          })
        )
      )
      toast({
        title: '✅ Copied!',
        description: `${titleData.length} entries copied to ${nextMonth} ${nextYear}. Update values as needed.`,
      })
      await fetchData()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to copy entries.', variant: 'destructive' })
    } finally {
      setIsCopying(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bulk import from Excel/CSV
  // ─────────────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      const data = evt.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws)
      setImportPreview(rows)
      setImportModalOpen(true)
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const handleBulkImport = async () => {
    setIsImporting(true)
    let success = 0, failed = 0
    for (const row of importPreview) {
      try {
        const month = row['Month'] || row['month'] || MONTHS[new Date().getMonth()]
        const year = Number(row['Year'] || row['year'] || new Date().getFullYear())
        const monthNumber = MONTHS.indexOf(month) + 1
        await financialAPI.create({
          category: row['Category'] || row['category'] || 'Other',
          description: row['Title'] || row['title'] || row['Description'] || '',
          amount: Number(row['Amount'] || row['amount'] || 0),
          cash: Number(row['Cash'] || row['cash'] || row['Cash at Bank'] || 0),
          investment: Number(row['Investment'] || row['investment'] || row['Cash Invested'] || 0),
          current_value: Number(row['Current Value'] || row['current_value'] || 0),
          month, month_number: monthNumber, year,
        })
        success++
      } catch { failed++ }
    }
    toast({
      title: `Import complete`,
      description: `${success} entries added${failed > 0 ? `, ${failed} failed` : ''}.`,
      variant: failed > 0 ? 'destructive' : 'default',
    })
    setImportModalOpen(false)
    setImportPreview([])
    await fetchData()
    setIsImporting(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Sorting + filtering
  // ─────────────────────────────────────────────────────────────────────────
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />
  }

  const filteredTitleData = useMemo(() => {
    let data = [...titleData]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      data = data.filter(
        item =>
          item.title?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      )
    }
    if (filterCategory !== 'All Categories') {
      data = data.filter(item => item.category === filterCategory)
    }
    const direction = sortDirection === 'asc' ? 1 : -1
    data.sort((a, b) => {
      switch (sortColumn) {
        case 'title': return direction * a.title.localeCompare(b.title)
        case 'category': return direction * a.category.localeCompare(b.category)
        case 'cash': return direction * (a.cash - b.cash)
        case 'investment': return direction * (a.investment - b.investment)
        case 'currentValue': return direction * (a.currentValue - b.currentValue)
        case 'roi': {
          const roiA = a.investment > 0 ? (a.currentValue - a.investment) / a.investment : 0
          const roiB = b.investment > 0 ? (b.currentValue - b.investment) / b.investment : 0
          return direction * (roiA - roiB)
        }
        case 'gainLoss': {
          const glA = a.cash === 0 ? a.currentValue - a.investment : a.cash
          const glB = b.cash === 0 ? b.currentValue - b.investment : b.cash
          return direction * (glA - glB)
        }
        default: return 0
      }
    })
    return data
  }, [titleData, searchQuery, filterCategory, sortColumn, sortDirection])

  // ─────────────────────────────────────────────────────────────────────────
  // Sticky totals (computed from filtered set)
  // ─────────────────────────────────────────────────────────────────────────
  const stickyTotals = useMemo(() => {
    const totalCash = filteredTitleData.reduce((s, i) => s + i.cash, 0)
    const totalInvested = filteredTitleData.reduce((s, i) => s + i.investment, 0)
    const totalCurrent = filteredTitleData.reduce((s, i) => s + i.currentValue, 0)
    const totalGainLoss = filteredTitleData.reduce((s, i) => {
      return s + (i.cash === 0 ? i.currentValue - i.investment : i.cash)
    }, 0)
    return { totalCash, totalInvested, totalCurrent, totalGainLoss }
  }, [filteredTitleData])

  // ─────────────────────────────────────────────────────────────────────────
  // Insight cards
  // ─────────────────────────────────────────────────────────────────────────
  const insightCards = useMemo(() => {
    const investments = titleData.filter(i => i.investment > 0)
    if (investments.length === 0) return null

    const withROI = investments.map(i => ({
      ...i,
      roi: i.investment > 0 ? ((i.currentValue - i.investment) / i.investment) * 100 : 0,
    }))
    withROI.sort((a, b) => b.roi - a.roi)

    const best = withROI[0]
    const worst = withROI[withROI.length - 1]

    // Most concentrated category by total amount
    const catTotals: Record<string, number> = {}
    titleData.forEach(i => {
      catTotals[i.category] = (catTotals[i.category] || 0) + i.cash + i.investment
    })
    const grandTotal = Object.values(catTotals).reduce((s, v) => s + v, 0)
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

    return { best, worst, topCat, grandTotal }
  }, [titleData])

  // ─────────────────────────────────────────────────────────────────────────
  // Export helpers
  // ─────────────────────────────────────────────────────────────────────────
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const exportToExcel = () => {
    const titleSheet = titleData.map(item => {
      const gainLoss = item.cash === 0 ? item.currentValue - item.investment : item.cash
      const roi = item.investment > 0 ? ((item.currentValue - item.investment) / item.investment * 100).toFixed(2) + '%' : '—'
      return {
        Title: item.title, Category: item.category,
        'Cash at Bank': item.cash, 'Cash Invested': item.investment,
        'Current Value': item.currentValue, 'ROI %': roi, 'Gain/Loss': gainLoss,
      }
    })
    const performanceSheet = performanceData.map(item => {
      const gainLoss = item.liquid ? item.liquid : item.current - item.invested
      return {
        Category: item.category, 'Liquid Balance': item.liquid,
        Invested: item.invested, 'Current Value': item.current,
        'Return %': item.return.toFixed(2), 'Gain/Loss': gainLoss,
      }
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(titleSheet), 'Assets by Title')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(performanceSheet), 'Category Performance')
    XLSX.writeFile(wb, `Portfolio_Statistics_${new Date().toLocaleDateString()}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Portfolio Statistics', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}  |  Period: ${latestMonth}`, 14, 28)

    autoTable(doc, {
      head: [['Title', 'Category', 'Cash at Bank', 'Cash Invested', 'Current Value', 'ROI %', 'Gain/Loss']],
      body: titleData.map(item => {
        const gainLoss = item.cash === 0 ? item.currentValue - item.investment : item.cash
        const roi = item.investment > 0 ? ((item.currentValue - item.investment) / item.investment * 100).toFixed(1) + '%' : '—'
        return [item.title, item.category, formatCurrency(item.cash), formatCurrency(item.investment), formatCurrency(item.currentValue), roi, formatCurrency(gainLoss)]
      }),
      startY: 35, theme: 'grid', headStyles: { fillColor: [79, 70, 229] },
    })

    autoTable(doc, {
      head: [['Category', 'Liquid Balance', 'Invested', 'Current Value', 'Return %', 'Gain/Loss']],
      body: performanceData.map(item => {
        const gainLoss = item.liquid ? item.liquid : item.current - item.invested
        return [item.category, formatCurrency(item.liquid), formatCurrency(item.invested), formatCurrency(item.current), `${item.return.toFixed(2)}%`, formatCurrency(gainLoss)]
      }),
      startY: (doc as any).lastAutoTable.finalY + 10, theme: 'grid', headStyles: { fillColor: [79, 70, 229] },
    })

    doc.save(`Portfolio_Statistics_${new Date().toLocaleDateString()}.pdf`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Loading / empty states
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Add financial particulars to see statistics</p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 p-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Statistics &amp; Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Detailed insights into your financial portfolio performance
            {latestMonth && (
              <span className="block text-sm mt-1 text-primary font-semibold">
                Showing: {latestMonth}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month picker */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 h-10 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Copy to next month */}
          <Button
            variant="outline" className="h-10 rounded-xl"
            onClick={handleCopyToNextMonth}
            disabled={isCopying || titleData.length === 0 || isDemoUser}
            title={isDemoUser ? 'Disabled for the demo account' : 'Copy all entries to next month'}
          >
            <Copy className="w-4 h-4 mr-2" />
            {isCopying ? 'Copying…' : 'Copy Month'}
          </Button>

          {/* Bulk import */}
          <Button
            variant="outline" className="h-10 rounded-xl"
            onClick={() => !isDemoUser && fileInputRef.current?.click()}
            disabled={isDemoUser}
            title={isDemoUser ? 'Disabled for the demo account' : 'Bulk import from Excel/CSV'}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
            className="hidden" onChange={handleFileChange}
          />

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <FileText className="w-4 h-4 mr-2" />Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ── Insight Cards ───────────────────────────────────────────────── */}
      {insightCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Best performer */}
          <GlassCard className="p-5 border-l-4 border-l-success">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Best Performer</p>
                <p className="font-bold text-sm truncate mt-0.5">{insightCards.best.title}</p>
                <p className="text-xs text-muted-foreground truncate">{insightCards.best.category}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-bold text-sm">
                    +{insightCards.best.roi.toFixed(1)}% ROI
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Worst performer */}
          <GlassCard className={`p-5 border-l-4 ${insightCards.worst.roi < 0 ? 'border-l-destructive' : 'border-l-warning'}`}>
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${insightCards.worst.roi < 0 ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                <TrendingDown className={`h-5 w-5 ${insightCards.worst.roi < 0 ? 'text-destructive' : 'text-warning'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Needs Attention</p>
                <p className="font-bold text-sm truncate mt-0.5">{insightCards.worst.title}</p>
                <p className="text-xs text-muted-foreground truncate">{insightCards.worst.category}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className={`h-3.5 w-3.5 ${insightCards.worst.roi < 0 ? 'text-destructive' : 'text-warning'}`} />
                  <span className={`font-bold text-sm ${insightCards.worst.roi < 0 ? 'text-destructive' : 'text-warning'}`}>
                    {insightCards.worst.roi >= 0 ? '+' : ''}{insightCards.worst.roi.toFixed(1)}% ROI
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Highest concentration */}
          <GlassCard className="p-5 border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Highest Concentration</p>
                <p className="font-bold text-sm truncate mt-0.5">{insightCards.topCat[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{formatCurrency(insightCards.topCat[1])}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-primary font-bold text-sm">
                    {insightCards.grandTotal > 0 ? ((insightCards.topCat[1] / insightCards.grandTotal) * 100).toFixed(1) : 0}% of portfolio
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Assets by Title Table ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6 group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Assets by Title</h2>
              <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                {filteredTitleData.length} / {titleData.length}
              </span>
            </div>

            {/* Search + Category filter */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 w-52 rounded-xl text-sm"
                  placeholder="Search title or category…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 w-44 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || filterCategory !== 'All Categories') && (
                <Button
                  variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-xs"
                  onClick={() => { setSearchQuery(''); setFilterCategory('All Categories') }}
                >
                  <X className="h-3 w-3 mr-1" />Clear
                </Button>
              )}
            </div>
          </div>

          {/* ── Sticky Totals Bar ─────────────────────────────────────── */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-y border-border/50 py-2 px-1 mb-1 rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cash at Bank</p>
                <p className="font-bold text-sm text-foreground">{formatCurrency(stickyTotals.totalCash)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cash Invested</p>
                <p className="font-bold text-sm text-foreground">{formatCurrency(stickyTotals.totalInvested)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Value</p>
                <p className="font-bold text-sm text-foreground">{formatCurrency(stickyTotals.totalCurrent)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Gain/Loss</p>
                <p className={`font-bold text-sm ${stickyTotals.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stickyTotals.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stickyTotals.totalGainLoss)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Table ─────────────────────────────────────────────────── */}
          <div className="flex flex-col" style={{ height: '26rem' }}>
            {/* Fixed column header */}
            <div className="border-b border-border/50">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    {[
                      { key: 'title', label: 'Title', align: 'left', w: 'w-[18%]' },
                      { key: 'category', label: 'Category', align: 'left', w: 'w-[14%]' },
                      { key: 'cash', label: 'Cash at Bank', align: 'right', w: 'w-[14%]' },
                      { key: 'investment', label: 'Cash Invested', align: 'right', w: 'w-[14%]' },
                      { key: 'currentValue', label: 'Current Value', align: 'right', w: 'w-[14%]' },
                      { key: 'roi', label: 'ROI %', align: 'right', w: 'w-[10%]' },
                      { key: 'gainLoss', label: 'Gain/Loss', align: 'right', w: 'w-[14%]' },
                      { key: 'actions', label: '', align: 'right', w: 'w-[8%]' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className={`py-3 font-medium text-sm text-muted-foreground ${col.w} ${col.key !== 'actions' ? 'cursor-pointer hover:text-foreground transition-colors' : ''} text-${col.align}`}
                        onClick={col.key !== 'actions' ? () => handleSort(col.key) : undefined}
                      >
                        <span className={`inline-flex items-center ${col.align === 'right' ? 'justify-end' : ''}`}>
                          {col.label}{col.key !== 'actions' && getSortIcon(col.key)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full group-hover:[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
              <table className="w-full table-fixed">
                <tbody>
                  <AnimatePresence>
                    {filteredTitleData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          No entries match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredTitleData.map((item, index) => {
                        const gainLoss = item.cash === 0 ? item.currentValue - item.investment : item.cash
                        const isProfit = gainLoss >= 0
                        const gainLossColor = item.cash === 0
                          ? (isProfit ? 'text-success' : 'text-destructive')
                          : 'text-muted-foreground'
                        const roi = item.investment > 0
                          ? ((item.currentValue - item.investment) / item.investment) * 100
                          : null

                        return (
                          <motion.tr
                            key={item.id}
                            className="border-b border-border/20 hover:bg-accent/20 group/row"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          >
                            {/* Title — click to edit */}
                            <td
                              className="py-3.5 font-medium w-[18%] cursor-pointer truncate pr-2"
                              onClick={() => navigate('/add-particulars', { state: { editData: item } })}
                              title={item.title}
                            >
                              {item.title}
                            </td>
                            <td
                              className="py-3.5 w-[14%] text-sm cursor-pointer truncate pr-2"
                              onClick={() => navigate('/add-particulars', { state: { editData: item } })}
                            >
                              {item.category}
                            </td>
                            <td className="py-3.5 text-right w-[14%]">{formatCurrency(item.cash)}</td>
                            <td className="py-3.5 text-right w-[14%]">{formatCurrency(item.investment)}</td>
                            <td className="py-3.5 text-right font-medium w-[14%]">{formatCurrency(item.currentValue)}</td>
                            {/* ROI % */}
                            <td className={`py-3.5 text-right font-semibold w-[10%] text-sm ${roi === null ? 'text-muted-foreground' : roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {roi === null ? '—' : `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`}
                            </td>
                            {/* Gain/Loss */}
                            <td className={`py-3.5 text-right font-bold w-[14%] ${gainLossColor}`}>
                              {isProfit ? '+' : ''}{formatCurrency(gainLoss)}
                            </td>
                            {/* Delete button */}
                            <td className="py-3.5 text-right w-[8%]">
                              {!isDemoUser && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                      title="Delete entry"
                                      disabled={deletingId === item.id}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {deletingId === item.id
                                        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                        : <Trash2 className="h-4 w-4" />}
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove <strong>{item.title}</strong> ({item.category}) from {item.month} {item.year}. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleDelete(item.id)}
                                      >
                                        Yes, delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Category Performance ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6">Category Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {['Category', 'Liquid Balance', 'Invested', 'Current Value', 'Return %', 'Gain/Loss'].map(h => (
                    <th key={h} className={`py-3 font-medium text-lg text-muted-foreground ${h === 'Category' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item, index) => {
                  const gainLoss = item.liquid ? item.liquid : item.current - item.invested
                  const isProfit = gainLoss >= 0
                  return (
                    <motion.tr
                      key={item.category}
                      className="border-b border-border/20 hover:bg-accent/20"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="py-4 font-medium">{item.category}</td>
                      <td className="py-4 text-right">{formatCurrency(item.liquid)}</td>
                      <td className="py-4 text-right">{formatCurrency(item.invested)}</td>
                      <td className="py-4 text-right font-medium">{formatCurrency(item.current)}</td>
                      <td className={`py-4 text-right font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                        {isProfit ? '+' : ''}{item.return.toFixed(1)}%
                      </td>
                      <td className={`py-4 text-right font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                        {isProfit ? '+' : ''}{formatCurrency(gainLoss)}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Portfolio Distribution ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Portfolio Distribution</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} fill="#8884d8" dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categoryData.map(item => (
                <motion.div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.value / categoryData.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Bulk Import Modal ───────────────────────────────────────────── */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Import Preview</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Found <strong>{importPreview.length}</strong> rows. Review before importing.
            Expected columns: <code className="bg-accent px-1 rounded text-xs">Title, Category, Cash, Investment, Current Value, Month, Year</code>
          </p>
          <div className="flex-1 overflow-auto mt-3 border rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  {importPreview[0] && Object.keys(importPreview[0]).map(k => (
                    <th key={k} className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importPreview.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-accent/10">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="py-2 px-3 truncate max-w-[150px]" title={String(val)}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
                {importPreview.length > 50 && (
                  <tr>
                    <td colSpan={99} className="py-3 text-center text-muted-foreground text-xs">
                      … and {importPreview.length - 50} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => { setImportModalOpen(false); setImportPreview([]) }}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport} disabled={isImporting}
              className="bg-gradient-primary hover:shadow-hover-glow transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing…' : `Import ${importPreview.length} Entries`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
