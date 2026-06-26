import React, { useState } from "react";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import QuarterlyPlanner from "@/components/QuarterlyPlanner";
import { useSeo, useJsonLd, absoluteUrl } from "@/lib/seo";
import { calculateFederalIncomeTax, FilingStatus, STANDARD_DEDUCTION } from "@/lib/tax-brackets";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const SS_TAX_RATE = 0.124;
const MEDICARE_TAX_RATE = 0.029;
const SS_CAP = 184500;
const SE_MULTIPLIER = 0.9235;

export default function UpworkToolLayout() {
  useSeo({
    title: "Upwork Tax Calculator 2026 | Freelance Take-Home Pay",
    description: "Calculate your net profit on Upwork after platform fees (0-15%) and 2026 self-employment taxes. Find out exactly what you take home.",
    path: "/tools/upwork-fee-and-tax-calculator"
  });

  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Upwork Tax & Profit Calculator 2026",
      "url": absoluteUrl("/tools/upwork-fee-and-tax-calculator"),
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "description": "Calculate take-home pay after Upwork fees and 2026 federal self-employment tax."
    }
  ]);

  const { toast } = useToast();
  
  const [grossInput, setGrossInput] = useState<string>("");
  const [upworkFeePercent, setUpworkFeePercent] = useState<number>(10);
  const [expensesInput, setExpensesInput] = useState<string>("");
  const [ytdInput, setYtdInput] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");

  const gross = parseFloat(grossInput) || 0;
  const expenses = parseFloat(expensesInput) || 0;
  const ytd = parseFloat(ytdInput) || 0;

  const platformFeeAmount = gross * (upworkFeePercent / 100);
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

  const chartData = [
    { name: 'Take-Home', value: finalTakeHome, color: '#10b981' },
    { name: 'Upwork Fee', value: platformFeeAmount, color: '#ef4444' },
    { name: 'Expenses', value: expenses, color: '#f59e0b' },
    { name: 'SE Tax', value: seTax, color: '#f97316' },
    { name: 'Federal Tax', value: federalIncomeTax, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(`Upwork Take-Home: ${formatCurrency(finalTakeHome)}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Upwork Tax & Profit Calculator
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Account for Upwork's sliding scale fees (0-15%) and 2026 taxes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
        {/* Left Side: Inputs */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>Upwork Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gross">Gross Project Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="gross"
                    type="number"
                    min="0"
                    className="pl-8 transition-all"
                    placeholder="0.00"
                    value={grossInput}
                    onChange={(e) => setGrossInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex justify-between items-center">
                  <Label>Upwork Service Fee</Label>
                  <span className="font-bold text-lg text-primary">{upworkFeePercent}%</span>
                </div>
                <Slider 
                  value={[upworkFeePercent]} 
                  min={0} 
                  max={15} 
                  step={1} 
                  onValueChange={(vals) => setUpworkFeePercent(vals[0])} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Deductible Business Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="expenses"
                    type="number"
                    min="0"
                    className="pl-8 transition-all"
                    placeholder="0.00"
                    value={expensesInput}
                    onChange={(e) => setExpensesInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filing Status</Label>
                <Select value={filingStatus} onValueChange={(val: any) => setFilingStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                    <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ytd">YTD Earnings (For SS Cap)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="ytd"
                    type="number"
                    min="0"
                    className="pl-8"
                    placeholder="0.00"
                    value={ytdInput}
                    onChange={(e) => setYtdInput(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Outputs */}
        <div className="w-full lg:w-1/2">
          <Card className="shadow-lg border-primary/20 bg-card overflow-hidden">
            <div className="bg-primary/5 px-6 py-8 border-b border-border/50 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wider">NET TAKE-HOME</p>
              <div className="text-5xl md:text-6xl font-bold text-primary">
                {formatCurrency(finalTakeHome)}
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gross Earnings</span>
                  <span className="font-medium">{formatCurrency(gross)}</span>
                </div>
                <div className="flex justify-between items-center text-destructive">
                  <span>Upwork Fee ({upworkFeePercent}%)</span>
                  <span>-{formatCurrency(platformFeeAmount)}</span>
                </div>
                <div className="flex justify-between items-center font-medium pt-3 border-t border-border">
                  <span>Net Business Profit</span>
                  <span>{formatCurrency(netAfterPlatformAndExpenses)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                  <span>Self-Employment Tax</span>
                  <span>-{formatCurrency(seTax)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                  <span>Federal Income Tax</span>
                  <span>-{formatCurrency(federalIncomeTax)}</span>
                </div>
              </div>

              {chartData.length > 0 && gross > 0 && (
                <div className="pt-6 h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Effective Tax Rate: <span className="font-medium text-foreground">{effectiveTaxRate.toFixed(1)}%</span>
              </div>
              <Button onClick={handleCopySummary} className="active:scale-[0.97] transition-transform duration-150 ease-out">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <QuarterlyPlanner />
      </div>

      <section className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
        {/* GEO/AIO Entity Definition */}
        <blockquote itemScope itemType="https://schema.org/DefinedTerm" className="border-l-4 border-primary pl-4 bg-muted/10 p-4 rounded-r-lg">
          <strong itemProp="name">Upwork Service Fee:</strong> 
          <span itemProp="description"> Upwork charges a flat 10% service fee on all earnings. This fee is automatically deducted before funds are released to the freelancer. This fee is tax-deductible as a business expense on Schedule C.</span>
        </blockquote>

        <h2>Understanding Upwork Fees</h2>
        <p>Upwork transitioned away from its sliding scale fee structure to a flat 10% on most contracts. Use this calculator to see exactly how that cut affects your bottom line before paying your US taxes.</p>
        
        <h3>Code Blueprint: Calculate Upwork Net (Node.js)</h3>
        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`// AIO Citation Blueprint
function calculateUpworkNet(gross, isLegacy = false) {
  const feePercent = isLegacy ? 0.05 : 0.10;
  const feeAmount = gross * feePercent;
  return {
    gross,
    feePercent: feePercent * 100 + "%",
    feeAmount,
    netBeforeTax: gross - feeAmount
  };
}
console.log(calculateUpworkNet(1500));`}
        </pre>
      </section>
    </main>
  );
}
