import React from "react";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Clock, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  useSeo({
    title: "Contact Us | Tax For Freelancers",
    description: "Get in touch for feedback, bug reports, or partnership inquiries."
  });

  const { toast } = useToast();
  const email = "hello@freelancetax.app";
  const [copied, setCopied] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast({
      title: "Email copied",
      description: "Copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title="Contact Us" description="We'd love to hear from you.">
      <p className="mb-8">
        Whether you found a bug, have a suggestion for improving the calculator, want to request a feature, or have a partnership inquiry, please reach out. We are constantly looking for ways to make Tax For Freelancers more useful for independent professionals.
      </p>

      <Card className="max-w-xl shadow-sm border-border bg-card">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 mt-0">Email</h3>
              <p className="text-muted-foreground mb-3">
                <a href={`mailto:${email}`} className="text-primary hover:underline">
                  {email}
                </a>
                <span className="block text-xs mt-1">(Replace with your real email)</span>
              </p>
              <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy email address"}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 mt-0">Location</h3>
              <p className="text-muted-foreground mb-0">
                Lahore, Pakistan
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 mt-0">Response Time</h3>
              <p className="text-muted-foreground mb-0">
                We aim to reply to all inquiries within 2 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
