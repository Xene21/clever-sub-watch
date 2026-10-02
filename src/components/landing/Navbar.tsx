import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`pointer-events-auto max-w-2xl mx-auto rounded-full border transition-all duration-300 ${
          scrolled 
            ? 'border-white/20 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/20' 
            : 'border-white/10 bg-background/60 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/40 text-primary-foreground group-hover:shadow-glow transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-medium tracking-tight text-sm">Sub-Pilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Security', 'Pricing'].map((item) => (
              <Link 
                key={item} 
                to={`#${item.toLowerCase()}`}
                className="text-[13px] font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="h-8 text-xs px-4 hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="h-8 text-xs px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

export default Navbar;
