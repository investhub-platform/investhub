import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Shield } from "lucide-react";

export default function StartupDetailsHero({ isModal, navigate, startup, isPlan }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 h-[350px] w-full overflow-hidden">
        {startup.photoUrl ? (
          <>
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img src={startup.photoUrl} alt="Cover" className="w-full h-full object-cover blur-sm opacity-50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
        )}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent z-20" />
      </div>

      <div className={`max-w-6xl mx-auto px-4 md:px-8 ${isModal ? "pt-6 pb-6" : "pt-24 md:pt-32 pb-8"} relative z-30`}>
        {isModal ? (
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white mb-8 transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" /> Close
          </button>
        ) : (
          <Link
            to="/app/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white mb-8 transition-colors backdrop-blur-md shadow-lg w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[#0B0D10] border-4 border-[#020617] flex items-center justify-center text-3xl font-black shrink-0 overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 z-0" />
              {startup.photoUrl ? (
                <img src={startup.photoUrl} alt={startup.name} className="w-full h-full object-cover relative z-10" />
              ) : (
                <span className="bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent relative z-10">
                  {startup.logo || startup.name?.charAt(0)}
                </span>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-lg">{startup.name}</h1>
              <p className="text-slate-300 md:text-lg font-medium max-w-2xl drop-shadow-md">{startup.tagline}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
                    {isPlan ? "Investor Mandate" : `Verified by ${startup.mentorName}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button className="self-start md:self-end p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-md shadow-lg text-slate-300 hover:text-white">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
