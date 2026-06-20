import React from "react";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  useSeo({
    title: "About Tax For Freelancers | US Freelance Net Income Calculator",
    description: "Learn why Tax For Freelancers was built and how it helps freelancers estimate their true take-home pay."
  });

  return (
    <Layout title="About Tax For Freelancers" description="Why this calculator exists and who it's for.">
      <h2>Who built this</h2>
      <p>
        Tax For Freelancers was built by Abu Sufyan, a developer based in Lahore, Pakistan. After years of freelancing across Upwork, Fiverr, and direct clients, I kept doing the same back-of-the-envelope math for every project — what does this $3,000 invoice actually leave me with after platform fees and US self-employment tax? I built this calculator so other freelancers wouldn't have to.
      </p>

      <h2>Why this exists</h2>
      <p>
        Most generic tax calculators on the internet ask for a simple gross income number and spit out a basic percentage. But freelance reality is much more complicated. First, the platform takes a cut — sometimes 10%, sometimes 20%. Then, the IRS taxes you not just on income, but specifically on self-employment.
      </p>
      <p>
        But they don't tax 100% of your net income (the 92.35% rule). And the Social Security portion caps out at a certain threshold. And you have to pay it quarterly to avoid penalties. I built Tax For Freelancers to model these specific, nuanced rules so you can price your services accurately and save exactly what you owe.
      </p>

      <h2>What we promise</h2>
      <ul>
        <li><strong>Accuracy:</strong> Uses current 2026 IRS data, brackets, and caps.</li>
        <li><strong>Privacy:</strong> No account required. All calculations happen in your browser. No data is sent to our servers.</li>
        <li><strong>Free:</strong> This tool is free forever.</li>
      </ul>

      <h2>What we are NOT</h2>
      <p>
        This tool provides estimates for informational and planning purposes only. It is <strong>not</strong> tax advice, and I am not a CPA. Your final tax liability depends on countless personal factors, including other sources of income, state taxes, itemized deductions, and your filing status. Always consult a qualified tax professional before filing your returns or making major financial decisions.
      </p>

      <div className="mt-12 text-center">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            Back to the Calculator
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
