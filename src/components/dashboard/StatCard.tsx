import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative overflow-hidden p-5 rounded-2xl border border-white/10 bg-[#080d16]/40 backdrop-blur-md"
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {change && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              isPositive && "text-success bg-success/10",
              isNegative && "text-destructive bg-destructive/10",
              changeType === 'neutral' && "text-muted-foreground bg-white/5"
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {changeType === 'neutral' && <Minus className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-muted-foreground text-sm mb-1 tracking-tight">{title}</p>
        <p className="font-mono tabular-nums text-2xl font-bold tracking-tight text-white">{value}</p>
      </div>

      {/* Faint watermark icon */}
      <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 pointer-events-none transform -rotate-12" />
    </motion.div>
  );
};

export default StatCard;
