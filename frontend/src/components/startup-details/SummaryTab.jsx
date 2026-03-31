import { ExternalLink, FileText } from "lucide-react";

export default function SummaryTab({ startup }) {
  return (
    <div className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Pitch Summary</h2>
        <p className="text-slate-300 leading-relaxed font-medium text-sm md:text-base">{startup.pitchSummary || "No summary available."}</p>
      </div>

      {startup.pitchDeckText && (
        <div className="p-6 rounded-2xl bg-[#1A1D24]/50 border border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Pitch Deck Notes
          </h3>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{startup.pitchDeckText}</p>
        </div>
      )}

      {startup.pitchDeckFiles?.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Attachments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {startup.pitchDeckFiles.map((file, idx) => {
              const isImage = (file?.mimeType || "").startsWith("image/");
              return (
                <div key={`${file.url}-${idx}`} className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                  {isImage ? (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-black">
                      <img src={file.url} alt={file.originalName || `pitch-${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-[#1A1D24] mb-3 flex items-center justify-center border border-white/5">
                      <FileText className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <p className="text-sm font-bold text-white truncate px-1">{file.originalName || "Attached Document"}</p>
                  <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 px-1 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wide">
                    Open file <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {startup.tags?.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {startup.tags.map((tag) => (
              <span key={tag} className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 border border-white/10 py-1.5 px-3 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
