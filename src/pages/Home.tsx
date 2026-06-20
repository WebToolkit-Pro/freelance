import React, { useState } from "react";
import { Calculator, Copy } from "lucide-react";
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
import { useLocation } from "wouter";

// Tax Constants (2026)
const SS_TAX_RATE = 0.124;
const MEDICARE_TAX_RATE = 0.029;
const SS_CAP = 184500;
const SE_MULTIPLIER = 0.9235;

export default function Home() {
  const [location] = useLocation();

  const isUpwork = location === "/tools/upwork-fee-and-tax-calculator";
  const isFiverr = location === "/tools/fiverr-fee-and-tax-calculator";
  const is1099 = location === "/tools/1099-tax-calculator";

  let seoTitle = "US Freelance Net Income & Tax Calculator 2026";
  let seoDesc = "Calculate your true take-home pay as a US freelancer on Upwork, Fiverr, or direct clients. Accurately estimates 2026 self-employment taxes, Social Security caps, and platform fees.";
  let h1Text = "Know exactly what you take home.";

  if (isUpwork) {
    seoTitle = "Upwork Tax Calculator 2026 | Freelance Take-Home Pay";
    seoDesc = "Calculate your net profit on Upwork after platform fees (0-15%) and 2026 self-employment taxes. Find out exactly what you take home.";
    h1Text = "Upwork Tax & Profit Calculator";
  } else if (isFiverr) {
    seoTitle = "Fiverr Tax Calculator 2026 | Freelance Take-Home Pay";
    seoDesc = "Calculate your net profit on Fiverr after the standard 20% fee and 2026 federal self-employment taxes.";
    h1Text = "Fiverr Tax & Profit Calculator";
  } else if (is1099) {
    seoTitle = "1099 Tax Calculator 2026 | Self-Employment Taxes";
    seoDesc = "Free 1099 tax calculator for independent contractors. Estimate your 2026 self-employment taxes, Social Security, Medicare, and federal income tax.";
    h1Text = "1099 Tax & Profit Calculator";
  }

  useSeo({
    title: seoTitle,
    description: seoDesc,
    path: location
  });

  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Tax For Freelancers",
      "url": absoluteUrl("/"),
      "description": "Free 2026 US freelance net income and self-employment tax calculator.",
      "publisher": {
        "@type": "Person",
        "name": "Abu Sufyan"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "US Freelance Net Income & Tax Calculator 2026",
      "url": absoluteUrl("/"),
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Calculate take-home pay after Upwork, Fiverr, or direct-client fees and 2026 federal self-employment tax (Social Security cap, 92.35% rule, Additional Medicare).",
      "featureList": [
        "Real-time platform fee calculation (Upwork, Fiverr, custom)",
        "2026 self-employment tax estimation",
        "Social Security cap handling ($184,500)",
        "Quarterly estimated tax planner",
        "Federal income tax brackets for all filing statuses"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much should I set aside for taxes as a US freelancer in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A safe rule of thumb is 25–30% of your net earnings (after platform fees and business expenses). That covers the 15.3% self-employment tax plus federal income tax for most freelancers earning under $100,000. High earners or freelancers in states with income tax should set aside closer to 30–35%. This calculator gives you the exact number based on your filing status and income."
          }
        },
        {
          "@type": "Question",
          "name": "Are Upwork, Fiverr, and platform fees tax-deductible?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Upwork service fees, Fiverr's 20% commission, payment processing fees, and any other platform charges are fully deductible business expenses. You report them on Schedule C, which lowers both your income tax and your self-employment tax."
          }
        },
        {
          "@type": "Question",
          "name": "What is the 92.35% rule for self-employment tax?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The IRS lets you multiply your net self-employment earnings by 92.35% before calculating the 15.3% SE tax. This effectively excludes the employer-equivalent half of FICA from being double-taxed. For example, $50,000 in net earnings × 92.35% = $46,175, then × 15.3% = $7,065 in SE tax."
          }
        },
        {
          "@type": "Question",
          "name": "What is the 2026 Social Security wage cap for self-employment tax?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The 2026 Social Security wage base is $184,500. Only the first $184,500 of your net self-employment earnings is subject to the 12.4% Social Security portion of SE tax. Earnings above that cap still owe the 2.9% Medicare portion (with no cap), plus an additional 0.9% Medicare surtax on income above $200,000 (single) or $250,000 (married filing jointly)."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to pay quarterly estimated taxes as a freelancer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, if you expect to owe at least $1,000 in federal taxes for the year. Quarterly payments for 2026 are due April 15, June 15, September 15, and January 15, 2027. The Quarterly Planner on this site calculates each payment for you based on your projected annual income and filing status."
          }
        }
      ]
    }
  ]);

  const { toast } = useToast();
  
  // State
  const defaultPlatform = isUpwork ? "upwork" : isFiverr ? "fiverr" : "upwork";
  const [grossInput, setGrossInput] = useState<string>("");
  const [platform, setPlatform] = useState<string>(defaultPlatform);
  const [upworkFeePercent, setUpworkFeePercent] = useState<number>(10);
  const [customFeePercent, setCustomFeePercent] = useState<string>("0");
  const [expensesInput, setExpensesInput] = useState<string>("");
  const [ytdInput, setYtdInput] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");

  // Parsed values
  const gross = parseFloat(grossInput) || 0;
  const expenses = parseFloat(expensesInput) || 0;
  const ytd = parseFloat(ytdInput) || 0;

  // Platform fee logic
  let platformFeePercent = 0;
  if (platform === "upwork") platformFeePercent = upworkFeePercent;
  else if (platform === "fiverr") platformFeePercent = 20;
  else if (platform === "custom") platformFeePercent = parseFloat(customFeePercent) || 0;

  const platformFeeAmount = gross * (platformFeePercent / 100);
  const netAfterPlatformAndExpenses = Math.max(0, gross - platformFeeAmount - expenses);

  // Tax logic (SE Tax)
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

  // Federal Income Tax Logic
  const seTaxDeduction = seTax / 2; // Half of SE tax is deductible from adjusted gross income
  const adjustedGrossIncome = netAfterPlatformAndExpenses - seTaxDeduction;
  const taxableIncomeForFederal = Math.max(0, adjustedGrossIncome - STANDARD_DEDUCTION[filingStatus]);
  const federalIncomeTax = calculateFederalIncomeTax(taxableIncomeForFederal, filingStatus);

  const totalTax = seTax + federalIncomeTax;
  const finalTakeHome = Math.max(0, gross - platformFeeAmount - expenses - totalTax);
  const effectiveTaxRate = netAfterPlatformAndExpenses > 0 ? (totalTax / netAfterPlatformAndExpenses) * 100 : 0;

  const chartData = [
    { name: 'Take-Home', value: finalTakeHome, color: '#10b981' }, // emerald-500
    { name: 'Platform Fee', value: platformFeeAmount, color: '#ef4444' }, // red-500
    { name: 'Expenses', value: expenses, color: '#f59e0b' }, // amber-500
    { name: 'SE Tax', value: seTax, color: '#f97316' }, // orange-500
    { name: 'Federal Tax', value: federalIncomeTax, color: '#3b82f6' } // blue-500
  ].filter(d => d.value > 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleCopySummary = () => {
    const summary = `Freelance Earnings Summary:
Gross: ${formatCurrency(gross)}
Platform Fee (${platformFeePercent}%): -${formatCurrency(platformFeeAmount)}
Business Expenses: -${formatCurrency(expenses)}
Net Business Profit: ${formatCurrency(netAfterPlatformAndExpenses)}
SE Tax: -${formatCurrency(seTax)} (SS: ${formatCurrency(ssTax)}, Med: ${formatCurrency(medicareTax)})
Federal Income Tax: -${formatCurrency(federalIncomeTax)}
Final Take-Home: ${formatCurrency(finalTakeHome)}`;
    
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied to clipboard",
      description: "Calculation summary has been copied.",
    });
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          {h1Text}
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          A precise 2026 take-home calculator for US-based freelancers on Upwork, Fiverr, and direct clients.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start mb-12">
        {/* Inputs Section */}
        <div className="md:col-span-5 lg:col-span-6 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter the gross amount and platform fee.</CardDescription>
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
                    step="0.01"
                    className="pl-8 text-lg font-medium transition-all"
                    placeholder="0.00"
                    value={grossInput}
                    onChange={(e) => setGrossInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upwork">Upwork (Variable 0-15%)</SelectItem>
                    <SelectItem value="fiverr">Fiverr (20%)</SelectItem>
                    <SelectItem value="custom">Direct Client / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {platform === "upwork" && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center">
                    <Label>Upwork Fee</Label>
                    <span className="font-medium text-sm">{upworkFeePercent}%</span>
                  </div>
                  <Slider 
                    value={[upworkFeePercent]} 
                    min={0} 
                    max={15} 
                    step={1} 
                    onValueChange={(vals) => setUpworkFeePercent(vals[0])} 
                  />
                </div>
              )}

              {platform === "custom" && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <Label htmlFor="custom-fee">Custom Fee Percentage</Label>
                  <div className="relative">
                    <Input 
                      id="custom-fee"
                      type="number"
                      min="0"
                      max="100"
                      className="pr-8"
                      placeholder="0"
                      value={customFeePercent}
                      onChange={(e) => setCustomFeePercent(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="expenses">Business Expenses (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    id="expenses"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8 transition-all"
                    placeholder="0.00"
                    value={expensesInput}
                    onChange={(e) => setExpensesInput(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-4">Software, home office, travel, etc.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filingStatus">Filing Status</Label>
                <Select value={filingStatus} onValueChange={(val: any) => setFilingStatus(val)}>
                  <SelectTrigger id="filingStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                    <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="ytd" className="flex items-center gap-2">
                  Annual YTD Earnings 
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Used for the Social Security cap calculation ($184,500 limit).
                </p>
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

        {/* Output Section */}
        <div className="md:col-span-7 lg:col-span-6">
          <Card className="shadow-lg border-primary/20 bg-card overflow-hidden">
            <div className="bg-primary/5 px-6 py-8 border-b border-border/50 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Final Net Take-Home</p>
              <div className="text-5xl md:text-6xl font-bold tracking-tighter text-primary break-words">
                {formatCurrency(finalTakeHome)}
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="text-muted-foreground">Gross Earnings</span>
                  <span className="font-medium">{formatCurrency(gross)}</span>
                </div>
                <div className="flex justify-between items-center text-sm md:text-base text-destructive">
                  <span>Platform Fee ({platformFeePercent}%)</span>
                  <span>-{formatCurrency(platformFeeAmount)}</span>
                </div>
                {expenses > 0 && (
                  <div className="flex justify-between items-center text-sm md:text-base text-destructive">
                    <span>Business Expenses</span>
                    <span>-{formatCurrency(expenses)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-medium pt-3 border-t border-border">
                  <span>Net Business Profit</span>
                  <span>{formatCurrency(netAfterPlatformAndExpenses)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center text-sm md:text-base text-orange-600 dark:text-orange-400">
                  <span className="flex items-center gap-1">
                    Self-Employment Tax
                  </span>
                  <span>-{formatCurrency(seTax)}</span>
                </div>
                <div className="pl-4 space-y-2 border-l-2 border-border/50">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Social Security (12.4%)</span>
                    <span>{formatCurrency(ssTax)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Medicare (2.9%)</span>
                    <span>{formatCurrency(medicareTax)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm md:text-base text-blue-600 dark:text-blue-400 pt-3 border-t border-border/50">
                  <span>Federal Income Tax</span>
                  <span>-{formatCurrency(federalIncomeTax)}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  * Assumes {filingStatus.replace('_', ' ')} standard deduction.
                </p>
              </div>

              {chartData.length > 0 && gross > 0 && (
                <div className="pt-6 border-t border-border/50 h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border">
              <div className="text-sm text-muted-foreground">
                Effective Total Tax Rate: <span className="font-medium text-foreground">{effectiveTaxRate.toFixed(1)}%</span>
              </div>
              <Button onClick={handleCopySummary} className="w-full sm:w-auto shadow-sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy Summary
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Quarterly Planner Section */}
      <div className="mb-16">
        <QuarterlyPlanner />
      </div>

      {/* AdSense Placeholder - Hidden until verified
      <div className="w-full min-h-[120px] bg-muted/30 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center mb-16 px-4 py-8">
        <p className="text-sm font-medium text-muted-foreground/60 uppercase tracking-widest">
          AdSense High-Impact Placement
        </p>
      </div>
      */}

      {/* SEO Content Section */}
      <section className="max-w-3xl mx-auto prose prose-gray dark:prose-invert prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:text-muted-foreground pb-16">
        <h2>Why US Freelancers Need to Calculate Net Income</h2>
        <p>
          If you earn money as an independent contractor, gig worker, or sole proprietor in the United States, your gross invoice is not your real income. Unlike W-2 employees, freelancers don't have payroll taxes withheld automatically. Every client who pays you $600 or more in a year is required to issue you a Form 1099-NEC, and the IRS receives a copy too. That means the government already knows what you billed before you file your return.
        </p>
        <p>
          To stay compliant and avoid penalties, freelancers must make quarterly estimated tax payments throughout the year. This calculator helps you reverse-engineer the exact dollar amount you should set aside from each project so that, when April rolls around, your tax bill is funded — not a surprise. Calculating your true net income after platform fees and self-employment tax also helps you price your services correctly and decide whether a project is actually worth taking.
        </p>

        <h2>Understanding the 2026 Self-Employment Tax Rate</h2>
        <p>
          The 2026 self-employment tax rate is 15.3%, and it covers two federal programs. The first 12.4% funds Social Security, and the remaining 2.9% funds Medicare. As a freelancer, you pay both the "employee" and "employer" halves of these payroll taxes — that's why the rate feels so steep compared to a traditional paycheck.
        </p>
        <p>
          Two important rules soften the blow. First, the IRS only applies SE tax to 92.35% of your net business earnings, not 100%. Second, the 12.4% Social Security portion has an annual income cap: in 2026, only the first <strong>$184,500</strong> of your taxable SE base is subject to Social Security tax. Earnings above the cap are still subject to the 2.9% Medicare tax (and an additional 0.9% Medicare surtax kicks in above $200,000 single or $250,000 married filing jointly). This calculator applies all of these rules automatically.
        </p>

        <h2>How Platform Fees Impact Your Take-Home Pay</h2>
        <p>
          Platform fees are the silent tax most freelancers underestimate. <strong>Upwork</strong> charges a flat 10% service fee on most contracts, but legacy contracts, Enterprise accounts, and certain managed projects can range from 0% to 15%. <strong>Fiverr</strong> takes a flat 20% commission on every gig, regardless of size. <strong>Direct clients</strong> may seem fee-free, but you'll typically lose 2.9% to 3.5% to Stripe, PayPal, or Wise for payment processing — plus possible currency conversion or wire fees if your client is overseas.
        </p>
        <p>
          On a $5,000 project, that fee difference matters: Fiverr keeps $1,000, Upwork keeps $500, and a direct Stripe payment costs roughly $145. Combine that with self-employment tax and the same gross invoice can produce dramatically different take-home figures depending on where you sourced the work. Use the calculator above to compare scenarios side by side before accepting your next contract.
        </p>

        <h2>How to Calculate Self-Employment Tax in 2026</h2>
        <p>
          When you work as a freelancer, independent contractor, or small business owner in the United States, you are responsible for paying self-employment (SE) tax. Unlike traditional W-2 employees who split payroll taxes with their employer, freelancers pay the full 15.3% SE tax rate. This consists of two parts: 12.4% for Social Security and 2.9% for Medicare.
        </p>
        <p>
          However, the math isn't just a flat 15.3% on your gross income. The IRS allows you to calculate SE tax on only 92.35% of your net business earnings (known as the 92.35% rule). Furthermore, the Social Security portion of the tax only applies up to a specific income threshold, which is capped at $184,500 for the 2026 tax year. Any earnings beyond this cap are only subject to the 2.9% Medicare tax.
        </p>

        <h2>Understanding Upwork Fees for US Freelancers</h2>
        <p>
          Upwork recently transitioned away from its older sliding scale fee structure. Freelancers now typically pay a flat 10% fee on their earnings. However, depending on the specific contract, legacy client relationships, or Upwork Enterprise arrangements, fees can vary anywhere from 0% to 15%.
        </p>
        <p>
          It is critical to deduct platform fees before calculating your taxable income. Platform fees, like those charged by Upwork or Fiverr (which charges a flat 20%), are considered ordinary and necessary business expenses. You only pay taxes on your net earnings after these fees are subtracted.
        </p>

        <h3>Quarterly Estimated Taxes</h3>
        <p>
          Because freelancers don't have taxes automatically withheld from their paychecks, the IRS requires you to make quarterly estimated tax payments if you expect to owe $1,000 or more in taxes for the year. This calculator helps you determine the Self-Employment tax portion of your liability. Keep in mind that you will also owe federal income tax and potentially state income tax on your earnings, which should be factored into your quarterly payments.
        </p>

        <h3>The 92.35% Rule Explained</h3>
        <p>
          Why do you only pay SE tax on 92.35% of your net earnings? The IRS designed this rule to give self-employed individuals a deduction roughly equivalent to the employer half of the FICA taxes that a W-2 worker receives tax-free. When using our calculator, the 92.35% multiplier is automatically applied to your net earnings before the 15.3% tax rates are calculated, ensuring precise and accurate results.
        </p>

        <h2>When are quarterly estimated taxes due in 2026?</h2>
        <p>
          The IRS expects you to pay taxes as you earn income throughout the year. For the 2026 tax year, the four quarterly estimated tax due dates are:
        </p>
        <ul>
          <li><strong>Q1:</strong> April 15, 2026</li>
          <li><strong>Q2:</strong> June 15, 2026</li>
          <li><strong>Q3:</strong> September 15, 2026</li>
          <li><strong>Q4:</strong> January 15, 2027</li>
        </ul>
        <p>
          To avoid underpayment penalties, you must meet the IRS "safe harbor" rule. This means paying at least 90% of the tax you owe for the current year, or 100% of the tax shown on your previous year's return. If your adjusted gross income from the previous year was over $150,000 (or $75,000 if Married Filing Separately), you must pay 110% of last year's tax to meet the safe harbor requirement.
        </p>
      </section>
    </main>
  );
}
