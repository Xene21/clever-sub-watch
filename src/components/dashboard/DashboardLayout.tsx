import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './Sidebar';
import { Menu, X, Sparkles, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('User');

  useEffect(() => {
    setMobileOpen(false);
    const cached = localStorage.getItem('userName');
    if (cached) setUserName(cached);
  }, [location.pathname]);

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
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar/80 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4 z-40">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold tracking-tight">Subpilot</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors">
              <span className="text-xs font-medium text-white">{userName.charAt(0).toUpperCase()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 cursor-pointer">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <DashboardSidebar 
        mobileOpen={mobileOpen} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      {/* Main Content */}
      <motion.main 
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          "flex-1 w-full pt-14 md:pt-0 min-h-screen",
          collapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
