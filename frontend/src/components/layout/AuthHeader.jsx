import { Link } from "react-router-dom";

export default function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-auto">
      <div className="pointer-events-auto relative flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="InvestHub"
            width={28}
            height={28}
            className="h-6 w-6 rounded-md object-contain"
          />
          <span className="text-white font-semibold tracking-wide text-sm">InvestHub</span>
        </Link>

        <div className="ml-auto">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </header>
  );
}
