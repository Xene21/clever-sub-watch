import { motion, AnimatePresence } from 'framer-motion';
import { Subscription } from '@/lib/mock-data';
import { X, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionDetailProps {
  subscription: Subscription | null;
  onClose: () => void;
}

const SubscriptionDetail = ({ subscription, onClose }: SubscriptionDetailProps) => {
  if (!subscription) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const calculateAverageCharge = () => {
    if (subscription.history.length === 0) return subscription.amount;
    const total = subscription.history.reduce((sum, h) => sum + h.amount, 0);
    return total / subscription.history.length;
  };

  return (
    <AnimatePresence>
      {subscription && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-lg bg-card border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <Button variant="destructive" size="sm">
                  Mark as Cancelled
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${subscription.color}20` }}
                >
                  {subscription.logo}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">{subscription.merchant}</h2>
                  <p className="text-muted-foreground capitalize">{subscription.category}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="text-muted-foreground text-sm mb-1">Current Amount</p>
                  <p className="font-display text-2xl font-bold">${subscription.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">per {subscription.frequency === 'yearly' ? 'year' : subscription.frequency === 'weekly' ? 'week' : 'month'}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-muted-foreground text-sm mb-1">Average Charge</p>
                  <p className="font-display text-2xl font-bold">${calculateAverageCharge().toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">based on history</p>
                </div>
              </div>

              {/* Next billing */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Next Billing Date</span>
                </div>
                <p className="text-xl font-display font-semibold">
                  {formatDate(subscription.nextBillingDate)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be charged ${subscription.amount.toFixed(2)}
                </p>
              </div>

              {/* Status alert */}
              {subscription.status === 'trial' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Trial Period Active</p>
                    <p className="text-sm text-muted-foreground">
                      This subscription is currently in a trial period. You'll be charged on the next billing date.
                    </p>
                  </div>
                </div>
              )}

              {subscription.status === 'paused' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted border border-border">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Subscription Paused</p>
                    <p className="text-sm text-muted-foreground">
                      This subscription appears to be paused. No recent charges detected.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment history */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Payment History</h3>
                </div>
                
                {subscription.history.length > 0 ? (
                  <div className="space-y-2">
                    {subscription.history.map((payment, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <span className="text-muted-foreground">{formatDate(payment.date)}</span>
                        <span className="font-medium">${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No payment history available yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionDetail;
