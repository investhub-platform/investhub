// src/pages/TermsOfService.jsx
export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300 space-y-6">
      <h1 className="text-3xl font-black text-white mb-6">Terms of Service & Risk Disclosure</h1>
      <p>Last updated: April 06, 2026</p>

      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl my-8">
        <h2 className="text-xl font-black text-red-400 uppercase tracking-widest mb-3">Important Risk Warning</h2>
        <p className="text-sm leading-relaxed text-red-200">
          Investing in early-stage startups involves a high degree of risk, including the complete loss of your investment. Startup investments are highly illiquid, and there is no guarantee of return, profit, or a future liquidity event (such as an acquisition or IPO). You should only invest money that you can afford to lose entirely. InvestHub does not guarantee the success of any startup listed on the platform.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Role of InvestHub</h2>
      <p>InvestHub operates strictly as a technology platform and software provider. We facilitate connections, provide escrow wallet services, and offer communication tools for Founders, Investors, and Mentors.</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>InvestHub is <strong>not</strong> a registered broker-dealer, investment advisor, or financial institution.</li>
        <li>We do not provide investment, legal, or tax advice.</li>
        <li>While Mentors verify milestones, InvestHub does not endorse, guarantee, or underwrite the financial viability of any startup.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Escrow and Wallet Mechanics</h2>
      <p>When an Investor commits capital to a Startup, the funds are transferred from the Investor&apos;s InvestHub Wallet into a secure digital Escrow state.</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li><strong>Milestone Release:</strong> Escrowed funds are only released to the Founder&apos;s wallet when an assigned Mentor officially validates the agreed-upon project milestones.</li>
        <li><strong>Irreversibility:</strong> Once a Mentor validates a milestone and funds are transferred from Escrow to the Founder, the transaction is strictly non-refundable and irreversible.</li>
        <li><strong>Withdrawals:</strong> Investors may withdraw uncommitted funds from their Wallet back to their registered bank account at any time, subject to standard processing times.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Investment Structures</h2>
      <p>Investments made through the platform may take the form of Equity, Revenue Share Agreements, or Simple Agreements for Future Equity (SAFE). InvestHub provides software to track these agreements, but the legal contract exists solely between the Investor and the Founder. InvestHub is not a party to these contracts.</p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. User Obligations</h2>
      <p><strong>Founders:</strong> You agree that all information provided in your pitch deck, Business Registration (BR), and milestone reports is accurate and truthful. Providing fraudulent information is grounds for immediate account termination and legal action.</p>
      <p><strong>Investors:</strong> You acknowledge that you are responsible for conducting your own due diligence before committing capital.</p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law, InvestHub and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the platform or the failure of any funded startup.</p>
    </div>
  );
}