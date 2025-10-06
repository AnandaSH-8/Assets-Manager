import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Wallet, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { NeomorphInput } from '@/components/ui/neomorph-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { financialAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  'Bank Account',
  'Mutual Fund',
  'Recurring Deposit',
  'Provident Fund',
  'Stocks',
  'Crypto Currency',
  'Cash in Hand',
  'Gold',
  'Other',
];

const MONTHS = [
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
];

export default function AddParticulars() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    actualCash: '',
    investedCash: '',
    currentValue: '',
    month: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Fetch saved titles on component mount
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await financialAPI.getTitles();
        setSavedTitles(response.data || []);
      } catch (error) {
        console.error('Failed to fetch titles:', error);
      }
    };
    fetchTitles();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.actualCash || isNaN(Number(formData.actualCash))) {
      newErrors.actualCash = 'Valid actual cash amount is required';
    }
    if (!formData.investedCash || isNaN(Number(formData.investedCash))) {
      newErrors.investedCash = 'Valid invested cash amount is required';
    }
    if (!formData.currentValue || isNaN(Number(formData.currentValue))) {
      newErrors.currentValue = 'Valid current value is required';
    }
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredTitles = savedTitles.filter(title =>
    title.toLowerCase().includes(formData.title.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add financial particulars.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const cashAmount = Number(formData.actualCash);
      const investmentAmount = Number(formData.investedCash);
      const currentValue = Number(formData.currentValue);
      const totalAmount = cashAmount + investmentAmount;

      await financialAPI.create({
        category: formData.category,
        description: formData.title,
        amount: totalAmount,
        cash: cashAmount,
        investment: investmentAmount,
        current_value: currentValue,
        month: formData.month,
        year: new Date().getFullYear(),
      });

      toast({
        title: 'Success!',
        description: 'Financial particular has been added successfully.',
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        actualCash: '',
        investedCash: '',
        currentValue: '',
        month: '',
      });
    } catch (error) {
      console.error('Error saving financial particular:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save financial particular.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Add Financial Particulars
        </h1>
        <p className="text-muted-foreground text-lg">
          Add new assets, investments, or financial entries to track your
          portfolio
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">New Financial Entry</h2>
              </div>

              {/* Title Field - Dropdown + Input */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Select
                  value={formData.title}
                  onValueChange={value => {
                    console.log(value);
                    if (value === '__custom__') {
                      setIsCustom(true);
                      handleInputChange('title', '');
                    } else if (value.trim() && value !== '__custom__') {
                      setIsCustom(false);
                      handleInputChange('title', value);
                    }
                  }}
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl shadow-neomorph bg-background ${errors.title ? 'border-destructive' : ''}`}
                  >
                    <SelectValue placeholder="Select or type a title">
                      {savedTitles.includes(formData.title)
                        ? formData.title
                        : 'Select or type a title'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="__custom__">
                      <span className="text-primary">+ Type Custom Title</span>
                    </SelectItem>
                    {savedTitles.map((title, index) => (
                      <SelectItem key={index + 1} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.title === '' ||
                  isCustom ||
                  !savedTitles.includes(formData.title)) && (
                  <NeomorphInput
                    id="title"
                    className="border border-gray-300"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder="e.g., HDFC Savings Account"
                    error={errors.title}
                  />
                )}
                {errors.title && (
                  <p className="text-xs text-destructive mt-1 ml-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl shadow-neomorph bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive mt-1 ml-1">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="actualCash" className="text-sm font-medium">
                    Actual Cash (₹)
                  </label>
                  <NeomorphInput
                    id="actualCash"
                    type="number"
                    className="border border-gray-300"
                    value={formData.actualCash}
                    onChange={e =>
                      handleInputChange('actualCash', e.target.value)
                    }
                    placeholder="0"
                    error={errors.actualCash}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="investedCash" className="text-sm font-medium">
                    Invested Cash (₹)
                  </label>
                  <NeomorphInput
                    id="investedCash"
                    type="number"
                    className="border border-gray-300"
                    value={formData.investedCash}
                    onChange={e =>
                      handleInputChange('investedCash', e.target.value)
                    }
                    placeholder="0"
                    error={errors.investedCash}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="currentValue" className="text-sm font-medium">
                    Current Value (₹)
                  </label>
                  <NeomorphInput
                    id="currentValue"
                    type="number"
                    className="border border-gray-300"
                    value={formData.currentValue}
                    onChange={e =>
                      handleInputChange('currentValue', e.target.value)
                    }
                    placeholder="0"
                    error={errors.currentValue}
                  />
                </div>
              </div>

              {/* Month Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={formData.month}
                  onValueChange={value => handleInputChange('month', value)}
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl shadow-neomorph bg-background ${errors.month ? 'border-destructive' : ''}`}
                  >
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(month => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.month && (
                  <p className="text-xs text-destructive mt-1 ml-1">
                    {errors.month}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-primary hover:shadow-hover-glow transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Add Particular'}
                </Button>
              </motion.div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Summary Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Preview Card */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Title:</span>
                <span className="font-medium">
                  {formData.title || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="font-medium">
                  {formData.category || 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Actual Cash:
                </span>
                <span className="font-medium text-success">
                  {formData.actualCash
                    ? formatCurrency(Number(formData.actualCash))
                    : '₹0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Invested Cash:
                </span>
                <span className="font-medium text-warning">
                  {formData.investedCash
                    ? formatCurrency(Number(formData.investedCash))
                    : '₹0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Value:
                </span>
                <span className="font-medium text-primary">
                  {formData.currentValue
                    ? formatCurrency(Number(formData.currentValue))
                    : '₹0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Month:</span>
                <span className="font-medium">
                  {formData.month || 'Not selected'}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Actual Cash</p>
                  <p className="text-xs text-muted-foreground">
                    Current market value or available balance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-chart-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Invested Cash</p>
                  <p className="text-xs text-muted-foreground">
                    Original amount you invested or deposited
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
