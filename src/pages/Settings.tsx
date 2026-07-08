import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  User, Download, Trash2, Eye, EyeOff,
  Shield, CheckCircle, RefreshCw, AlertCircle, Building2, Landmark,
  Zap, ChevronRight, Loader2, TriangleAlert, Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ─── Main Component ───────────────────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate();

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw]     = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Fetch the real user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setName(data.user.name);
        setEmail(data.user.email);
        // Sync name to localStorage so the sidebar greeting stays up to date
        localStorage.setItem('userName', data.user.name);
      } catch {
        toast.error('Failed to load profile.');
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      // Keep localStorage in sync for the sidebar
      localStorage.setItem('userName', data.user.name);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Bank connection state ─────────────────────────────────────────────────
  const [connectedBanks, setConnectedBanks] = useState<PlaidItem[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setBanksLoading(true);
    try {
      const res = await fetch('/api/plaid/items', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConnectedBanks(data);
    } catch {
      toast.error('Failed to load bank accounts.');
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

  const [isExporting, setIsExporting] = useState<'csv' | 'json' | null>(null);

  const handleExportData = async (format: 'csv' | 'json') => {
    setIsExporting(format);
    try {
      const res = await fetch('/api/subscriptions', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const subs = await res.json();

      const date = new Date().toISOString().split('T')[0];
      let content: string;
      let mimeType: string;
      let filename: string;

      if (format === 'csv') {
        const headers = [
          'Name', 'Amount ($)', 'Frequency', 'Status',
          'Category', 'Start Date', 'Last Billing Date',
          'Next Billing Date', 'Detection Source',
        ];
        const rows = subs.map((s: any) => [
          `"${(s.merchant ?? '').replace(/"/g, '""')}"`,
          s.amount,
          s.frequency,
          s.status,
          `"${(s.category ?? '').replace(/"/g, '""')}"`,
          s.startDate ?? '',
          s.lastBillingDate ?? '',
          s.nextBillingDate ?? '',
          s.detectionSource ?? '',
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        mimeType = 'text/csv';
        filename = `subpilot-subscriptions-${date}.csv`;
      } else {
        content = JSON.stringify(subs, null, 2);
        mimeType = 'application/json';
        filename = `subpilot-subscriptions-${date}.json`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${subs.length} subscription(s) as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      // Clear any local state
      localStorage.clear();
      toast.success('Your account has been permanently deleted.');
      // Short delay so the toast is visible, then redirect
      setTimeout(() => navigate('/'), 1200);
    } catch {
      toast.error('Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  const handleDisconnectBank = async (id: string) => {
    try {
      const res = await fetch(`/api/plaid/items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      toast.success('Bank account disconnected.');
      setConnectedBanks(prev => prev.filter(b => b.id !== id));
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  const handleSyncBank = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch('/api/plaid/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id }),
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

  const handleAddConnection = () => {
    toast.info('Redirecting to bank connection flow…');
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </motion.div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar bg-secondary/50 h-auto p-1 mb-8 gap-2">
            <TabsTrigger value="personal" className="flex-shrink-0 h-auto py-2 px-4 whitespace-nowrap data-[state=active]:bg-background">Personal Info</TabsTrigger>
            <TabsTrigger value="banks" className="flex-shrink-0 h-auto py-2 px-4 whitespace-nowrap data-[state=active]:bg-background">Bank Connections</TabsTrigger>
            <TabsTrigger value="export" className="flex-shrink-0 h-auto py-2 px-4 whitespace-nowrap data-[state=active]:bg-background">Export Data</TabsTrigger>
            <TabsTrigger value="danger" className="flex-shrink-0 h-auto py-2 px-4 whitespace-nowrap data-[state=active]:bg-background text-destructive data-[state=active]:text-destructive">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-6">

            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <p className="text-xs text-muted-foreground">Update your name and email address</p>
                </div>
              </div>

              {profileLoading ? (
                <div className="space-y-4 max-w-md animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-secondary rounded" />
                    <div className="h-10 bg-secondary rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-secondary rounded" />
                    <div className="h-10 bg-secondary rounded-md" />
                  </div>
                  <div className="h-10 w-32 bg-secondary rounded-md" />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-secondary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary/50"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSavingProfile} className="mt-2 gap-2" id="save-profile-btn">
                    {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSavingProfile ? 'Saving…' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Change Password card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {/* Current password */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-secondary/50 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowCurrentPw(v => !v)}
                      tabIndex={-1}
                      aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-secondary/50 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNewPw(v => !v)}
                      tabIndex={-1}
                      aria-label={showNewPw ? 'Hide password' : 'Show password'}
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-secondary/50 pr-10 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPw(v => !v)}
                      tabIndex={-1}
                      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="mt-2 gap-2"
                  id="change-password-btn"
                >
                  {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSavingPassword ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          {/* Bank Connections Tab */}
          <TabsContent value="banks" className="space-y-6">

            {/* Security notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">Bank-Grade Security</h3>
                <p className="text-muted-foreground text-sm">
                  Your connection is secured by Plaid, the same technology used by Venmo, Coinbase, and
                  Betterment. We use AES-256-GCM encryption and never store your banking credentials.
                  SubPilot has read-only access — we cannot move money.
                </p>
              </div>
            </motion.div>

            {/* Connected Accounts */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2 className="font-display text-xl font-semibold mb-4">Connected Accounts</h2>

              {banksLoading ? (
                <div className="glass-card p-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : connectedBanks.length === 0 ? (
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
                    {connectedBanks.map(bank => (
                      <motion.div
                        key={bank.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Landmark className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold truncate">{bank.institutionName ?? 'Connected Bank'}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              Last synced: {formatSyncTime(bank.lastSyncedAt)} ·{' '}
                              <span className="text-primary font-medium">{bank.subscriptionsDetected} subscription(s) detected</span>
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
                            onClick={() => handleSyncBank(bank.id)}
                            disabled={syncingId === bank.id}
                            className="gap-1.5"
                            id={`settings-sync-btn-${bank.id}`}
                          >
                            {syncingId === bank.id ? (
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
                                id={`settings-disconnect-btn-${bank.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Disconnect Bank</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove <strong>{bank.name}</strong> from SubPilot
                                  and stop syncing transactions. Auto-detected subscriptions from this
                                  bank will remain in your dashboard.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDisconnectBank(bank.id)}
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

            {/* Add / Get Started CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">
                  {connectedBanks.length > 0 ? 'Add Another Account' : 'Get Started'}
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

              <Button size="lg" className="gap-2" onClick={handleAddConnection} id="settings-add-bank-btn">
                <Landmark className="w-4 h-4" />
                Connect a Bank Account
              </Button>
            </motion.div>

            <p className="text-center text-muted-foreground text-xs">
              Can't find your bank?{' '}
              <a href="#" className="text-primary hover:underline">Contact support</a>
            </p>

          </TabsContent>

          {/* Export Data Tab */}
          <TabsContent value="export">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Export Data</h2>
                  <p className="text-xs text-muted-foreground">Download your subscriptions to your device</p>
                </div>
              </div>

              {/* What's included */}
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 mb-6">
                <p className="text-sm font-medium mb-3">What's included in the export</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Subscription name & amount',
                    'Billing frequency & status',
                    'Category',
                    'Start date',
                    'Last & next billing dates',
                    'Detection source (manual / bank)',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Format cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CSV */}
                <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">CSV</div>
                    <div>
                      <p className="text-sm font-semibold">Spreadsheet</p>
                      <p className="text-xs text-muted-foreground">Excel, Google Sheets</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Comma-separated values, ideal for sorting and filtering in a spreadsheet app.</p>
                  <Button
                    onClick={() => handleExportData('csv')}
                    disabled={isExporting !== null}
                    className="gap-2 mt-auto"
                    id="export-csv-btn"
                  >
                    {isExporting === 'csv' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting === 'csv' ? 'Exporting…' : 'Download CSV'}
                  </Button>
                </div>

                {/* JSON */}
                <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{'{}'}</div>
                    <div>
                      <p className="text-sm font-semibold">JSON</p>
                      <p className="text-xs text-muted-foreground">For developers</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Full structured data, great for importing into other apps or custom scripts.</p>
                  <Button
                    variant="outline"
                    onClick={() => handleExportData('json')}
                    disabled={isExporting !== null}
                    className="gap-2 mt-auto"
                    id="export-json-btn"
                  >
                    {isExporting === 'json' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting === 'json' ? 'Exporting…' : 'Download JSON'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-destructive/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
              </div>

              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-foreground">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Permanently deletes your account, all subscriptions, linked bank connections,
                    and AI chat history. This action <strong>cannot be undone</strong>.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="shrink-0 w-full sm:w-auto"
                  onClick={() => { setDeleteConfirmText(''); setShowDeleteDialog(true); }}
                  id="open-delete-dialog-btn"
                >
                  Delete Account
                </Button>
              </div>
            </motion.div>

            {/* Type-to-confirm delete dialog */}
            <AnimatePresence>
              {showDeleteDialog && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteDialog(false); }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="glass-card p-7 w-full max-w-md mx-4 border border-destructive/30"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                      <TriangleAlert className="w-6 h-6 text-destructive" />
                    </div>

                    <h2 className="text-xl font-bold mb-1">Delete your account?</h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      This will permanently remove everything tied to your account:
                    </p>

                    {/* What gets deleted */}
                    <ul className="space-y-2 mb-6">
                      {[
                        'All subscriptions (manual & bank-detected)',
                        'All linked bank connections (Plaid)',
                        'All AI Insights chat history',
                        'Your profile & login credentials',
                      ].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Type to confirm */}
                    <div className="mb-5">
                      <Label htmlFor="delete-confirm-input" className="text-sm font-medium mb-2 block">
                        Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                      </Label>
                      <Input
                        id="delete-confirm-input"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="bg-secondary/50 font-mono"
                        autoComplete="off"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={isDeletingAccount}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                        onClick={handleDeleteAccount}
                        id="confirm-delete-account-btn"
                      >
                        {isDeletingAccount ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                        ) : (
                          'Yes, delete my account'
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
