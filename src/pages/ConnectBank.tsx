import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Shield, CheckCircle } from 'lucide-react';

const banks = [
  { name: 'Chase', logo: '🏦', connected: true },
  { name: 'Bank of America', logo: '🏛️', connected: false },
  { name: 'Wells Fargo', logo: '🏪', connected: false },
  { name: 'Capital One', logo: '💳', connected: false },
  { name: 'Citibank', logo: '🌐', connected: false },
  { name: 'US Bank', logo: '🇺🇸', connected: false },
];

const ConnectBank = () => {
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
          <h1 className="font-display text-3xl font-bold mb-2">Connect Your Bank</h1>
          <p className="text-muted-foreground">
            Link your accounts to automatically detect and track subscriptions.
          </p>
        </motion.div>

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
            <p className="text-muted-foreground">
              Your connection is secured by Plaid, the same technology used by Venmo, Coinbase, and Betterment. 
              We use AES-256-GCM encryption and never store your banking credentials.
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
          <div className="space-y-3">
            {banks.filter(b => b.connected).map((bank) => (
              <div key={bank.name} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                    {bank.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold">{bank.name}</h3>
                    <p className="text-sm text-muted-foreground">Last synced: 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
            ))}
            {banks.filter(b => b.connected).length === 0 && (
              <div className="glass-card p-8 text-center">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No banks connected yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Add new bank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-xl font-semibold mb-4">Add a Bank Account</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {banks.filter(b => !b.connected).map((bank, index) => (
              <motion.button
                key={bank.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="glass-card-hover p-6 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {bank.logo}
                </div>
                <h3 className="font-semibold">{bank.name}</h3>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="glass-card-hover p-6 text-center border-2 border-dashed border-border group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">Other Bank</h3>
            </motion.button>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground mt-8 text-sm"
        >
          We support over 10,000 financial institutions. Can't find yours?{' '}
          <a href="#" className="text-primary hover:underline">Contact support</a>
        </motion.p>
      </main>
    </div>
  );
};

export default ConnectBank;
