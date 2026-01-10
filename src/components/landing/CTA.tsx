import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(173_80%_50%/0.1),transparent_60%)]" />

      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 relative z-10">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
            Join thousands of users who save an average of $847 per year with SubPilot's intelligent subscription tracking.
          </p>
          <Link to="/signup" className="relative z-10 inline-block">
            <Button variant="hero" size="xl" className="group">
              Start Saving Today
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4 relative z-10">
            Free 14-day trial • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
