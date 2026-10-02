import { motion } from 'framer-motion';
import { ArrowRight, Play, AlertCircle, TrendingUp, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="relative w-full py-32 overflow-hidden bg-[hsl(222_47%_6%)]">
      {/* Layered gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(43_57%_65%/0.12),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <div className="inline-flex items-center rounded-full border border-[hsl(43_57%_65%/0.2)] bg-[hsl(43_57%_65%/0.05)] px-3 py-1 text-sm font-medium text-[hsl(43_57%_65%)] mb-6">
                Start today
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Stop leaking money on forgotten subscriptions.
              </h2>
              <p className="text-lg text-muted-foreground/80 max-w-[500px]">
                Join 50,000+ users who save an average of $847 per year. It takes less than 2 minutes to connect your bank.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link to="/signup">
                <Button size="lg" className="bg-[hsl(43_57%_65%)] text-black hover:bg-[hsl(43_57%_65%)]/90 rounded-full px-8">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/5 rounded-full px-8">
                  <Play className="mr-2 h-4 w-4" /> View Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
              <span>Free 14-day trial</span>
              <span>&middot;</span>
              <span>No credit card required</span>
              <span>&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md shadow-2xl glass-card">
              
              {/* Insight Header */}
              <div className="flex items-center gap-6 mb-8">
                {/* Circular Progress Ring */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="16" 
                      fill="none" 
                      className="stroke-[hsl(43_57%_65%)]" 
                      strokeWidth="3" 
                      strokeDasharray="100" 
                      strokeDashoffset="25" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[hsl(43_57%_65%)] font-bold text-sm">75%</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Potential Savings</div>
                  <div className="text-3xl font-bold text-white tracking-tight">$234<span className="text-lg text-muted-foreground/60 font-normal">/mo</span></div>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="p-2 rounded-lg bg-orange-500/10 mr-4">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="text-sm text-white/90 font-medium">2 unused subscriptions found</span>
                </div>
                
                <div className="flex items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="p-2 rounded-lg bg-red-500/10 mr-4">
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-sm text-white/90 font-medium">3 price increases detected</span>
                </div>

                <div className="flex items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="p-2 rounded-lg bg-blue-500/10 mr-4">
                    <Copy className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-white/90 font-medium">$45 in duplicate services</span>
                </div>
              </div>

            </div>
            
            {/* Ambient decorative blurs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[hsl(43_57%_65%)] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[hsl(43_57%_65%)] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
