import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Search, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "1. Securely Connect Your Bank",
      description: "Subpilot uses Quiltt, an open-banking infrastructure provider, to securely connect to over 10,000+ financial institutions. We use AES-256 encryption, have read-only access, and never store your banking credentials."
    },
    {
      icon: <Search className="w-6 h-6 text-primary" />,
      title: "2. We Analyze Your History",
      description: "Our proprietary Recurring Engine scans up to 24 months of your transaction history. It looks for patterns—identical amounts, consistent intervals, and known merchant IDs—to accurately identify all active subscriptions."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "3. Take Back Control",
      description: "Instantly see every hidden charge on your customized dashboard. Use our AI insights to identify price hikes, spot duplicate services, and get one-click cancellation guides for unwanted subscriptions."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-0 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 mb-32 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Seamless Integration
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">
            How Subpilot Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From connection to cancellation, see how we find your hidden subscriptions in under 60 seconds.
          </p>
        </motion.div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-background bg-card shadow-[0_0_0_1px_rgba(255,255,255,0.1)] shrink-0 md:order-1 md:group-odd:-ml-8 md:group-even:-mr-8 z-10 relative">
                {step.icon}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-colors ml-4 md:ml-0">
                <h3 className="text-2xl font-display font-bold tracking-tight mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <Link to="/signup">
            <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-full group">
              Start finding subscriptions
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
