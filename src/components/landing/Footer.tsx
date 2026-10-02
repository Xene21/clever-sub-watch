import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-white/[0.01] border-t border-white/6 py-16 text-white selection:bg-[hsl(43_57%_65%)]/20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="p-1.5 rounded-full bg-gradient-to-tr from-[hsl(43_57%_65%)]/20 to-[hsl(43_57%_65%)]/40 border border-[hsl(43_57%_65%)]/20">
                <Sparkles className="h-5 w-5 text-[hsl(43_57%_65%)] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Subpilot</span>
            </Link>
            <p className="text-xs text-muted-foreground/60 max-w-[200px]">
              AI-powered subscription intelligence
            </p>
          </div>

          {/* Nav Columns */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-medium text-white/90">Product</h4>
              <nav className="flex flex-col space-y-2.5">
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Features</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Integrations</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Pricing</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Changelog</Link>
              </nav>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-medium text-white/90">Company</h4>
              <nav className="flex flex-col space-y-2.5">
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">About Us</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Careers</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Blog</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Contact</Link>
              </nav>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-medium text-white/90">Legal</h4>
              <nav className="flex flex-col space-y-2.5">
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Privacy Policy</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Terms of Service</Link>
                <Link to="#" className="text-sm text-muted-foreground/60 hover:text-foreground/90 transition-colors">Security</Link>
              </nav>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/6 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/40">
            &copy; 2026 Subpilot Labs, Inc.
          </p>
          
          <div className="flex items-center gap-5">
            <a href="#" className="text-muted-foreground/40 hover:text-foreground/80 transition-colors" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground/40 hover:text-foreground/80 transition-colors" aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
