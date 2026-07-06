import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaidLink } from 'react-plaid-link';
import { toast } from 'sonner';
import {
  Building2, Shield, CheckCircle, RefreshCw, Trash2,
  Loader2, AlertCircle, Landmark, Zap, ChevronRight,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlaidItem {
  id: string;
  institutionName: string | null;
  lastSyncedAt: string | null;
  subscriptionsDetected: number;
}

// ─── Plaid Link wrapper ───────────────────────────────────────────────────────

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: () => void;
}

function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const fetchLinkToken = useCallback(async () => {
    setTokenLoading(true);
    try {
      const res = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLinkToken(data.link_token);
    } catch {
      toast.error("We couldn't connect your bank. Try again.");
    } finally {
      setTokenLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      onSuccess(publicToken, metadata);
    },
    onExit: () => {
      onExit?.();
    },
  });

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || tokenLoading}
      size="lg"
      className="gap-2"
      id="plaid-link-button"
    >
      {tokenLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Landmark className="w-4 h-4" />
      )}
      Connect a Bank Account
    </Button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ConnectBank = () => {
  const [connectedItems, setConnectedItems] = useState<PlaidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch connected bank accounts
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plaid/items', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConnectedItems(data);
    } catch {
      setError('Failed to load bank accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Called after Plaid Link succeeds
  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    setExchanging(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token: publicToken,
          institution_name: metadata?.institution?.name ?? null,
          institution_id: metadata?.institution?.institution_id ?? null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        `${data.institutionName ?? 'Bank'} connected! ${data.subscriptionsDetected} subscription(s) detected.`
      );
      await fetchItems();
    } catch {
      setError("We couldn't connect your bank. Try again.");
      toast.error("We couldn't connect your bank. Try again.");
    } finally {
      setExchanging(false);
    }
  };

  // Sync a specific bank account
  const handleSync = async (itemId: string) => {
    setSyncingId(itemId);
    try {
      const res = await fetch('/api/plaid/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Synced! ${data.subscriptionsDetected} subscription(s) detected.`);
      await fetchItems();
    } catch {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncingId(null);
    }
  };

  // Disconnect a bank account
  const handleDisconnect = async (itemId: string) => {
    try {
      const res = await fetch(`/api/plaid/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      toast.success('Bank account disconnected.');
      setConnectedItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  const formatSyncTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never synced';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="ml-64 p-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">Connect Your Bank</h1>
          <p className="text-muted-foreground">
            Link your accounts to automatically detect and track subscriptions.
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card p-4 mb-6 flex items-center gap-3 border border-destructive/30 bg-destructive/10"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold mb-1">Bank-Grade Security</h3>
            <p className="text-muted-foreground text-sm">
              Your connection is secured by Plaid, the same technology used by Venmo, Coinbase, and
              Betterment. We use AES-256-GCM encryption and never store your banking credentials.
              SubPilot has read-only access, we cannot move money.
            </p>
          </div>
        </motion.div>

        {/* Connected accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-display text-xl font-semibold mb-4">Connected Accounts</h2>

          {loading ? (
            <div className="glass-card p-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : connectedItems.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No banks connected yet.</p>
              <p className="text-muted-foreground text-xs mt-1">
                Connect a bank below to start detecting subscriptions automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {connectedItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Landmark className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {item.institutionName ?? 'Connected Bank'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Last synced: {formatSyncTime(item.lastSyncedAt)} ·{' '}
                          <span className="text-primary font-medium">
                            {item.subscriptionsDetected} subscription(s) detected
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-success mr-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Connected</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(item.id)}
                        disabled={syncingId === item.id}
                        className="gap-1.5"
                        id={`sync-btn-${item.id}`}
                      >
                        {syncingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Sync Now
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            id={`disconnect-btn-${item.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Bank</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove{' '}
                              <strong>{item.institutionName ?? 'this bank'}</strong> from SubPilot
                              and stop syncing transactions. Auto-detected subscriptions from this
                              bank will remain in your dashboard.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDisconnect(item.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Add new bank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">
                  {connectedItems.length > 0 ? 'Add Another Account' : 'Get Started'}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                SubPilot analyses up to 24 months of transaction history to detect recurring
                payments. The whole process takes under 60 seconds.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  'We support 10,000+ financial institutions',
                  'Read-only access — we can never move your money',
                  'Powered by Plaid — used by Venmo, Robinhood & more',
                ].map(point => (
                  <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                    {point}
                  </div>
                ))}
              </div>

              {exchanging ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Connecting your bank and scanning transactions…
                </div>
              ) : (
                <PlaidLinkButton
                  onSuccess={handlePlaidSuccess}
                  onExit={() => setError(null)}
                />
              )}
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground mt-6 text-xs"
        >
          Can't find your bank?{' '}
          <a href="#" className="text-primary hover:underline">
            Contact support
          </a>
        </motion.p>
      </main>
    </div>
  );
};

export default ConnectBank;
