"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Bell, RefreshCw, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section className="relative py-32 bg-[hsl(222_47%_6%)] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-20 max-w-2xl">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-[hsl(43_57%_65%)] font-medium mb-4">
            Intelligence Engine
          </h3>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Stop leaking money.<br />
            <span className="text-white/40">Start building wealth.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          
          {/* 1. Auto-Detection */}
          <div className="md:col-span-4 rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3 font-medium">
              POWERED BY QUILTT
            </div>
            <div className="w-10 h-10 rounded-xl bg-[hsl(43_57%_65%)]/10 border border-[hsl(43_57%_65%)]/15 flex items-center justify-center text-[hsl(43_57%_65%)] mb-6">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">Automated Discovery</h4>
            <p className="text-sm text-white/50 max-w-md">
              Securely connect your accounts and watch as our engine instantly maps your entire subscription footprint across every card.
            </p>
            
            <div className="mt-8 flex-1 space-y-3">
              {[
                { name: "Netflix", amount: "$15.99", date: "Today", color: "bg-red-500" },
                { name: "Spotify", amount: "$10.99", date: "Yesterday", color: "bg-green-500" },
                { name: "AWS Cloud", amount: "$45.00", date: "Oct 12", color: "bg-orange-500" },
              ].map((tx, i) => (
                <motion.div
                  key={tx.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 + 0.2, type: "spring" }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", tx.color)} style={{ boxShadow: '0 0 12px var(--tw-shadow-color)' }} />
                    <span className="text-sm font-medium text-white/90">{tx.name}</span>
                  </div>
                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-white/40">{tx.date}</span>
                    <span className="text-white/90 font-mono tracking-tight">{tx.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. AI Insights */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[hsl(43_57%_65%)]/10 border border-[hsl(43_57%_65%)]/15 flex items-center justify-center text-[hsl(43_57%_65%)] mb-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">AI Insights</h4>
            <p className="text-sm text-white/50">
              Personalized recommendations to optimize your spending.
            </p>
            
            <div className="mt-auto pt-8">
              <div className="p-4 rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 relative shadow-2xl backdrop-blur-md">
                <div className="absolute -top-3 -left-3">
                  <Sparkles className="w-6 h-6 text-[hsl(43_57%_65%)] animate-pulse" />
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  "You're paying for 3 streaming services this month, but only actively using 1."
                </p>
              </div>
            </div>
          </div>

          {/* 3. Bank-Grade Security */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <h4 className="text-xl font-display font-semibold text-white mb-2">Bank-Grade Security</h4>
            <p className="text-sm text-white/50">
              Your financial data is encrypted and strictly read-only.
            </p>
            
            <div className="flex flex-col items-center justify-center mt-8 flex-1">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[hsl(43_57%_65%)]/20 blur-2xl rounded-full" />
                <Shield className="w-14 h-14 text-[hsl(43_57%_65%)] relative z-10" />
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70 bg-white/5 p-3 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(43_57%_65%)] shrink-0" /> 
                  <span className="truncate">AES-256 encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70 bg-white/5 p-3 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(43_57%_65%)] shrink-0" /> 
                  <span className="truncate">Strictly read-only access</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Smart Alerts */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <h4 className="text-xl font-display font-semibold text-white mb-2">Smart Alerts</h4>
            <p className="text-sm text-white/50">
              Never get caught off-guard by an auto-renewal again.
            </p>
            
            <div className="mt-auto pt-8">
              <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/20">
                  <Bell className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Netflix renews in 2 days</p>
                  <p className="text-xs text-white/50 mt-1.5 font-mono">$15.99 • Card **4242</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Spending Analytics */}
          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <h4 className="text-xl font-display font-semibold text-white mb-2">Spending Analytics</h4>
            <p className="text-sm text-white/50">
              Visualize your subscription burn rate instantly.
            </p>
            
            <div className="mt-auto pt-8">
              <div className="flex items-end gap-2 h-28 pb-2 border-b border-white/10">
                {[30, 45, 20, 60, 40, 80, 50].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-[hsl(43_57%_65%)]/20 rounded-t-sm hover:bg-[hsl(43_57%_65%)]/40 transition-colors relative group" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono text-white/80 pointer-events-none">
                      ${h * 2}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-white/30 uppercase tracking-wider">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* 6. Instant Sync */}
          <div className="md:col-span-2 md:col-start-3 lg:col-span-2 lg:col-start-auto rounded-2xl border border-white/8 bg-white/[0.02] p-8 overflow-hidden relative flex flex-col group hover:border-white/15 hover:bg-white/[0.04] transition-colors">
            <h4 className="text-xl font-display font-semibold text-white mb-2">Instant Sync</h4>
            <p className="text-sm text-white/50">
              Real-time synchronization across all your linked institutions.
            </p>
            
            <div className="mt-auto pt-8 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
                <RefreshCw className="w-12 h-12 text-white/30 animate-[spin_4s_linear_infinite] relative z-10" />
              </div>
              <p className="text-xs font-mono text-white/40 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full">
                Synced 2 mins ago
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;
