import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-white/[0.07] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
      />
    </div>
  );
}
