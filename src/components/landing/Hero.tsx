import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(43_57%_65%/0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(215_20%_55%/0.15)_1px,transparent_1px)] [background-size:32px_32px] opacity-50" />
        
        {/* Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 sm:left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] -z-10 mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 sm:right-1/4 w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen"
        />
      </div>

      <motion.div 
        className="container relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Announcement Badge */}
        <motion.div variants={itemVariants} className="mb-8 mt-12 md:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm shadow-glow cursor-pointer hover:bg-background/80 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-foreground/90">Now with AI-powered detection</span>
          </div>
        </motion.div>

        {/* H1 */}
        <motion.h1 variants={itemVariants} className="max-w-4xl text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter leading-[1.1] mb-6">
          <span className="block text-foreground">Stop Paying for</span>
          <span className="block gradient-text pb-2">Subscriptions You Forgot</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p variants={itemVariants} className="max-w-xl text-lg text-muted-foreground/80 mb-10 leading-relaxed">
          Subpilot connects to your bank and automatically surfaces every recurring charge — then uses AI to tell you what's worth keeping.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Link to="/signup">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow flex items-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          
          <Link to="/dashboard">
            <Button variant="ghost" size="lg" className="h-11 px-6 text-sm font-medium hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center gap-2">
              <Play className="w-4 h-4" />
              View Demo
            </Button>
          </Link>
        </motion.div>

        <motion.p variants={itemVariants} className="text-xs text-muted-foreground/50 mb-12">
          Free 14-day trial &middot; No credit card required
        </motion.p>

        {/* Social Proof */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-16">
          <div className="flex -space-x-3">
            {[
              { bg: 'bg-blue-500', initials: 'JD' },
              { bg: 'bg-purple-500', initials: 'SA' },
              { bg: 'bg-emerald-500', initials: 'MJ' },
              { bg: 'bg-orange-500', initials: 'TK' },
            ].map((avatar, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-[${4-i}] ${avatar.bg}`}>
                {avatar.initials}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by <span className="text-foreground">50,000+</span> users
          </p>
        </motion.div>

        {/* UI Mockup Card */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-2xl mx-auto glass-card border border-primary/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-float relative"
        >
          {/* Card Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Spend</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Live</span>
              </div>
            </div>
            <div className="font-mono text-4xl font-bold tracking-tight text-foreground">
              $127.94
            </div>
          </div>
          
          {/* Card Body (Rows) */}
          <div className="p-2 sm:p-4 flex flex-col gap-1 text-left">
            {[
              { name: 'Netflix', amount: '$15.99', date: 'Monthly on 12th', color: 'bg-red-500' },
              { name: 'Spotify', amount: '$9.99', date: 'Monthly on 15th', color: 'bg-green-500' },
              { name: 'Figma', amount: '$15.00', date: 'Monthly on 22nd', color: 'bg-purple-500' },
            ].map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default group">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-105 transition-transform`}>
                    <div className={`w-3 h-3 rounded-full ${sub.color}`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{sub.name}</div>
                    <div className="text-xs text-muted-foreground">{sub.date}</div>
                  </div>
                </div>
                <div className="font-mono font-medium text-sm text-foreground">
                  {sub.amount}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
