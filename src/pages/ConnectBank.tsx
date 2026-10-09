import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuilttButton, QuilttAuthProvider } from '@quiltt/react';
import { toast } from 'sonner';
import {
  Building2, Shield, CheckCircle, RefreshCw, Trash2,
  Loader2, AlertCircle, Landmark, Zap, ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConnectedItem {
  id: string;
  institutionName: string | null;
  lastSyncedAt: string | null;
  subscriptionsDetected: number;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ConnectBank = () => {
  const [connectedItems, setConnectedItems] = useState<ConnectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);

  const CONNECTOR_ID = import.meta.env.VITE_QUILTT_CONNECTOR_ID as string;

  // Fetch connected bank accounts
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiltt/items', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConnectedItems(data);
    } catch {
      setError('Failed to load bank accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a Quiltt session token from our backend so QuilttButton can open
  const fetchSessionToken = useCallback(async () => {
    try {
      const res = await fetch('/api/quiltt/session', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSessionToken(data.token);
    } catch {
      toast.error("Couldn't initialise bank connection. Please refresh.");
    }
  }, []);

  const fetchGmailStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/status', { credentials: 'include' });
      const data = await res.json();
      if (data.connected) {
        setGmailConnected(true);
        setGmailEmail(data.email);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSessionToken();
    fetchGmailStatus();
  }, [fetchItems, fetchSessionToken, fetchGmailStatus]);

  // Called after Quiltt Connector succeeds — sends connection ID to backend
  const handleQuilttSuccess = async (connectionId: string, metadata: any) => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/quiltt/connection', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          sessionToken, // pass the profile-scoped token so the server can query Quiltt on our behalf
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      const bankName = data.institutionName ?? 'Bank';
      
      if (data.subscriptionsDetected > 0) {
        toast.success(`${bankName} connected! ${data.subscriptionsDetected} subscription(s) detected.`);
        await fetchItems();
      } else {
        // Initial 0 detected: start background polling
        const toastId = toast.loading(`${bankName} connected. Reading historical transactions...`);
        // Immediately fetch items so the bank shows up in the UI right away
        await fetchItems();
        
        let attempts = 0;
        const maxAttempts = 6; // Poll every 15s for 1.5 mins

        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const syncRes = await fetch('/api/quiltt/sync', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: data.itemId }),
            });
            const syncData = await syncRes.json();
            
            if (syncData.detected > 0) {
              toast.success(`Analysis complete! Found ${syncData.detected} subscription(s) in ${bankName}.`, { id: toastId });
              clearInterval(pollInterval);
              fetchItems();
            } else if (attempts >= maxAttempts) {
              toast.info(`Finished analyzing ${bankName}. No subscriptions detected yet.`, { id: toastId });
              clearInterval(pollInterval);
              fetchItems();
            }
          } catch (e) {
            // Silently fail the poll attempt and try again next tick
          }
        }, 15000);
      }
      
      // Refresh session token so the connector can be opened again
      await fetchSessionToken();
    } catch {
      setError("We couldn't connect your bank. Try again.");
      toast.error("We couldn't connect your bank. Try again.");
    } finally {
      setSyncing(false);
    }
  };

  // Sync a specific bank account
  const handleSync = async (itemId: string) => {
    setSyncingId(itemId);
    try {
      const res = await fetch('/api/quiltt/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Synced! ${data.subscriptionsDetected} new subscription(s) detected.`);
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
      const res = await fetch(`/api/quiltt/items/${itemId}`, {
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
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
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
              Your connection is secured by Quiltt, an open-banking platform trusted by
              thousands of apps. We use AES-256 encryption and never store your banking
              credentials. Subpilot has read-only access — we cannot move money.
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
                    className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Landmark className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {item.institutionName ?? 'Connected Bank'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Last synced: {formatSyncTime(item.lastSyncedAt)} &middot;{' '}
                          <span className="text-primary font-medium block sm:inline mt-1 sm:mt-0">
                            {item.subscriptionsDetected} subscription(s) detected
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0">
                      <div className="flex items-center gap-1.5 text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Connected</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(item.id)}
                          disabled={syncingId === item.id}
                          className="gap-1.5 h-8 text-xs"
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
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              id={`disconnect-btn-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Bank</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove{' '}
                              <strong>{item.institutionName ?? 'this bank'}</strong> from Subpilot
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
                      </AlertDialog></div></div></motion.div>
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
          className="glass-card p-8 mb-8"
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
                Subpilot analyses up to 6 months of transaction history to detect recurring
                payments. The whole process takes under 60 seconds.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  'We support thousands of financial institutions',
                  'Read-only access — we can never move your money',
                  'Powered by Quiltt — secure open-banking infrastructure',
                ].map(point => (
                  <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                    {point}
                  </div>
                ))}
              </div>

              {syncing ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Connecting your bank and scanning transactions…
                </div>
              ) : sessionToken && CONNECTOR_ID ? (
                <QuilttAuthProvider token={sessionToken}>
                  <QuilttButton
                    connectorId={CONNECTOR_ID}
                    onExitSuccess={(metadata: any) => {
                      console.log('Quiltt onExitSuccess metadata:', metadata);
                      const connectionId = metadata?.connectionId;
                      const instName =
                        metadata?.institution?.name ??
                        metadata?.connectorSession?.institution?.name ??
                        null;
                      handleQuilttSuccess(connectionId, { institution: { name: instName } });
                    }}
                    onExit={() => setError(null)}
                  >
                    <Button size="lg" className="gap-2" id="quiltt-connect-button">
                      <Landmark className="w-4 h-4" />
                      Connect a Bank Account
                    </Button>
                  </QuilttButton>
                </QuilttAuthProvider>
              ) : (
                <Button size="lg" className="gap-2" disabled>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Add Gmail Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                <h2 className="font-display text-xl font-semibold">
                  Connect Gmail
                </h2>
              </div>
              
              {gmailConnected ? (
                <>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your Gmail account <strong className="text-foreground">{gmailEmail}</strong> is securely connected. We automatically scan for receipts and subscriptions in the background.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 text-success border-success/20 bg-success/5 hover:bg-success/10 hover:text-success cursor-default">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </Button>
                    <Button 
                      variant="default"
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isSyncingGmail}
                      onClick={async () => {
                        setIsSyncingGmail(true);
                        const toastId = toast.loading('Scanning emails for receipts...');
                        try {
                          const res = await fetch('/api/auth/google/sync', { method: 'POST', credentials: 'include' });
                          const data = await res.json();
                          if (data.success) {
                            toast.success(`Scan complete! Found ${data.detected} subscriptions.`, { id: toastId });
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (e) {
                          toast.error('Scan failed. Try again later.', { id: toastId });
                        } finally {
                          setIsSyncingGmail(false);
                        }
                      }}
                    >
                      {isSyncingGmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Sync Emails
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/google/disconnect', { method: 'POST', credentials: 'include' });
                          setGmailConnected(false);
                          setGmailEmail(null);
                          toast.success('Gmail disconnected successfully.');
                        } catch(e) {
                          toast.error('Failed to disconnect Gmail');
                        }
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm mb-6">
                    Securely connect your Gmail to detect receipts and subscriptions that aren't tied to a specific bank account.
                  </p>

                  <div className="space-y-2 mb-6">
                    {[
                      'Detects emailed receipts from software & services',
                      'Finds subscriptions paid via PayPal or Apple Pay',
                      'Read-only access — we never delete or send emails',
                    ].map(point => (
                      <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 text-red-500/80 shrink-0" />
                        {point}
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="gap-2 bg-white/5 hover:bg-white/10 hover:text-white border-white/10"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/google/url', { credentials: 'include' });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (e) {
                        toast.error('Failed to initialize Google Login');
                      }
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Connect Gmail Account
                  </Button>
                </>
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



