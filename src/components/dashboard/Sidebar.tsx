import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  LayoutDashboard, 
  CreditCard, 
  BrainCircuit, 
  Link2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
  { icon: BrainCircuit, label: 'AI Insights', href: '/dashboard/insights' },
  { icon: Link2, label: 'Connections', href: '/dashboard/connect' },
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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const cachedName = localStorage.getItem('userName');
    if (cachedName) setUserName(cachedName);
    
    // Always fetch fresh user data to override stale local storage 
    // (especially important for OAuth logins where local storage wasn't set)
    api.get('/auth/me').then(res => {
      if (res?.user?.name) {
        setUserName(res.user.name);
        localStorage.setItem('userName', res.user.name);
      }
      if (res?.user?.email) {
        setUserEmail(res.user.email);
      }
    }).catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      localStorage.removeItem('userName');
      toast.success('Signed out successfully', {
        className: 'justify-end'
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect if API fails
      navigate('/');
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors w-full text-left overflow-hidden outline-none ring-0", collapsed ? "justify-center" : "")}>
              <div className="flex items-center gap-3">
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
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Pro Plan</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!collapsed && (
                <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side={collapsed ? "right" : "top"} 
            sideOffset={12}
            className="w-[240px] rounded-xl border-white/10 bg-[#0a1120] shadow-2xl p-1"
          >
            <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-white/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-white">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">{userName}</span>
                {userEmail && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">{userEmail}</span>
                )}
              </div>
            </div>
            
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="gap-2 cursor-pointer rounded-lg py-2.5 px-3 hover:bg-white/5 focus:bg-white/5 focus:text-white hover:text-white">
              <Settings className="w-4 h-4 text-muted-foreground group-focus:text-white" />
              <span className="font-medium text-sm">Account Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 gap-2 cursor-pointer rounded-lg py-2.5 px-3">
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
