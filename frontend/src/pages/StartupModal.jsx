import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StartupDetail from "./StartupDetails";

export default function StartupModal() {
  const navigate = useNavigate();

  useEffect(() => {
    // lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => navigate(-1)} />

      <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto">
        <div className="obsidian-card p-4 md:p-6 h-full">
          <StartupDetail isModal />
        </div>
      </div>
    </div>
  );
}
