import { useState } from "react";
import { 
  ExternalLink, FileText, Copy, Check, Sparkles, 
  Image, File, Presentation, FileSpreadsheet, AlertCircle 
} from "lucide-react";

// Helper: Dynamic file icon & color based on MIME/extension
const getFileMeta = (mimeType, fileName) => {
  const mime = (mimeType || "").toLowerCase();
  const name = (fileName || "").toLowerCase();
  
  if (mime.startsWith("image/")) return { icon: Image, color: "text-pink-400", bg: "bg-pink-500/10", label: "Image" };
  if (mime.includes("pdf") || name.endsWith(".pdf")) return { icon: FileText, color: "text-red-400", bg: "bg-red-500/10", label: "PDF" };
  if (mime.includes("presentation") || mime.includes("powerpoint") || name.endsWith(".pptx") || name.endsWith(".ppt")) return { icon: Presentation, color: "text-orange-400", bg: "bg-orange-500/10", label: "Presentation" };
  if (mime.includes("spreadsheet") || mime.includes("excel") || name.endsWith(".xlsx") || name.endsWith(".xls")) return { icon: FileSpreadsheet, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Spreadsheet" };
  return { icon: File, color: "text-blue-400", bg: "bg-blue-500/10", label: "Document" };
};

export default function SummaryTab({ startup }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!startup?.pitchSummary) return;
    try {
      await navigator.clipboard.writeText(startup.pitchSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = startup.pitchSummary;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!startup) return null;

  const hasContent = startup.pitchSummary || startup.pitchDeckText || startup.pitchDeckFiles?.length > 0 || startup.tags?.length > 0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0B0D10] to-[#11131a] border border-white/10 shadow-2xl space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Pitch Summary</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Powered by InvestHub AI Engine - providing insights based on uploaded pitch materials.
          </p>
        </div>
      </div>

      {!hasContent && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-white/10 rounded-2xl">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm font-medium">No pitch data available</p>
          <p className="text-xs mt-1">Upload documents to generate a summary</p>
        </div>
      )}

      {/* OVERVIEW */}
      {startup.pitchSummary && (
        <div className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-white/20">
          <div className="flex items-start justify-between gap-4 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Overview</p>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : "Copy summary"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {startup.pitchSummary}
          </p>
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      )}

      {/* PITCH DECK NOTES */}
      {startup.pitchDeckText && (
        <div className="p-6 rounded-2xl bg-[#0F1116] border border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Deck Notes
          </h3>
          <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {startup.pitchDeckText}
            </p>
          </div>
        </div>
      )}

      {/* ATTACHMENTS */}
      {startup.pitchDeckFiles?.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Attachments ({startup.pitchDeckFiles.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {startup.pitchDeckFiles.map((file, idx) => {
              const isImage = (file?.mimeType || "").startsWith("image/");
              const meta = getFileMeta(file.mimeType, file.originalName);
              const Icon = meta.icon;

              return (
                <div
                  key={`${file.url}-${idx}`}
                  className="group relative flex flex-col p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/40"
                >
                  {/* Preview Area */}
                  <div className={`w-full ${isImage ? "h-36" : "h-24"} rounded-xl overflow-hidden mb-3 bg-[#16181D] border border-white/5 flex items-center justify-center relative`}>
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.originalName || `Attachment ${idx + 1}`}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`p-3 rounded-lg ${meta.bg}`}>
                        <Icon className={`w-6 h-6 ${meta.color}`} />
                      </div>
                    )}
                    {/* File type badge */}
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold uppercase text-slate-200 border border-white/10">
                      {meta.label}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate" title={file.originalName}>
                      {file.originalName || `File ${idx + 1}`}
                    </p>
                    {file.size && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${file.originalName || "file"}`}
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAGS */}
      {startup.tags?.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {startup.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}