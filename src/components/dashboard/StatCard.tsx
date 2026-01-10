import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  delay?: number;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon: Icon, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-lg",
              changeType === 'positive' && "text-success bg-success/10",
              changeType === 'negative' && "text-destructive bg-destructive/10",
              changeType === 'neutral' && "text-muted-foreground bg-muted"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p className="font-display text-3xl font-bold">{value}</p>
    </motion.div>
  );
};

export default StatCard;
