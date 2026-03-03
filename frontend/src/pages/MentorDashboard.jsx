// mentor dashboard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { webinars } from "@/data/mentorData";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  X,
  CheckCircle2,
} from "lucide-react";

const MentorDashboard = () => {
  const [activeView, setActiveView] = useState("browse");
  const [filter, setFilter] = useState("all");

  const filtered = webinars.filter((w) => {
    if (filter === "all") return true;
    return w.status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-4 pb-8">
        <TopNav />
      </div>
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 px-4 md:px-8 pb-12 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl heading-tight">Mentor Hub</h1>
              <p className="text-muted-foreground mt-1">
                Manage and host webinars for founders.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(activeView === "create" ? "browse" : "create")}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full gradient-blue text-sm font-semibold glow-blue transition-all"
            >
              {activeView === "create" ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {activeView === "create" ? "Cancel" : "Create Webinar"}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateWebinarForm onClose={() => setActiveView("browse")} />
              </motion.div>
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                  {["all", "upcoming", "completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`pill-filter capitalize ${filter === f ? "pill-filter-active" : ""}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Webinar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {filtered.map((webinar, i) => (
                    <WebinarCard key={webinar.id} webinar={webinar} index={i} />
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-lg">No webinars found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function WebinarCard({ webinar, index }) {
  const statusColors = {
    upcoming: "bg-primary/20 text-primary border-primary/30",
    live: "bg-destructive/20 text-destructive border-destructive/30",
    completed: "bg-accent/20 text-accent border-accent/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="obsidian-card card-hover overflow-hidden"
    >
      {/* Thumbnail bar */}
      <div className={`h-2 bg-gradient-to-r ${webinar.thumbnailColor}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold leading-snug">{webinar.title}</h3>
          <span
            className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full border capitalize ${statusColors[webinar.status]}`}
          >
            {webinar.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {webinar.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {webinar.tags.map((tag) => (
            <span key={tag} className="pill-filter text-xs py-1 px-3">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {webinar.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {webinar.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {webinar.attendees}/{webinar.maxAttendees}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold">
            {webinar.mentorAvatar}
          </div>
          <span className="text-sm text-muted-foreground">{webinar.mentor}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CreateWebinarForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="obsidian-card p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Webinar Created!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your webinar has been scheduled successfully.
        </p>
        <button onClick={onClose} className="pill-filter pill-filter-active">
          Back to Webinars
        </button>
      </div>
    );
  }

  return (
    <div className="obsidian-card p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Create New Webinar</h2>
      <div className="space-y-5">
        <FormField label="Title" placeholder="e.g. Fundraising Strategies for Pre-Seed" />
        <FormField label="Description" placeholder="Describe what founders will learn..." textarea />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Date" placeholder="2026-03-15" type="date" />
          <FormField label="Time" placeholder="2:00 PM EST" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Duration" placeholder="60 min" />
          <FormField label="Max Attendees" placeholder="200" type="number" />
        </div>
        <FormField label="Tags (comma separated)" placeholder="Fundraising, Strategy" />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSubmitted(true)}
          className="w-full py-3 rounded-full gradient-blue text-sm font-semibold glow-blue"
        >
          Schedule Webinar
        </motion.button>
      </div>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  type = "text",
  textarea = false,
}) {
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={placeholder} />
      ) : (
        <input type={type} className={inputClass} placeholder={placeholder} />
      )}
    </div>
  );
}

export default MentorDashboard;