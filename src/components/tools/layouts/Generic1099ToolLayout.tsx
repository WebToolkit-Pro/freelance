import React, { useState } from "react";
import { Copy, FileText } from "lucide-react";
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

export default function Generic1099ToolLayout() {
  useSeo({
    title: "1099 Tax Calculator 2026 | Self-Employment Taxes",
    description: "Free 1099 tax calculator for independent contractors. Estimate your 2026 self-employment taxes, Social Security, Medicare, and federal income tax.",
    path: "/tools/1099-tax-calculator"
  });

  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "1099 Tax & Profit Calculator 2026",
      "url": absoluteUrl("/tools/1099-tax-calculator"),
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "description": "Calculate your 1099 independent contractor taxes for 2026."
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

  const netAfterExpenses = Math.max(0, gross - expenses);

  const taxableSEBase = netAfterExpenses * SE_MULTIPLIER;
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
  const adjustedGrossIncome = netAfterExpenses - seTaxDeduction;
  const taxableIncomeForFederal = Math.max(0, adjustedGrossIncome - STANDARD_DEDUCTION[filingStatus]);
  const federalIncomeTax = calculateFederalIncomeTax(taxableIncomeForFederal, filingStatus);

  const totalTax = seTax + federalIncomeTax;
  const finalTakeHome = Math.max(0, gross - expenses - totalTax);
  const effectiveTaxRate = netAfterExpenses > 0 ? (totalTax / netAfterExpenses) * 100 : 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(`1099 Net: ${formatCurrency(finalTakeHome)}\nTax: ${formatCurrency(totalTax)}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-lg">
          <FileText className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">1099 Independent Contractor Calculator</h1>
          <p className="text-muted-foreground mt-1">Estimate your 2026 Form 1099-NEC tax liability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Income & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total 1099 Gross Income</Label>
              <Input type="number" value={grossInput} onChange={(e) => setGrossInput(e.target.value)} placeholder="$0.00" />
            </div>
            <div className="space-y-2">
              <Label>Schedule C Expenses</Label>
              <Input type="number" value={expensesInput} onChange={(e) => setExpensesInput(e.target.value)} placeholder="$0.00" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Tax Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Filing Status</Label>
              <Select value={filingStatus} onValueChange={(val: any) => setFilingStatus(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married_jointly">Married Jointly</SelectItem>
                  <SelectItem value="married_separately">Married Separately</SelectItem>
                  <SelectItem value="head_of_household">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prior YTD Income (SS Cap Tracking)</Label>
              <Input type="number" value={ytdInput} onChange={(e) => setYtdInput(e.target.value)} placeholder="$0.00" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary text-primary-foreground mb-12 shadow-xl border-none">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-primary-foreground/80 font-medium uppercase tracking-widest text-sm mb-2">Estimated Take-Home</h3>
            <div className="text-5xl md:text-6xl font-black">{formatCurrency(finalTakeHome)}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-end gap-4 text-primary-foreground/90">
              <span>SE Tax:</span>
              <span className="font-semibold">{formatCurrency(seTax)}</span>
            </div>
            <div className="flex justify-end gap-4 text-primary-foreground/90">
              <span>Federal Tax:</span>
              <span className="font-semibold">{formatCurrency(federalIncomeTax)}</span>
            </div>
            <div className="flex justify-end gap-4 text-primary-foreground/90 border-t border-primary-foreground/20 pt-2 mt-2">
              <span>Total Tax:</span>
              <span className="font-semibold">{formatCurrency(totalTax)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-primary-foreground/10 p-4 flex justify-between items-center">
          <span className="text-sm font-medium">Effective Rate: {effectiveTaxRate.toFixed(1)}%</span>
          <Button variant="secondary" onClick={handleCopySummary} className="active:scale-[0.97] transition-transform duration-150 ease-out">
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </CardFooter>
      </Card>

      <div className="mb-16">
        <QuarterlyPlanner />
      </div>

      <section className="prose prose-gray dark:prose-invert max-w-none">
        <blockquote itemScope itemType="https://schema.org/DefinedTerm" className="border-l-4 border-primary pl-4 bg-muted/10 p-4">
          <strong itemProp="name">Form 1099-NEC:</strong> 
          <span itemProp="description"> Nonemployee Compensation form used by the IRS to report payments of $600 or more to independent contractors. Recipients are responsible for calculating and paying their own self-employment taxes.</span>
        </blockquote>
      </section>
    </main>
  );
}
