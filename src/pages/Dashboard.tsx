import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import StatCard from '@/components/dashboard/StatCard';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import SubscriptionDetail from '@/components/dashboard/SubscriptionDetail';
import { 
  calculateMonthlySpend, 
  calculateMonthlySpendChange,
  calculateActiveSubscriptionsChange,
  calculateYearlySpend,
  Subscription 
} from '@/lib/mock-data';
import { api } from '@/lib/api';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { DollarSign, CreditCard, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';

const Dashboard = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'name'>('amount');

  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const { data: userData } = useQuery<{ user: { id: string; name: string; email: string } }>({
    queryKey: ['me'],
    queryFn: async () => api.get('/auth/me'),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  const fullName = userData?.user?.name ?? 'Dashboard';
  const firstName = fullName.split(' ')[0] || 'Dashboard';

  const monthlySpend = calculateMonthlySpend(subscriptions);
  const monthlySpendChange = calculateMonthlySpendChange(subscriptions);
  const yearlySpend = calculateYearlySpend(subscriptions);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const activeCountChange = calculateActiveSubscriptionsChange(subscriptions);
  const upcomingRenewals = subscriptions
    .filter(s => s.status === 'active')
    .filter(s => {
      const nextDate = new Date(s.nextBillingDate);
      const today = new Date();
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    }).length;

  const filteredSubscriptions = subscriptions
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
          <h1 className="font-display text-3xl font-bold mb-2">Welcome {firstName}!</h1>
          <p className="text-muted-foreground">Track and manage all your subscriptions in one place.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Spend"
            value={`$${monthlySpend.toFixed(2)}`}
            change={`${monthlySpendChange > 0 ? '+' : ''}${monthlySpendChange.toFixed(1)}%`}
            changeType={monthlySpendChange > 0 ? 'negative' : monthlySpendChange < 0 ? 'positive' : 'neutral'}
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
            change={`${activeCountChange >= 0 ? '+' : ''}${activeCountChange}`}
            changeType={activeCountChange > 0 ? 'negative' : activeCountChange < 0 ? 'positive' : 'neutral'}
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
            <SpendingChart subscriptions={subscriptions} />
          </div>
        </div>
        </>
        )}
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
