import React from "react";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";

export default function Privacy() {
  useSeo({
    title: "Privacy Policy | Tax For Freelancers",
    description: "How we handle your data and privacy."
  });

  return (
    <Layout title="Privacy Policy" description="Last updated: April 29, 2026">
      <h2>What data we collect</h2>
      <p>
        Tax For Freelancers is a fully client-side calculator. The numbers you enter — gross amounts, fee percentages, filing status, and income — are processed entirely in your browser and are never sent to our servers. We do not require accounts, and we do not store your tax inputs.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We may use anonymized analytics (such as Google Analytics) to understand how visitors use the site at an aggregate level — for example, which sections are most viewed and which devices are most common. These tools may set first- or third-party cookies. No personally identifying information is collected.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may display advertisements served by Google AdSense or other ad networks. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites. You can opt out of personalized advertising by visiting Google's Ads Settings or aboutads.info.
      </p>

      <h2>Your rights</h2>
      <p>
        Because we do not collect personal information directly, there is nothing for us to delete on your behalf. To clear analytics or ad cookies, use your browser's privacy settings or the opt-out links above.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about this policy, please reach out via the contact channel listed on this site.
      </p>
    </Layout>
  );
}
