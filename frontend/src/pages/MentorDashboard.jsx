import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
  Loader,
  Edit2,
  Trash2,
  VideoIcon
} from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API_V1 = `${API_BASE}/api/v1`;

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const isOwnerEvent = (event, user) => {
  const organizerId = getId(event?.organizerId);
  const userId = getId(user);
  return !!organizerId && !!userId && String(organizerId) === String(userId);
};

const MentorDashboard = () => {
  const { accessToken, user } = useAuth();
  const [activeView, setActiveView] = useState("browse");
  const [tab, setTab] = useState("all-events");
  const [statusFilter, setStatusFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_V1}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const { data } = await response.json();
      setEvents(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (date) => {
    return new Date(date) > new Date() ? "upcoming" : "completed";
  };

  const filtered = events.filter((event) => {
    const eventStatus = getEventStatus(event.date);
    const ownerMatch = tab === "my-events" ? isOwnerEvent(event, user) : true;
    const statusMatch = statusFilter === "all" ? true : eventStatus === statusFilter;
    return ownerMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <AppNavbar />
      
      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 scroll-smooth lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" toastOptions={{ style: { background: '#0B0D10', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Mentor Hub</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">
                  Host webinars, validate milestones, and guide founders.
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveView(activeView === "create" ? "browse" : "create")}
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all w-full sm:w-auto"
              >
                {activeView === "create" ? (
                  <><X className="w-5 h-5" /> Cancel</>
                ) : (
                  <><Plus className="w-5 h-5" /> Create Event</>
                )}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {activeView === "create" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  <CreateEventForm
                    accessToken={accessToken}
                    onSuccess={() => {
                      fetchEvents();
                      setActiveView("browse");
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Filters Header Area */}
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    {/* Scope Tabs */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                      {[
                        { key: "all-events", label: "All Events" },
                        { key: "my-events", label: "My Events" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setTab(item.key)}
                          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            tab === item.key 
                              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                              : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {["all", "upcoming", "completed"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            statusFilter === f 
                              ? "bg-white/10 border border-white/20 text-white" 
                              : "border border-white/5 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <span className="font-medium">Loading events...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <div className="text-center py-10 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-2xl mx-auto flex flex-col items-center">
                      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                      <h3 className="font-bold text-white mb-1">Failed to load events</h3>
                      <p className="text-sm text-red-200 mb-4">{error}</p>
                      <button onClick={fetchEvents} className="px-6 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors">
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Event Grid */}
                  {!loading && !error && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                        {filtered.map((event, i) => (
                          <EventCard
                            key={event._id}
                            event={event}
                            status={getEventStatus(event.date)}
                            accessToken={accessToken}
                            currentUser={user}
                            onDeleted={() => fetchEvents()}
                            onUpdated={() => fetchEvents()}
                            onRsvped={() => fetchEvents()}
                            index={i}
                          />
                        ))}
                      </div>

                      {filtered.length === 0 && (
                        <div className="text-center py-24 bg-[#0B0D10] border border-white/5 rounded-[2rem] mt-4">
                          <VideoIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-xl font-bold text-white mb-2">No events found</p>
                          <p className="text-slate-400 text-sm">Try adjusting your filters or create a new event.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

function EventCard({ event, status, index, accessToken, currentUser, onDeleted, onUpdated, onRsvped }) {
  const statusColors = {
    upcoming: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    completed: "bg-white/5 border-white/10 text-slate-400",
  };

  const eventTypeColors = {
    "Webinar": "from-blue-500/40 to-indigo-600/40",
    "Workshop": "from-purple-500/40 to-pink-600/40",
    "Pitch Day": "from-cyan-500/40 to-blue-600/40",
    "Networking": "from-emerald-500/40 to-teal-600/40",
    "Legal Session": "from-orange-500/40 to-red-600/40",
  };

  const getEventInitials = (organizer) => {
    if (!organizer) return "EV";
    const name = organizer.name || "Event";
    return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "EV";
  };

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formattedTime = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-[#0B0D10] rounded-[1.5rem] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-2xl flex flex-col"
    >
      {/* Banner */}
      <div className={`h-16 w-full bg-gradient-to-r ${eventTypeColors[event.eventType] || "from-slate-700/40 to-slate-600/40"} relative`}>
         <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${statusColors[status] || statusColors.upcoming}`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1 leading-relaxed">
          {event.description}
        </p>

        {/* Tags & Meta */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[11px] font-bold tracking-wide uppercase text-white bg-white/10 py-1 px-3 rounded-md border border-white/5">
             {event.eventType}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-[#1A1D24] py-1 px-3 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-[#1A1D24] py-1 px-3 rounded-md">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> {formattedTime}
          </span>
        </div>

        {/* Footer Area */}
        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold text-white shadow-inner">
              {getEventInitials(event.organizerId)}
            </div>
            <div>
               <p className="text-xs text-slate-500 font-medium leading-none mb-1">Hosted by</p>
               <p className="text-sm text-white font-semibold leading-none">{event.organizerId?.name || "Mentor"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
             <Users className="w-3.5 h-3.5" /> {event.attendees?.length || 0}
          </div>
        </div>
        
      </div>
      
      <EventCardActions
        event={event}
        accessToken={accessToken}
        currentUser={currentUser}
        onDeleted={onDeleted}
        onUpdated={onUpdated}
        onRsvped={onRsvped}
        isUpcoming={status === "upcoming"}
      />
    </motion.div>
  );
}

function EventCardActions({ event, accessToken, currentUser, onDeleted, onUpdated, onRsvped, isUpcoming }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    eventType: event.eventType || "Webinar",
    date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
    time: event.date ? new Date(event.date).toISOString().slice(11, 16) : "",
    link: event.link || "",
  });

  const getOrganizerId = (organizer) => {
    if (!organizer) return null;
    return organizer._id || organizer.id || organizer;
  };

  const isOwner = currentUser && String(getOrganizerId(event.organizerId)) === String(currentUser._id || currentUser.id);
  const hasRsvped = !!currentUser && Array.isArray(event.attendees)
    ? event.attendees.some((attendee) => String(getId(attendee)) === String(getId(currentUser)))
    : false;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDelete = async () => {
    if (!accessToken) return toast.error("You must be logged in to delete events.");
    if (!window.confirm("Delete this event? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_V1}/events/${event._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      toast.success("Event deleted");
      onDeleted && onDeleted();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e && e.preventDefault();
    if (!accessToken) return toast.error("You must be logged in to update events.");
    try {
      setLoading(true);
      const datetime = new Date(`${form.date}T${form.time}`);
      const payload = { ...form, date: datetime.toISOString() };

      const res = await fetch(`${API_V1}/events/${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update event");
      toast.success("Event updated");
      setEditing(false);
      onUpdated && onUpdated();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async () => {
    if (!accessToken) return toast.error("Please log in to RSVP.");
    try {
      setRsvpLoading(true);
      const res = await fetch(`${API_V1}/events/${event._id}/rsvp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to RSVP");
      toast.success("RSVP successful");
      onRsvped && onRsvped();
    } catch (err) {
      toast.error(err.message || "RSVP failed");
    } finally {
      setRsvpLoading(false);
    }
  };

  if (!isOwner) {
    if (!isUpcoming) return null;
    return (
      <div className="p-4 border-t border-white/5 bg-[#1A1D24]/50">
         <div className="flex items-center gap-3">
            <button
               type="button"
               disabled={rsvpLoading || hasRsvped}
               onClick={handleRsvp}
               className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasRsvped 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-white text-black hover:bg-slate-200"
               }`}
            >
               {hasRsvped ? <><CheckCircle2 className="w-4 h-4"/> Registered</> : rsvpLoading ? "Processing..." : "Reserve Spot"}
            </button>
            {event.link && hasRsvped && (
               <a href={event.link} target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                  Join
               </a>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5 bg-white/[0.02]">
      {editing ? (
        <form onSubmit={handleUpdate} className="p-5 space-y-4">
          <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm" placeholder="Event title" />
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm resize-none" placeholder="Event description" rows={3} />
          
          <select name="eventType" value={form.eventType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm">
            {["Webinar", "Workshop", "Pitch Day", "Networking", "Legal Session"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" value={form.date} onChange={handleChange} className="px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
            <input name="time" type="time" value={form.time} onChange={handleChange} className="px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
          </div>
          
          <input name="link" value={form.link} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm" placeholder="Meeting link URL" />
          
          <div className="flex gap-3 pt-2">
            <button disabled={loading} type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 flex gap-3">
          <button onClick={() => setEditing(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-bold text-sm transition-colors">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CreateEventForm({ accessToken, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "", description: "", eventType: "Webinar", date: "", time: "", link: "", bannerImage: "default_event.jpg",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventTypes = ["Webinar", "Workshop", "Pitch Day", "Networking", "Legal Session"];

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return setError("Session expired. Please log in again.");
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.link) return setError("All fields are required");

    try {
      setLoading(true);
      setError(null);
      const payload = { ...formData, date: new Date(`${formData.date}T${formData.time}`).toISOString() };
      const response = await fetch(`${API_V1}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create event");
      setSubmitted(true);
      toast.success("Event created successfully!");
      setTimeout(onSuccess, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#0B0D10] border border-white/5 p-10 rounded-[2rem] text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Event Scheduled!</h2>
        <p className="text-slate-400 mb-6">Your webinar is now live and accepting RSVPs.</p>
        <Loader className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0D10] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
         <h2 className="text-2xl font-black text-white mb-6">Create New Event</h2>

         {error && (
           <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
             <AlertCircle className="w-5 h-5 shrink-0" />
             {error}
           </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-5">
           <FormField label="Event Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Fundraising Strategies for Pre-Seed" />
           <FormField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe what attendees will learn..." textarea />

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div>
               <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block ml-1">Event Type</label>
               <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 text-sm">
                 {eventTypes.map((type) => <option key={type} value={type} className="bg-[#0B0D10]">{type}</option>)}
               </select>
             </div>
             <FormField label="Meeting Link" name="link" value={formData.link} onChange={handleChange} placeholder="https://zoom.us/..." />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />
             <FormField label="Time" name="time" type="time" value={formData.time} onChange={handleChange} />
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full mt-4 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
           >
             {loading ? <><Loader className="w-5 h-5 animate-spin" /> Publishing...</> : "Publish Event"}
           </button>
         </form>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = "text", textarea = false }) {
  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm";
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block ml-1">{label}</label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} className={`${inputClass} min-h-[120px] resize-none`} placeholder={placeholder} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={inputClass} placeholder={placeholder} />
      )}
    </div>
  );
}

export default MentorDashboard;