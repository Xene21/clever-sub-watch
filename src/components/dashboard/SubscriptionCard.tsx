import { motion } from 'framer-motion';
import { Subscription } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/dashboard/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubscriptionCardProps {
  subscription: Subscription;
  delay?: number;
  onClick?: () => void;
}

const SubscriptionCard = ({ subscription, delay = 0, onClick }: SubscriptionCardProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card-hover p-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <BrandLogo logo={subscription.logo} color={subscription.color} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{subscription.merchant}</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", statusColors[subscription.status])}>
              {subscription.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Next: {formatDate(subscription.nextBillingDate)}</span>
            <span className="text-border">•</span>
            <span className="capitalize">{subscription.frequency}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="font-display text-xl font-bold">
            ${subscription.amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">/{subscription.frequency === 'yearly' ? 'year' : 'mo'}</p>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Pause Subscription</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Mark as Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default SubscriptionCard;
