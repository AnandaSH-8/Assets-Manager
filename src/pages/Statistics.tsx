import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const categoryData = [
  { name: 'Bank Account', value: 450000, color: 'hsl(var(--chart-1))' },
  { name: 'Mutual Fund', value: 320000, color: 'hsl(var(--chart-2))' },
  { name: 'Stocks', value: 280000, color: 'hsl(var(--chart-3))' },
  { name: 'Fixed Deposit', value: 150000, color: 'hsl(var(--chart-4))' },
  { name: 'Real Estate', value: 80000, color: 'hsl(var(--chart-5))' }
]

const monthlyData = [
  { month: 'Jan', assets: 1100000, investments: 750000, growth: 5.2 },
  { month: 'Feb', assets: 1150000, investments: 780000, growth: 7.8 },
  { month: 'Mar', assets: 1200000, investments: 810000, growth: 9.1 },
  { month: 'Apr', assets: 1250000, investments: 850000, growth: 12.5 },
  { month: 'May', assets: 1280000, investments: 880000, growth: 15.7 },
  { month: 'Jun', assets: 1320000, investments: 920000, growth: 18.2 }
]

const performanceData = [
  { category: 'Mutual Fund', return: 18.5, invested: 320000, current: 379200 },
  { category: 'Stocks', return: 22.3, invested: 280000, current: 342440 },
  { category: 'Bank Account', return: 3.5, invested: 450000, current: 465750 },
  { category: 'Fixed Deposit', return: 6.8, invested: 150000, current: 160200 },
]

export default function Statistics() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
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
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="6months">
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
          
          <Button variant="outline" className="h-10 rounded-xl">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Portfolio Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {categoryData.map((item) => (
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
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / categoryData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Monthly Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-success" />
            <h2 className="text-xl font-semibold">Monthly Performance</h2>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'assets' ? 'Total Assets' : 'Total Investments'
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="assets" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="assets"
                />
                <Bar 
                  dataKey="investments" 
                  fill="hsl(var(--chart-3))" 
                  radius={[4, 4, 0, 0]}
                  name="investments"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6">Category Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Invested</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Current Value</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Return %</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item, index) => {
                  const gainLoss = item.current - item.invested
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
                      <td className="py-4 text-right">{formatCurrency(item.invested)}</td>
                      <td className="py-4 text-right font-medium">{formatCurrency(item.current)}</td>
                      <td className={`py-4 text-right font-bold ${
                        isProfit ? 'text-success' : 'text-destructive'
                      }`}>
                        {isProfit ? '+' : ''}{item.return.toFixed(1)}%
                      </td>
                      <td className={`py-4 text-right font-bold ${
                        isProfit ? 'text-success' : 'text-destructive'
                      }`}>
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
    </div>
  )
}