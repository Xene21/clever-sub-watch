import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Features from '@/components/landing/Features';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-0 flex flex-col">
      <Navbar />
      
      <main className="flex-grow mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-16 px-4"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-4">
            Powerful features.
            <br className="hidden md:block" />
            <span className="text-muted-foreground">Minimalist design.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to regain control of your recurring expenses, wrapped in an interface you'll actually love using.
          </p>
        </motion.div>

        {/* Re-use the excellent Features component from the landing page */}
        <Features />
      </main>

      <Footer />
    </div>
  );
}
