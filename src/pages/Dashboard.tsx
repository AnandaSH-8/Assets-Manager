import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  IndianRupee,
  Plus,
  BarChart3
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'

// Mock data - replace with real data from Supabase
const summaryData = {
  totalAssets: 1250000,
  totalInvestments: 850000,
  monthlyGrowth: 12.5,
  totalGrowth: 186500
}

const chartData = [
  { month: 'Jan', assets: 1100000, investments: 750000 },
  { month: 'Feb', assets: 1150000, investments: 780000 },
  { month: 'Mar', assets: 1200000, investments: 810000 },
  { month: 'Apr', assets: 1250000, investments: 850000 },
]

const growthData = [
  { month: 'Jan', growth: 5.2 },
  { month: 'Feb', growth: 7.8 },
  { month: 'Mar', growth: 9.1 },
  { month: 'Apr', growth: 12.5 },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value)
}

export default function Dashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Welcome to AssetsManager
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
        <GlassCard hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(summaryData.totalAssets)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success mr-1" />
            <span className="text-success font-medium">+8.2%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(summaryData.totalInvestments)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-chart-3" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success mr-1" />
            <span className="text-success font-medium">+12.1%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
              <p className="text-2xl font-bold text-foreground">
                {summaryData.monthlyGrowth}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success mr-1" />
            <span className="text-success font-medium">+3.1%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Growth</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(summaryData.totalGrowth)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-chart-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success mr-1" />
            <span className="text-success font-medium">+15.7%</span>
            <span className="text-muted-foreground ml-1">from last quarter</span>
          </div>
        </GlassCard>
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
            <Button className="flex-1 h-12 bg-gradient-primary hover:shadow-hover-glow transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
            <Button variant="outline" className="flex-1 h-12 hover:bg-accent/50">
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
            <h3 className="text-lg font-semibold mb-4">Assets vs Investments</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                    formatter={(value) => [formatCurrency(Number(value)), '']}
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
                    name="Assets"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Growth']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
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