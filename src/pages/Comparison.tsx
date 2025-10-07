import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3, ArrowUpDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'recharts';

// Mock comparison data
const periodComparison = [
  {
    category: 'Bank Account',
    q1Assets: 420000,
    q1Investments: 420000,
    q2Assets: 450000,
    q2Investments: 430000,
    growth: 7.1,
  },
  {
    category: 'Mutual Fund',
    q1Assets: 280000,
    q1Investments: 250000,
    q2Assets: 320000,
    q2Investments: 270000,
    growth: 14.3,
  },
  {
    category: 'Stocks',
    q1Assets: 230000,
    q1Investments: 200000,
    q2Assets: 280000,
    q2Investments: 220000,
    growth: 21.7,
  },
  {
    category: 'Fixed Deposit',
    q1Assets: 145000,
    q1Investments: 140000,
    q2Assets: 150000,
    q2Investments: 145000,
    growth: 3.4,
  },
];

const monthlyComparison = [
  { month: 'Jan', period1: 1100000, period2: 950000 },
  { month: 'Feb', period1: 1150000, period2: 1000000 },
  { month: 'Mar', period1: 1200000, period2: 1080000 },
  { month: 'Apr', period1: 1250000, period2: 1120000 },
  { month: 'May', period1: 1280000, period2: 1180000 },
  { month: 'Jun', period1: 1320000, period2: 1220000 },
];

export default function Comparison() {
  const [selectedPeriod1, setSelectedPeriod1] = useState('q2-2024');
  const [selectedPeriod2, setSelectedPeriod2] = useState('q1-2024');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateTotalGrowth = () => {
    const period1Total = periodComparison.reduce(
      (acc, item) => acc + item.q2Assets,
      0,
    );
    const period2Total = periodComparison.reduce(
      (acc, item) => acc + item.q1Assets,
      0,
    );
    return (((period1Total - period2Total) / period2Total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Period Comparison
        </h1>
        <p className="text-muted-foreground text-lg">
          Compare your financial performance across different time periods
        </p>
      </motion.div>

      {/* Period Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Select Periods to Compare</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Period 1</label>
              <Select
                value={selectedPeriod1}
                onValueChange={setSelectedPeriod1}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q2-2024">Q2 2024 (Apr-Jun)</SelectItem>
                  <SelectItem value="q1-2024">Q1 2024 (Jan-Mar)</SelectItem>
                  <SelectItem value="q4-2023">Q4 2023 (Oct-Dec)</SelectItem>
                  <SelectItem value="q3-2023">Q3 2023 (Jul-Sep)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Period 2</label>
              <Select
                value={selectedPeriod2}
                onValueChange={setSelectedPeriod2}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2024">Q1 2024 (Jan-Mar)</SelectItem>
                  <SelectItem value="q4-2023">Q4 2023 (Oct-Dec)</SelectItem>
                  <SelectItem value="q3-2023">Q3 2023 (Jul-Sep)</SelectItem>
                  <SelectItem value="q2-2023">Q2 2023 (Apr-Jun)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Overall Growth
            </p>
            <p className="text-3xl font-bold text-success">
              +{calculateTotalGrowth()}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Period over period
            </p>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Best Performer
            </p>
            <p className="text-2xl font-bold text-primary">Stocks</p>
            <p className="text-xs text-success mt-1">+21.7% growth</p>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Difference
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(120000)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Absolute increase
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Category-wise Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-chart-3" />
            <h2 className="text-xl font-semibold">Category-wise Comparison</h2>
          </div>

          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'q2Assets' ? 'Q2 2024' : 'Q1 2024',
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="q2Assets"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="q2Assets"
                />
                <Bar
                  dataKey="q1Assets"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  name="q1Assets"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Q2 2024
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Q1 2024
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Growth %
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodComparison.map((item, index) => {
                  const difference = item.q2Assets - item.q1Assets;
                  const isPositive = difference >= 0;

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
                        {formatCurrency(item.q2Assets)}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.q1Assets)}
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {item.growth.toFixed(1)}%
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(difference)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Monthly Trend Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-success" />
            <h2 className="text-xl font-semibold">Monthly Trend Comparison</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyComparison}>
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
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'period1' ? 'Q2 2024' : 'Q1 2024',
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="period1"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  name="period1"
                />
                <Line
                  type="monotone"
                  dataKey="period2"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 6 }}
                  name="period2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
