import { motion } from 'framer-motion';
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

interface SubscriptionCardProps {
  subscription: Subscription;
  delay?: number;
  onClick?: () => void;
}

const SubscriptionCard = ({ subscription, delay = 0, onClick }: SubscriptionCardProps) => {
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusColors = {
    active: 'bg-success/10 text-success',
    paused: 'bg-warning/10 text-warning',
    cancelled: 'bg-destructive/10 text-destructive',
    trial: 'bg-primary/10 text-primary',
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card-hover p-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Logo & Info */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Logo - responsive sizing */}
          <BrandLogo logo={subscription.logo} color={subscription.color} size="md" className="sm:hidden" />
          <BrandLogo logo={subscription.logo} color={subscription.color} size="lg" className="hidden sm:flex" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
              <h3 className="font-semibold truncate text-sm sm:text-base">{subscription.merchant}</h3>
              <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 rounded-full capitalize shrink-0", statusColors[subscription.status])}>
                {subscription.status}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground truncate">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Next: {formatDate(subscription.nextBillingDate)}</span>
              <span className="text-border hidden sm:inline">•</span>
              <span className="capitalize hidden sm:inline">{subscription.frequency}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Amount & Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div className="text-right">
            <p className="font-display text-sm sm:text-xl font-bold">
              ${subscription.amount.toFixed(2)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">/{subscription.frequency === 'yearly' ? 'yr' : 'mo'}</p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 sm:mr-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default SubscriptionCard;


