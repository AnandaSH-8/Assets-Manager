import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { financialAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { FileText } from 'lucide-react';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function Statistics() {
  const { user } = useAuth();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [titleData, setTitleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [statsResponse, allDataResponse] = await Promise.all([
          financialAPI.getStats(),
          financialAPI.getAll(),
        ]);

        const stats = statsResponse.data;
        const allData = allDataResponse.data;

        // Process category data for pie chart
        const categoryBreakdown = stats.category_breakdown || {};
        const newCategoryData = Object.entries(categoryBreakdown).map(
          ([name, value], index) => ({
            name,
            value: Number(value),
            color: CHART_COLORS[index % CHART_COLORS.length],
          }),
        );
        setCategoryData(newCategoryData);

        // Process monthly data for bar chart
        const monthlyGrouped: Record<
          string,
          { assets: number; investments: number }
        > = {};
        allData.forEach((item: any) => {
          const month = item.month || 'Unknown';
          if (!monthlyGrouped[month]) {
            monthlyGrouped[month] = { assets: 0, investments: 0 };
          }
          monthlyGrouped[month].assets += Number(item.amount);
          monthlyGrouped[month].investments += Number(item.amount);
        });

        const newMonthlyData = Object.entries(monthlyGrouped).map(
          ([month, data]) => ({
            month,
            ...data,
          }),
        );
        setMonthlyData(newMonthlyData);

        // Process performance data by category
        const performanceByCategory: Record<
          string,
          { invested: number; current: number; count: number }
        > = {};
        allData.forEach((item: any) => {
          const category = item.category;
          if (!performanceByCategory[category]) {
            performanceByCategory[category] = {
              invested: 0,
              current: 0,
              count: 0,
            };
          }
          const amount = Number(item.amount);
          performanceByCategory[category].invested += amount;
          performanceByCategory[category].current += amount;
          performanceByCategory[category].count += 1;
        });

        const newPerformanceData = Object.entries(performanceByCategory).map(
          ([category, data]) => {
            const returnPercent =
              data.invested > 0
                ? ((data.current - data.invested) / data.invested) * 100
                : 0;
            return {
              category,
              invested: data.invested,
              current: data.current,
              return: returnPercent,
            };
          },
        );
        setPerformanceData(newPerformanceData);

        // Process data by title
        const titleGrouped: Record<
          string,
          {
            title: string;
            category: string;
            cash: number;
            investment: number;
            currentValue: number;
          }
        > = {};
        allData.forEach((item: any) => {
          const title = item.description || 'Untitled';
          if (!titleGrouped[title]) {
            titleGrouped[title] = {
              title,
              category: item.category,
              cash: 0,
              investment: 0,
              currentValue: 0,
            };
          }
          titleGrouped[title].cash += Number(item.cash || 0);
          titleGrouped[title].investment += Number(item.investment || 0);
          titleGrouped[title].currentValue += Number(item.current_value || 0);
        });

        const newTitleData = Object.values(titleGrouped);
        setTitleData(newTitleData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
    );
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
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                    name === 'assets' ? 'Total Assets' : 'Total Investments',
                  ]}
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

      {/* Title-based Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Assets by Title</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left py-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Cash at Bank
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Cash Invested
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Current Value
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody>
                {titleData.map((item, index) => {
                  const totalInvested = item.cash + item.investment;
                  const gainLoss = item.currentValue - totalInvested;
                  const isProfit = gainLoss >= 0;

                  return (
                    <motion.tr
                      key={item.title}
                      className="border-b border-border/20 hover:bg-accent/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-4 font-medium">{item.title}</td>
                      <td className="py-4">{item.category}</td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.cash)}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.investment)}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(item.currentValue)}
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
                  );
                })}
              </tbody>
            </table>
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
                  <th className="text-left py-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Invested
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Current Value
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Return %
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item, index) => {
                  const gainLoss = item.current - item.invested;
                  const isProfit = gainLoss >= 0;

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
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
