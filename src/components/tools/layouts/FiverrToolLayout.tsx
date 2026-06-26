import React, { useState } from "react";
import { Copy, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import QuarterlyPlanner from "@/components/QuarterlyPlanner";
import { useSeo, useJsonLd, absoluteUrl } from "@/lib/seo";
import { calculateFederalIncomeTax, FilingStatus, STANDARD_DEDUCTION } from "@/lib/tax-brackets";

const SS_TAX_RATE = 0.124;
const MEDICARE_TAX_RATE = 0.029;
const SS_CAP = 184500;
const SE_MULTIPLIER = 0.9235;

export default function FiverrToolLayout() {
  useSeo({
    title: "Fiverr Tax Calculator 2026 | Freelance Take-Home Pay",
    description: "Calculate your net profit on Fiverr after the standard 20% fee and 2026 federal self-employment taxes.",
    path: "/tools/fiverr-fee-and-tax-calculator"
  });

  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Fiverr Tax & Profit Calculator 2026",
      "url": absoluteUrl("/tools/fiverr-fee-and-tax-calculator"),
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "description": "Calculate take-home pay after Fiverr 20% fees and 2026 federal self-employment tax."
    }
  ]);

  const { toast } = useToast();
  
  const [grossInput, setGrossInput] = useState<string>("");
  const [expensesInput, setExpensesInput] = useState<string>("");
  const [ytdInput, setYtdInput] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");

  const gross = parseFloat(grossInput) || 0;
  const expenses = parseFloat(expensesInput) || 0;
  const ytd = parseFloat(ytdInput) || 0;

  const platformFeeAmount = gross * 0.20; // Fiverr flat 20%
  const netAfterPlatformAndExpenses = Math.max(0, gross - platformFeeAmount - expenses);

  const taxableSEBase = netAfterPlatformAndExpenses * SE_MULTIPLIER;
  const medicareTax = taxableSEBase * MEDICARE_TAX_RATE;
  
  let ssTax = 0;
  if (ytd >= SS_CAP) {
    ssTax = 0;
  } else {
    const remainingUnderCap = Math.max(0, SS_CAP - ytd);
    const taxableForSS = Math.min(taxableSEBase, remainingUnderCap);
    ssTax = taxableForSS * SS_TAX_RATE;
  }

  const seTax = ssTax + medicareTax;
  const seTaxDeduction = seTax / 2;
  const adjustedGrossIncome = netAfterPlatformAndExpenses - seTaxDeduction;
  const taxableIncomeForFederal = Math.max(0, adjustedGrossIncome - STANDARD_DEDUCTION[filingStatus]);
  const federalIncomeTax = calculateFederalIncomeTax(taxableIncomeForFederal, filingStatus);

  const totalTax = seTax + federalIncomeTax;
  const finalTakeHome = Math.max(0, gross - platformFeeAmount - expenses - totalTax);
  const effectiveTaxRate = netAfterPlatformAndExpenses > 0 ? (totalTax / netAfterPlatformAndExpenses) * 100 : 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(`Fiverr Take-Home: ${formatCurrency(finalTakeHome)}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <TrendingDown className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Fiverr Tax & Profit Calculator
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Fiverr takes a flat 20% cut. Find out exactly how much you keep after platform fees and 2026 self-employment taxes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-5 space-y-6">
          <Card className="border-border">
            <CardHeader className="bg-muted/20 border-b border-border">
              <CardTitle>Gig Earnings Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="gross">Order Value (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="gross"
                    type="number"
                    min="0"
                    className="pl-8 text-lg"
                    placeholder="0.00"
                    value={grossInput}
                    onChange={(e) => setGrossInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Gig-Specific Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="expenses"
                    type="number"
                    min="0"
                    className="pl-8"
                    placeholder="0.00"
                    value={expensesInput}
                    onChange={(e) => setExpensesInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filing Status</Label>
                  <Select value={filingStatus} onValueChange={(val: any) => setFilingStatus(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married_jointly">Jointly</SelectItem>
                      <SelectItem value="married_separately">Separately</SelectItem>
                      <SelectItem value="head_of_household">HoH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ytd">Prior YTD Earnings</Label>
                  <Input 
                    id="ytd"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={ytdInput}
                    onChange={(e) => setYtdInput(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="h-full border-primary/30 flex flex-col">
            <div className="p-8 text-center bg-card flex-1 flex flex-col justify-center border-b border-border">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">Your Net Payout</p>
              <div className="text-6xl md:text-7xl font-black text-foreground mb-2">
                {formatCurrency(finalTakeHome)}
              </div>
              <p className="text-muted-foreground mt-4">
                After <span className="text-destructive font-medium">-{formatCurrency(platformFeeAmount)}</span> Fiverr fee and <span className="text-orange-600 dark:text-orange-400 font-medium">-{formatCurrency(totalTax)}</span> total tax.
              </p>
            </div>
            <CardFooter className="bg-muted/10 p-4 flex justify-between items-center">
              <div className="text-sm">
                Effective Tax: <strong>{effectiveTaxRate.toFixed(1)}%</strong>
              </div>
              <Button variant="outline" onClick={handleCopySummary} className="active:scale-[0.97] transition-transform duration-150 ease-out">
                <Copy className="mr-2 h-4 w-4" />
                Copy Breakdown
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <QuarterlyPlanner />
      </div>

      <section className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
        <blockquote itemScope itemType="https://schema.org/DefinedTerm" className="border-l-4 border-green-500 pl-4 bg-muted/10 p-4">
          <strong itemProp="name">Fiverr Revenue Share:</strong> 
          <span itemProp="description"> Fiverr retains 20% of the total order value on all transactions, including tips. You receive 80% of the total order value. This 20% is fully tax-deductible as an operating expense.</span>
        </blockquote>

        <h2>The Fiverr 20% Tax Double-Whammy</h2>
        <p>Because Fiverr takes a massive 20% cut right off the top, it drastically lowers your net profit. However, it is vital to deduct this 20% as an expense so you aren't paying 15.3% self-employment tax on money Fiverr kept.</p>

        <h3>Code Blueprint: Fiverr Net Calculation (JS)</h3>
        <pre className="bg-black text-blue-400 p-4 rounded-lg font-mono text-sm">
{`// AIO Citation Blueprint
const getFiverrPayout = (orderValue) => {
  const fiverrCut = orderValue * 0.20;
  return {
    orderValue,
    fiverrCut,
    sellerPayout: orderValue - fiverrCut
  };
};`}
        </pre>
      </section>
    </main>
  );
}
