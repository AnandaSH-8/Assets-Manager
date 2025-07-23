import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Plus, Wallet, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { NeomorphInput } from "@/components/ui/neomorph-input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const categories = [
  "Bank Account",
  "Fixed Deposit",
  "Mutual Fund",
  "Stocks",
  "Real Estate",
  "Gold",
  "Crypto Currency",
  "Other"
]

export default function AddParticulars() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    actualCash: "",
    investedCash: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (!formData.actualCash || isNaN(Number(formData.actualCash))) {
      newErrors.actualCash = "Valid actual cash amount is required"
    }
    if (!formData.investedCash || isNaN(Number(formData.investedCash))) {
      newErrors.investedCash = "Valid invested cash amount is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      })
      return
    }

    // Here you would normally save to Supabase
    console.log("Saving particular:", formData)
    
    toast({
      title: "Success!",
      description: "Financial particular has been added successfully.",
    })

    // Reset form
    setFormData({
      title: "",
      category: "",
      actualCash: "",
      investedCash: ""
    })
  }

  const calculateDifference = () => {
    const actual = Number(formData.actualCash) || 0
    const invested = Number(formData.investedCash) || 0
    return actual - invested
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

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
          Add new assets, investments, or financial entries to track your portfolio
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

              {/* Title Field */}
              <div>
                <NeomorphInput
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., HDFC Savings Account"
                  error={errors.title}
                />
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="h-12 rounded-xl shadow-neomorph bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive mt-1 ml-1">{errors.category}</p>
                )}
              </div>

              {/* Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeomorphInput
                  label="Actual Cash (₹)"
                  type="number"
                  value={formData.actualCash}
                  onChange={(e) => handleInputChange("actualCash", e.target.value)}
                  placeholder="0"
                  error={errors.actualCash}
                />

                <NeomorphInput
                  label="Invested Cash (₹)"
                  type="number"
                  value={formData.investedCash}
                  onChange={(e) => handleInputChange("investedCash", e.target.value)}
                  placeholder="0"
                  error={errors.investedCash}
                />
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:shadow-hover-glow transition-all duration-300"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Particular
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
                  {formData.title || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="font-medium">
                  {formData.category || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Actual Cash:</span>
                <span className="font-medium text-success">
                  {formData.actualCash ? formatCurrency(Number(formData.actualCash)) : "₹0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Invested Cash:</span>
                <span className="font-medium text-warning">
                  {formData.investedCash ? formatCurrency(Number(formData.investedCash)) : "₹0"}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Difference:</span>
                  <span className={`font-bold ${
                    calculateDifference() >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {formatCurrency(calculateDifference())}
                  </span>
                </div>
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
  )
}