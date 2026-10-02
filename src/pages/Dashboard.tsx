import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
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
import {
  DollarSign, CreditCard, TrendingUp, AlertCircle,
  Search, SlidersHorizontal, ArrowUpRight, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const sortOptions = [
  { key: 'amount', label: 'Highest Spend' },
  { key: 'date', label: 'Next Billing' },
  { key: 'name', label: 'Name' },
] as const;

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

  const cachedName = localStorage.getItem('userName');
  const fullName = userData?.user?.name || cachedName;
  const firstName = fullName ? fullName.split(' ')[0] : 'back';

  const monthlySpend = calculateMonthlySpend(subscriptions);
  const monthlySpendChange = calculateMonthlySpendChange(subscriptions);
  const yearlySpend = calculateYearlySpend(subscriptions);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const activeCountChange = calculateActiveSubscriptionsChange(subscriptions);
  const upcomingRenewals = subscriptions
    .filter(s => s.status === 'active')
    .filter(s => {
      const nextDate = new Date(s.nextBillingDate);
      const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
      <main className="p-4 md:p-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="mb-8 flex items-start justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60 mb-1">
              Overview
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your subscriptions.
            </p>
          </div>
          <Link to="/dashboard/insights">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-sm shrink-0 hidden md:flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Insights
              <ArrowUpRight className="w-3 h-3 opacity-50" />
            </Button>
          </Link>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
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
            delay={0.05}
          />
          <StatCard
            title="Active"
            value={activeCount.toString()}
            change={`${activeCountChange >= 0 ? '+' : ''}${activeCountChange}`}
            changeType={activeCountChange > 0 ? 'negative' : activeCountChange < 0 ? 'positive' : 'neutral'}
            icon={CreditCard}
            delay={0.1}
          />
          <StatCard
            title="Renewing Soon"
            value={upcomingRenewals.toString()}
            icon={AlertCircle}
            delay={0.15}
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Subscriptions Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.15 }}
              className="rounded-xl border border-white/8 bg-card/40 backdrop-blur-sm overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                <div>
                  <h2 className="font-display font-semibold tracking-tight text-sm">Subscriptions</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isLoading ? '—' : `${activeCount} active`}
                  </p>
                </div>
                <Link to="/dashboard/subscriptions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
                  >
                    View all
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* Search + Sort */}
              <div className="px-5 pt-4 pb-3 border-b border-white/6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm bg-white/5 border-white/8 focus:border-primary/40 placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* Sort tabs */}
                <div className="flex items-center gap-1 relative">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      className={`relative px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        sortBy === opt.key
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground/80'
                      }`}
                    >
                      {sortBy === opt.key && (
                        <motion.span
                          layoutId="sort-pill"
                          className="absolute inset-0 bg-white/8 rounded-md"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="p-3 space-y-1 min-h-[200px]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-14" />
                    </div>
                  ))
                ) : filteredSubscriptions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? 'No results found' : 'No subscriptions yet'}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {searchQuery ? 'Try a different search term' : 'Connect your bank to detect them automatically'}
                    </p>
                    {!searchQuery && (
                      <Link to="/dashboard/connect">
                        <Button size="sm" className="mt-4 gap-1.5 h-8 text-xs">
                          Connect Bank
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {filteredSubscriptions.slice(0, 8).map((sub, index) => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        delay={0.03 * index}
                        onClick={() => setSelectedSubscription(sub)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>

          {/* Chart Column */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
            >
              <SpendingChart subscriptions={subscriptions} />
            </motion.div>

            {/* Quick tip card */}
            {upcomingRenewals > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
                className="rounded-xl border border-warning/20 bg-warning/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-warning/15 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-warning">
                      {upcomingRenewals} renewal{upcomingRenewals > 1 ? 's' : ''} this week
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Review your upcoming charges to make sure nothing surprises you.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
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
