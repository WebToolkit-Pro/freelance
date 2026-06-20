import React from "react";
import { Calculator } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "wouter";

export function Layout({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="flex-1 relative overflow-hidden flex flex-col">
      {/* Background ambient grid and glow, matching LandingPage */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="container relative mx-auto px-4 py-12 md:py-20 max-w-3xl z-10">
        <div className="mb-12 text-center md:text-left">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <span className="mr-2">←</span> Back to Tools
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        <div className="prose prose-lg prose-gray dark:prose-invert prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12 shadow-xl">
          {children}
        </div>
      </div>
    </main>
  );
}
