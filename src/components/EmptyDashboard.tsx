import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function EmptyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Welcome to Assets Manager
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Start building your financial portfolio by adding your first asset
        </p>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <GlassCard className="p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">No Assets Added Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started by adding your first financial asset. Track
                investments, savings, and watch your portfolio grow over time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/add-particulars')}
                className="h-12 px-8 bg-gradient-primary hover:shadow-hover-glow transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Asset
              </Button>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-chart-3/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-chart-3" />
          </div>
          <h4 className="font-semibold mb-2">Track Growth</h4>
          <p className="text-sm text-muted-foreground">
            Monitor your portfolio performance with detailed analytics
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-chart-4/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-chart-4" />
          </div>
          <h4 className="font-semibold mb-2">Detailed Statistics</h4>
          <p className="text-sm text-muted-foreground">
            View comprehensive reports and insights about your assets
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-success/10 flex items-center justify-center">
            <Wallet className="w-6 text-success" />
          </div>
          <h4 className="font-semibold mb-2">Portfolio Management</h4>
          <p className="text-sm text-muted-foreground">
            Organize and compare different investment categories
          </p>
        </GlassCard>
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-3xl mx-auto"
      >
      </motion.div>
    </div>
  );
}
