import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, RefreshCw, XCircle, Loader2, AlertCircle, Tag, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import DashboardSidebar from '@/components/dashboard/Sidebar';
import BrandLogo from '@/components/dashboard/BrandLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBrandInfo } from '@/lib/brands';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  date: string;
  amount: number;
}

interface SubscriptionDetail {
  id: string;
  merchant: string;
  logo: string;
  color: string;
  amount: number;
  frequency: string;
  category: string;
  status: string;
  startDate: string;
  lastBillingDate: string | null;
  nextBillingDate: string;
  detectionSource: string;
  history: HistoryEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeHistory(
  startDate: string,
  lastBillingDate: string | null,
  billingCycle: string,
  amount: number
): HistoryEntry[] {
  const start = new Date(startDate);
  const end = lastBillingDate ? new Date(lastBillingDate) : new Date();
  const entries: HistoryEntry[] = [];
  const current = new Date(start);

  while (current <= end) {
    entries.push({
      date: current.toISOString().split('T')[0],
      amount,
    });
    switch (billingCycle) {
      case 'weekly':    current.setDate(current.getDate() + 7);   break;
      case 'monthly':   current.setMonth(current.getMonth() + 1); break;
      case 'quarterly': current.setMonth(current.getMonth() + 3); break;
      case 'yearly':    current.setFullYear(current.getFullYear() + 1); break;
      default:          current.setMonth(current.getMonth() + 1);
    }
  }
  return entries.reverse(); // most recent first
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SubscriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sub, isLoading, isError } = useQuery<SubscriptionDetail>({
    queryKey: ['subscription', id],
    queryFn: async () => {
      const res = await fetch(`/api/subscriptions/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Unable to load details.');
      const data = await res.json();
      // Enrich logo + color if not explicitly set
      const hasExplicitLogo = data.logo && data.logo !== '📦';
      if (!hasExplicitLogo) {
        const brand = getBrandInfo(data.merchant);
        data.logo = brand.logo;
        data.color = brand.color;
      }
      return data;
    },
  });

  const handleMarkCancelled = async () => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Subscription marked as cancelled.');
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch {
      toast.error('Failed to update subscription.');
    }
  };

  const handleNotASubscription = async () => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      toast.success('Removed from subscriptions.');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      navigate('/dashboard/subscriptions');
    } catch {
      toast.error('Failed to remove subscription.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <main className="ml-64 p-8 flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (isError || !sub) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <main className="ml-64 p-8">
          <div className="glass-card p-10 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-3" />
            <p className="text-muted-foreground">Unable to load details.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const history = computeHistory(sub.startDate, sub.lastBillingDate, sub.frequency, sub.amount);
  const days = daysUntil(sub.nextBillingDate);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="ml-64 p-8 max-w-4xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard/subscriptions')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          id="back-to-subscriptions"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Subscriptions</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <BrandLogo logo={sub.logo} color={sub.color} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold">{sub.merchant}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={
                    sub.status === 'active'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : sub.status === 'paused'
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }
                >
                  {sub.status}
                </Badge>
                <Badge variant="outline" className="capitalize text-muted-foreground">
                  {sub.frequency}
                </Badge>
                {sub.detectionSource === 'plaid' && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                    Auto-detected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-3xl font-bold font-display">${sub.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground capitalize">per {sub.frequency.replace('ly', '')}</p>
          </div>
        </motion.div>

        {/* Billing info cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Clock className="w-4 h-4" />
              Last Charge
            </div>
            <p className="font-semibold">
              {sub.lastBillingDate ? formatDate(sub.lastBillingDate) : formatDate(sub.startDate)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">${sub.amount.toFixed(2)}</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Calendar className="w-4 h-4" />
              Next Charge
            </div>
            <p className="font-semibold">{formatDate(sub.nextBillingDate)}</p>
            <p className={`text-sm mt-0.5 font-medium ${days <= 3 ? 'text-destructive' : days <= 7 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
              {days === 0 ? 'Today' : days < 0 ? 'Overdue' : `In ${days} day${days === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Tag className="w-4 h-4" />
              Category
            </div>
            <p className="font-semibold">{sub.category}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Since {formatDate(sub.startDate)}
            </p>
          </div>
        </motion.div>

        {/* Transaction history */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="font-display text-lg font-semibold mb-4">Payment History</h2>

          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No payment history available.</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    <span className="text-sm">{formatDate(entry.date)}</span>
                    {i === 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Most recent
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium text-sm">${entry.amount.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            onClick={handleMarkCancelled}
            disabled={sub.status === 'cancelled'}
            className="gap-2"
            id="mark-cancelled-btn"
          >
            <XCircle className="w-4 h-4" />
            Mark as Cancelled
          </Button>
          <Button
            variant="ghost"
            onClick={handleNotASubscription}
            className="gap-2 text-muted-foreground hover:text-destructive"
            id="not-a-subscription-btn"
          >
            <RefreshCw className="w-4 h-4" />
            Not a Subscription
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default SubscriptionDetail;
