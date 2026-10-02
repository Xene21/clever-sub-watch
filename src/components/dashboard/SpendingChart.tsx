import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { groupByCategory, Subscription } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SpendingChartProps {
  subscriptions: Subscription[];
}

const SpendingChart = ({ subscriptions }: SpendingChartProps) => {
  const [period, setPeriod] = useState<'3M' | '6M' | '1Y'>('3M');

  const categoryGroups = groupByCategory(subscriptions.filter(s => s.status === 'active'));
  
  const data = Object.entries(categoryGroups).map(([category, subs]) => ({
    name: category,
    value: subs.reduce((sum, sub) => {
      if (sub.frequency === 'yearly') return sum + sub.amount / 12;
      return sum + sub.amount;
    }, 0),
  })).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/5 bg-background/90 backdrop-blur-md shadow-2xl rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 mb-1">{payload[0].payload.name}</p>
          <p className="font-mono tabular-nums font-bold text-lg text-primary">
            ${payload[0].value.toFixed(2)}
            <span className="text-xs text-muted-foreground font-sans font-normal ml-1">/mo</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const springTransition = { type: 'spring', stiffness: 400, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ...springTransition }}
      className="glass-card p-6 border border-white/5 rounded-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-semibold tracking-tight text-lg text-foreground">Spending Overview</h3>
        
        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          {['3M', '6M', '1Y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all relative",
                period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {period === p && (
                <motion.div
                  layoutId="period-indicator"
                  className="absolute inset-0 bg-white/10 rounded-md border border-white/10"
                  transition={springTransition}
                />
              )}
              <span className="relative z-10">{p}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(43 57% 65%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(43 57% 65%)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)', fontFamily: 'monospace' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar 
              dataKey="value" 
              fill="url(#goldGradient)" 
              radius={[4, 4, 0, 0]}
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SpendingChart;
