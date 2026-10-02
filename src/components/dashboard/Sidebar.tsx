import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  LayoutDashboard, 
  CreditCard, 
  BrainCircuit, 
  Building2, 
  Settings, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
  { icon: BrainCircuit, label: 'AI Insights', href: '/dashboard/insights' },
  { icon: Building2, label: 'Connect Bank', href: '/dashboard/connect' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const springConfig = { type: 'spring', stiffness: 400, damping: 30 };

const DashboardSidebar = ({ mobileOpen, collapsed, setCollapsed }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      localStorage.removeItem('userName');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.href = '/';
    }
  };

  const sidebarWidth = collapsed ? 80 : 256;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={springConfig}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col bg-[#080d16] bg-gradient-to-b from-white/[0.03] to-transparent border-r border-white/10",
        // Mobile behavior: slide in/out
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="p-5 flex items-center justify-between h-[84px] shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(235,200,125,0.2)]"
          >
            <Sparkles className="w-5 h-5 text-black" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
              >
                Subpilot
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        <motion.button
          animate={{ rotate: collapsed ? 180 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden md:flex p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground z-10 shrink-0",
            collapsed && "absolute -right-3 top-8 bg-[#080d16] border border-white/10 shadow-sm"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 overflow-hidden relative",
                      isActive
                        ? "bg-white/5 border-l-2 border-primary text-white"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive && "text-primary")} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium tracking-tight whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        <div className="flex items-center gap-3 mb-3 px-2 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-white">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col whitespace-nowrap overflow-hidden"
              >
                <span className="text-sm font-medium text-white tracking-tight">{userName}</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors w-full overflow-hidden",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
