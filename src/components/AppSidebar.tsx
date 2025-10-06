import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    description: 'Overview of your assets',
    alwaysShow: true,
  },
  {
    title: 'Add Particulars',
    url: '/add-particulars',
    icon: Plus,
    description: 'Add new financial entries',
    alwaysShow: true,
  },
  {
    title: 'Statistics',
    url: '/statistics',
    icon: BarChart3,
    description: 'View detailed analytics',
    alwaysShow: false,
  },
  {
    title: 'Comparison',
    url: '/comparison',
    icon: TrendingUp,
    description: 'Compare periods and trends',
    alwaysShow: false,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'Account and data settings',
    alwaysShow: true,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === 'collapsed';

  // Check if user has data - replace with real Supabase query
  const [hasData, setHasData] = useState(false);

  useState(() => {
    // Mock check - replace with actual data query
    setHasData(false); // Set to true when user has added particulars
  });

  // Filter navigation items based on data availability
  const visibleItems = navigationItems.filter(
    item => item.alwaysShow || hasData,
  );

  const getNavClassName = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-r-2 border-green-500'
      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100';
  };

  return (
    <Sidebar className="border-r bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      {/* Header */}
      <SidebarHeader
        className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
        style={{
          background:
            'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(158, 64%, 52%) 100%)',
        }}
      >
        <motion.div
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 text-white">
            <IndianRupee className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold text-white">AssetsManager</h2>
            </motion.div>
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2 bg-slate-50/50 dark:bg-slate-800/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 px-3 py-2">
            {!isCollapsed ? 'Navigation' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map(item => (
                <SidebarMenuItem className="w-full h-10" key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="transition-all duration-100 h-10"
                  >
                    <NavLink
                      to={item.url}
                      className={`${getNavClassName(item.url)} px-3 py-3 rounded-xl group relative overflow-hidden`}
                    >
                      <motion.div
                        className="flex items-center gap-3 "
                        whileHover={{ x: 2 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        <item.icon className="w-5 h-8 shrink-0 " />
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
      <SidebarFooter className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
        {/* User Info */}
        {user && !isCollapsed && (
          <motion.div
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
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
          animate={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
        >
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'sm'}
            onClick={toggleTheme}
            className="rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <span className="ml-2">
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            )}
          </Button>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
