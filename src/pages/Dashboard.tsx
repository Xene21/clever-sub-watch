import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import StatCard from '@/components/dashboard/StatCard';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import SubscriptionDetail from '@/components/dashboard/SubscriptionDetail';
import { 
  mockSubscriptions, 
  calculateMonthlySpend, 
  calculateYearlySpend,
  Subscription 
} from '@/lib/mock-data';
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';

const Dashboard = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'name'>('amount');

  const monthlySpend = calculateMonthlySpend(mockSubscriptions);
  const yearlySpend = calculateYearlySpend(mockSubscriptions);
  const activeCount = mockSubscriptions.filter(s => s.status === 'active').length;
  const upcomingRenewals = mockSubscriptions
    .filter(s => s.status === 'active')
    .filter(s => {
      const nextDate = new Date(s.nextBillingDate);
      const today = new Date();
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    }).length;

  const filteredSubscriptions = mockSubscriptions
    .filter(s => s.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'date') return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      return a.merchant.localeCompare(b.merchant);
    });

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track and manage all your subscriptions in one place.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Spend"
            value={`$${monthlySpend.toFixed(2)}`}
            change="+2.4%"
            changeType="negative"
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Yearly Spend"
            value={`$${yearlySpend.toFixed(2)}`}
            icon={TrendingUp}
            delay={0.1}
          />
          <StatCard
            title="Active Subscriptions"
            value={activeCount.toString()}
            change="+1"
            changeType="neutral"
            icon={CreditCard}
            delay={0.2}
          />
          <StatCard
            title="Renewals This Week"
            value={upcomingRenewals.toString()}
            icon={AlertCircle}
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscriptions List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card p-6"
            >
              {/* Search and Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 bg-secondary/50 border-border/50"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort tabs */}
              <div className="flex gap-2 mb-6">
                {(['amount', 'date', 'name'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      sortBy === sort 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sort === 'date' ? 'Next Billing' : sort}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredSubscriptions.map((sub, index) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    delay={0.05 * index}
                    onClick={() => setSelectedSubscription(sub)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <div>
            <SpendingChart />
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <SubscriptionDetail
        subscription={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  );
};

export default Dashboard;
