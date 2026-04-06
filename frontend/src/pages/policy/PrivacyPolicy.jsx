// src/pages/PrivacyPolicy.jsx
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300 space-y-6">
      <h1 className="text-3xl font-black text-white mb-6">Privacy Policy</h1>
      <p>Last updated: April 06, 2026</p>
      
      <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the InvestHub Service. It outlines how your financial and personal data is secured.</p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
      
      <h3 className="text-xl font-semibold text-white mt-4 mb-2">Personal & KYC Data</h3>
      <p>To comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations, and to facilitate secure investments, we may collect:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Email address, First name, and Last name</li>
        <li><strong>Business Information:</strong> Business Registration (BR) numbers, pitch decks, and startup metrics.</li>
        <li><strong>Financial Information:</strong> Wallet balances, transaction history, and payment gateway details (e.g., PayHere integration data).</li>
      </ul>

      <h3 className="text-xl font-semibold text-white mt-4 mb-2">Usage Data</h3>
      <p>Usage Data is collected automatically when using the Service, including Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, and the time and date of Your visit.</p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Use of Your Personal Data</h2>
      <p>The Company may use Personal Data for the following purposes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>To facilitate Investments:</strong> To securely process wallet top-ups, escrow holds, and capital deployment to startups.</li>
        <li><strong>For the performance of a contract:</strong> To generate and record investment agreements (Equity, SAFE, or Revenue Share) between Founders and Investors.</li>
        <li><strong>To verify authenticity:</strong> To allow Mentors to verify startup progress and business registrations.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Disclosure of Your Personal Data</h2>
      <p>Because InvestHub is a two-sided marketplace, certain data must be shared to facilitate deals:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>With Platform Participants:</strong> If you are a Founder, your pitch deck, funding goal, and business details will be visible to registered Investors. If you are an Investor, your profile, name, and investment offers will be shared with the Founder you are funding.</li>
        <li><strong>With Mentors:</strong> Startup milestones and proof-of-work documents are shared with verified Mentors to authorize the release of escrowed funds.</li>
        <li><strong>Law Enforcement:</strong> We may disclose your data if required by law to prevent fraud or illicit financial activity.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Security of Your Financial Data</h2>
      <p>The security of Your Personal Data is important to Us. Wallet transactions are encrypted and processed through secure third-party payment gateways. However, remember that no method of transmission over the Internet is 100% secure.</p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, You can contact us by email: support@investhub.com</p>
    </div>
  );
}