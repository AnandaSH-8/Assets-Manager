import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Plus, Wallet, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { NeomorphInput } from "@/components/ui/neomorph-input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { financialAPI } from "@/services/api"
import { useAuth } from "@/hooks/useAuth"

const categories = [
  "Bank Account",
  "Fixed Deposit",
  "Mutual Fund",
  "Stocks",
  "Gold",
  "Crypto Currency",
  "Other"
]

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function AddParticulars() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    actualCash: "",
    investedCash: "",
    month: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedTitles, setSavedTitles] = useState<string[]>([])
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)

  // Fetch saved titles on component mount
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await financialAPI.getTitles()
        setSavedTitles(response.data || [])
      } catch (error) {
        console.error("Failed to fetch titles:", error)
      }
    }
    fetchTitles()
  }, [])

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
    if (!formData.month) {
      newErrors.month = "Month is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const filteredTitles = savedTitles.filter(title => 
    title.toLowerCase().includes(formData.title.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add financial particulars.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const totalAmount = Number(formData.actualCash) + Number(formData.investedCash)
      
      await financialAPI.create({
        category: formData.category,
        description: formData.title,
        amount: totalAmount,
        month: formData.month
      })
      
      toast({
        title: "Success!",
        description: "Financial particular has been added successfully.",
      })

      // Reset form
      setFormData({
        title: "",
        category: "",
        actualCash: "",
        investedCash: "",
        month: ""
      })
    } catch (error) {
      console.error("Error saving financial particular:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save financial particular.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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

              {/* Title Field with Autocomplete */}
              <div className="space-y-2 relative">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <NeomorphInput
                  id="title"
                  className="border border-gray-300"
                  value={formData.title}
                  onChange={(e) => {
                    handleInputChange("title", e.target.value)
                    setShowTitleSuggestions(true)
                  }}
                  onFocus={() => setShowTitleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
                  placeholder="e.g., HDFC Savings Account"
                  error={errors.title}
                />
                {showTitleSuggestions && filteredTitles.length > 0 && formData.title && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredTitles.map((title, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
                        onMouseDown={() => {
                          handleInputChange("title", title)
                          setShowTitleSuggestions(false)
                        }}
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="space-y-2">
                <label htmlFor="actualCash" className="text-sm font-medium">Actual Cash (₹)</label>
                <NeomorphInput
                  id="actualCash"
                  type="number"
                  className="border border-gray-300"
                  value={formData.actualCash}
                  onChange={(e) => handleInputChange("actualCash", e.target.value)}
                  placeholder="0"
                  error={errors.actualCash}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="investedCash" className="text-sm font-medium">Invested Cash (₹)</label>
                <NeomorphInput
                  id="investedCash"
                  type="number"
                  className="border border-gray-300"
                  value={formData.investedCash}
                  onChange={(e) => handleInputChange("investedCash", e.target.value)}
                  placeholder="0"
                  error={errors.investedCash}
                />
              </div>
            </div>

            {/* Month Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select 
                value={formData.month} 
                onValueChange={(value) => handleInputChange("month", value)}
              >
                <SelectTrigger className={`h-12 rounded-xl shadow-neomorph bg-background ${errors.month ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && (
                <p className="text-xs text-destructive mt-1 ml-1">{errors.month}</p>
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
                  {isSubmitting ? "Saving..." : "Add Particular"}
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Month:</span>
                <span className="font-medium">
                  {formData.month || "Not selected"}
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
  )
}