import React from "react";
import { Link } from "wouter";
import { ArrowRight, Calculator, Briefcase, Clock, ShieldCheck, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/seo";

export default function LandingPage() {
  useSeo({
    title: "Tax For Freelancers | Enterprise Financial Suite for Independent Professionals",
    description: "The complete suite of tax calculators, hourly rate estimators, and financial tools built specifically for 1099 freelancers and independent contractors.",
    path: "/"
  });

  const tools = [
    {
      title: "1099 Tax Calculator",
      description: "Accurately estimate your 2026 self-employment tax, federal income tax, and calculate your true net profit.",
      icon: <Calculator className="h-6 w-6 text-emerald-500" />,
      href: "/tools/1099-tax-calculator",
      color: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "W-2 vs 1099 Calculator",
      description: "Compare a full-time salary offer against a freelance contract to see which one actually pays more after taxes.",
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      href: "/tools/w2-vs-1099-calculator",
      color: "bg-blue-500/10 border-blue-500/20",
      badge: "New"
    },
    {
      title: "Hourly Rate Calculator",
      description: "Determine exactly what you need to charge per hour to hit your target take-home pay after expenses and taxes.",
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      href: "/tools/freelance-hourly-rate-calculator",
      color: "bg-amber-500/10 border-amber-500/20",
      badge: "Coming Soon"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/50" />
        
        <div className="container relative mx-auto px-4 max-w-6xl z-10 text-center">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-8 border border-primary/20 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Updated for 2026 IRS Tax Brackets
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
            The Financial Operating System <br className="hidden md:block" />
            <span className="text-primary">for Freelancers</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing your tax liabilities. Use our suite of enterprise-grade calculators to instantly project your net profit, optimize your hourly rate, and compare job offers.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tools/1099-tax-calculator">
              <Button size="lg" className="h-12 px-8 text-lg font-medium shadow-lg hover:shadow-primary/25 transition-all">
                Launch 1099 Calculator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tools/w2-vs-1099-calculator">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-medium bg-background/50 backdrop-blur-sm border-border hover:bg-muted/50">
                Compare Job Offers
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Tools Grid Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Toolkit</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Everything you need to run your freelance business profitably and stay compliant with the IRS.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <Link href={tool.href} key={i}>
                <div className={`h-full group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${tool.color.split(' ')[1]}`}>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-muted/50`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${tool.color}`}>
                        {tool.icon}
                      </div>
                      {tool.badge && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-auto">
                      Open Tool
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="pt-8 md:pt-0">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">2026</div>
              <div className="text-lg font-medium text-foreground">Tax Code Ready</div>
              <p className="text-sm text-muted-foreground mt-2">Always up to date with IRS brackets.</p>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mb-2">100%</div>
              <div className="text-lg font-medium text-foreground">Free to Use</div>
              <p className="text-sm text-muted-foreground mt-2">No sign-ups or paywalls.</p>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl md:text-5xl font-black text-blue-500 mb-2">&lt;10ms</div>
              <div className="text-lg font-medium text-foreground">Calculation Speed</div>
              <p className="text-sm text-muted-foreground mt-2">Instant results as you type.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
