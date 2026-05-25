import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { groupByCategory, Subscription } from '@/lib/mock-data';

interface SpendingChartProps {
  subscriptions: Subscription[];
}

const SpendingChart = ({ subscriptions }: SpendingChartProps) => {
  const categoryGroups = groupByCategory(subscriptions.filter(s => s.status === 'active'));
  
  const data = Object.entries(categoryGroups).map(([category, subs]) => ({
    name: category,
    value: subs.reduce((sum, sub) => {
      if (sub.frequency === 'yearly') return sum + sub.amount / 12;
      return sum + sub.amount;
    }, 0),
  }));

  const COLORS = ['#00d9a5', '#00b8d4', '#7c3aed', '#f59e0b', '#ef4444', '#10b981'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary font-display">${payload[0].value.toFixed(2)}/mo</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="font-display text-lg font-semibold mb-4">Spending by Category</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-muted-foreground truncate">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SpendingChart;
