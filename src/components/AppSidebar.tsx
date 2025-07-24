import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Home, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Wallet,
  Sun,
  Moon,
  IndianRupee,
  Settings,
  LogOut,
  User
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    description: "Overview of your assets",
    alwaysShow: true
  },
  { 
    title: "Add Particulars", 
    url: "/add-particulars", 
    icon: Plus,
    description: "Add new financial entries",
    alwaysShow: true
  },
  { 
    title: "Statistics", 
    url: "/statistics", 
    icon: BarChart3,
    description: "View detailed analytics",
    alwaysShow: false
  },
  { 
    title: "Comparison", 
    url: "/comparison", 
    icon: TrendingUp,
    description: "Compare periods and trends",
    alwaysShow: false
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  const isCollapsed = state === "collapsed"
  
  // Check if user has data - replace with real Supabase query
  const [hasData, setHasData] = useState(false)
  
  useState(() => {
    // Mock check - replace with actual data query
    setHasData(false) // Set to true when user has added particulars
  })

  // Filter navigation items based on data availability
  const visibleItems = navigationItems.filter(item => 
    item.alwaysShow || hasData
  )

  const getNavClassName = (path: string) => {
    const isActive = currentPath === path
    return isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
  }

  return (
    <Sidebar className="border-r bg-gradient-card backdrop-blur-xl border-border/50">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <motion.div 
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground">
            <IndianRupee className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                AssetsManager
              </h2>
            </motion.div>
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            {!isCollapsed ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-all duration-200">
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} px-3 py-3 rounded-xl group relative overflow-hidden`}
                    >
                      <motion.div 
                        className="flex items-center gap-3"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col"
                          >
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.2 }}
                      />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-border/50 space-y-2">
        {/* User Info */}
        {user && !isCollapsed && (
          <motion.div 
            className="flex items-center gap-3 p-2 rounded-xl bg-accent/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Logged in</p>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="flex items-center gap-2"
          initial={false}
          animate={{ justifyContent: isCollapsed ? "center" : "space-between" }}
        >
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            onClick={toggleTheme}
            className="rounded-xl hover:bg-accent/50"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <span className="ml-2">
                {theme === "light" ? "Dark" : "Light"} Mode
              </span>
            )}
          </Button>
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}