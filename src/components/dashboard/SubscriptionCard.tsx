import { AnimatePresence, motion } from 'framer-motion';
import { Subscription } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Calendar, MoreHorizontal, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/dashboard/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

interface SubscriptionCardProps {
  subscription: Subscription;
  delay?: number;
  onClick?: () => void;
}

const SubscriptionCard = ({ subscription, delay = 0, onClick }: SubscriptionCardProps) => {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const getDaysUntil = (dateString: string) => {
    const nextDate = new Date(dateString);
    const today = new Date();
    // Assuming nextDate is in the future.
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'in 1d';
    return `in ${diffDays}d`;
  };

  const statusConfig = {
    active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
    paused: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
    cancelled: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
    trial: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  };

  const currentStatus = statusConfig[subscription.status];

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = subscription.status === 'active' ? 'paused' : 'active';
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Subscription ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      toast.success('Subscription deleted');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const springTransition = { type: 'spring', stiffness: 400, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ...springTransition }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
      className="glass-card-hover p-4 cursor-pointer group relative overflow-hidden flex items-center justify-between border border-white/5 rounded-xl"
      onClick={onClick}
    >
      {/* Active Indicator Bar */}
      {subscription.status === 'active' && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-success" />
      )}

      {/* Left side */}
      <div className="flex items-center gap-4 flex-1">
        <BrandLogo logo={subscription.logo} color={subscription.color} size="lg" />
        <div className="flex flex-col">
          <h3 className="font-semibold tracking-tight text-sm sm:text-base text-foreground">{subscription.merchant}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
            <Calendar className="w-3 h-3" />
            <span>{getDaysUntil(subscription.nextBillingDate)}</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Status Badge */}
        <div className={cn("hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase", currentStatus.bg, currentStatus.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", currentStatus.dot)} />
          {subscription.status}
        </div>

        {/* Amount & Frequency */}
        <div className="flex flex-col items-end">
          <span className="font-mono tabular-nums font-bold text-lg text-foreground">
            ${subscription.amount.toFixed(2)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            /{subscription.frequency === 'yearly' ? 'yr' : 'mo'}
          </span>
        </div>

        {/* Actions Dropdown */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
                className="absolute inset-0"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 bg-background/50 backdrop-blur-sm border border-white/5 hover:bg-white/10">
                      <MoreHorizontal className="w-4 h-4 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover/90 backdrop-blur-md border-white/10 shadow-2xl">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatus}>
                      {subscription.status === 'active' ? (
                        <><PauseCircle className="mr-2 h-4 w-4" />Pause</>
                      ) : (
                        <><PlayCircle className="mr-2 h-4 w-4" />Resume</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionCard;
