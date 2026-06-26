import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Calculator } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Router, Switch, Route, Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useAnalytics } from "@/lib/analytics";

function useScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    const prefersReduced = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }, [location]);
}

// Pages
import LandingPage from "@/pages/LandingPage";
import Generic1099ToolLayout from "@/components/tools/layouts/Generic1099ToolLayout";
import UpworkToolLayout from "@/components/tools/layouts/UpworkToolLayout";
import FiverrToolLayout from "@/components/tools/layouts/FiverrToolLayout";
import RateCalculator from "@/pages/tools/RateCalculator";
import W2vs1099 from "@/pages/tools/W2vs1099";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Setup wouter base to handle nested deploy paths if needed
const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function MainLayout() {
  useAnalytics();
  useScrollToTop();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Tax For Freelancers</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/tools/1099-tax-calculator" className="hover:text-foreground transition-colors">1099 Calculator</Link>
            <Link href="/tools/w2-vs-1099-calculator" className="hover:text-foreground transition-colors">W-2 vs 1099</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Resources</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/tools/1099-tax-calculator" component={Generic1099ToolLayout} />
        <Route path="/tools/upwork-fee-and-tax-calculator" component={UpworkToolLayout} />
        <Route path="/tools/fiverr-fee-and-tax-calculator" component={FiverrToolLayout} />
        <Route path="/tools/w2-vs-1099-calculator" component={W2vs1099} />
        <Route path="/tools/freelance-hourly-rate-calculator" component={RateCalculator} />
        <Route path="/about" component={About} />
        <Route path="/terms" component={Terms} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route component={NotFound} />
      </Switch>

      <footer className="border-t border-border bg-muted/20 py-12 mt-auto">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4 text-center md:text-left">
              <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                  <Calculator className="h-4 w-4" />
                </div>
                <span className="font-semibold tracking-tight">Tax For Freelancers</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Know exactly what you take home.
              </p>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Tax For Freelancers
              </p>
            </div>
            
            <div className="flex flex-row justify-center md:justify-end gap-12 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Pages</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Disclaimer: This calculator provides estimated self-employment and federal income tax calculations for informational purposes only. It does not constitute professional tax advice. State and local taxes are not included. Please consult a certified public accountant (CPA) or qualified tax professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router base={base}>
          <MainLayout />
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
