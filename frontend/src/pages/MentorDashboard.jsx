// mentor dashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
  Loader,
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

  // Fetch events on mount
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

  // Filter events by status (upcoming/completed)
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
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 px-4 md:px-8 pt-28 pb-12 max-w-7xl">
          <Toaster position="top-right" />
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
              {activeView === "create" ? "Cancel" : "Create Event"}
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
                {/* Scope Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {[
                    { key: "all-events", label: "All Events" },
                    { key: "my-events", label: "My Events" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      className={`pill-filter ${tab === item.key ? "pill-filter-active" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                  {["all", "upcoming", "completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`pill-filter capitalize ${statusFilter === f ? "pill-filter-active" : ""}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-20">
                    <Loader className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                    <p className="text-muted-foreground">Loading events...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="obsidian-card p-5 border border-destructive/50 bg-destructive/10 rounded-xl">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-destructive">Failed to load events</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                        <button
                          onClick={fetchEvents}
                          className="mt-3 text-sm font-medium text-primary hover:text-primary/80"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Grid */}
                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <div className="text-center py-20 text-muted-foreground">
                        <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-lg">No events found</p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function EventCard({ event, status, index, accessToken, currentUser, onDeleted, onUpdated, onRsvped }) {
  const statusColors = {
    upcoming: "bg-primary/20 text-primary border-primary/30",
    completed: "bg-accent/20 text-accent border-accent/30",
  };

  const eventTypeColors = {
    "Webinar": "from-blue-500 to-indigo-500",
    "Workshop": "from-violet-500 to-fuchsia-500",
    "Pitch Day": "from-cyan-500 to-blue-500",
    "Networking": "from-emerald-500 to-teal-500",
    "Legal Session": "from-orange-500 to-red-500",
  };

  const getEventInitials = (organizer) => {
    if (!organizer) return "EV";
    const name = organizer.name || "Event";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "EV";
  };

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="obsidian-card card-hover overflow-hidden"
    >
      {/* Thumbnail bar */}
      <div className={`h-2 bg-gradient-to-r ${eventTypeColors[event.eventType] || "from-blue-500 to-indigo-500"}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold leading-snug">{event.title}</h3>
          <span
            className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full border capitalize ${statusColors[status] || statusColors.upcoming}`}
          >
            {status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Event Type Badge */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="pill-filter text-xs py-1 px-3">{event.eventType}</span>
        </div>

        {/* Event Details */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formattedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {event.attendees?.length || 0}
          </span>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold">
            {getEventInitials(event.organizerId)}
          </div>
          <span className="text-sm text-muted-foreground">
            {event.organizerId?.name || "Mentor"}
          </span>
        </div>

        {/* Meeting Link */}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-primary hover:text-primary/80 underline"
          >
            Join Meeting →
          </a>
        )}
      </div>
      <EventCardActions
        event={event}
        accessToken={accessToken}
        currentUser={currentUser}
        onDeleted={onDeleted}
        onUpdated={onUpdated}
        onRsvped={onRsvped}
      />
    </motion.div>
  );
}

// Enhanced EventCard with edit/delete when owner
function EventCardActions({ event, accessToken, currentUser, onDeleted, onUpdated, onRsvped }) {
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
  const isUpcoming = new Date(event.date) > new Date();
  const hasRsvped = !!currentUser && Array.isArray(event.attendees)
    ? event.attendees.some((attendee) => String(getId(attendee)) === String(getId(currentUser)))
    : false;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDelete = async () => {
    if (!accessToken) return toast.error("You must be logged in to delete events.");
    if (!confirm("Delete this event? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_V1}/events/${event._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to delete event");
      }
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
      const payload = {
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        date: datetime.toISOString(),
        link: form.link,
      };

      const res = await fetch(`${API_V1}/events/${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to update event");
      }
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
    if (!accessToken) {
      toast.error("Please log in to RSVP.");
      return;
    }

    try {
      setRsvpLoading(true);
      const res = await fetch(`${API_V1}/events/${event._id}/rsvp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || "Failed to RSVP");
      }

      toast.success(body.message || "RSVP successful");
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
      <div className="p-4 border-t border-white/[0.03]">
        <button
          type="button"
          disabled={rsvpLoading || hasRsvped}
          onClick={handleRsvp}
          className="pill-filter pill-filter-active disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {hasRsvped ? "RSVP'd" : rsvpLoading ? "RSVPing..." : "RSVP"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/[0.03]">
      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
            placeholder="Event title"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
            placeholder="Event description"
            rows={3}
          />
          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
          >
            {["Webinar", "Workshop", "Pitch Day", "Networking", "Legal Session"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
            />
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
            />
          </div>
          <input
            name="link"
            value={form.link}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/[0.07]"
            placeholder="Meeting link"
          />
          <div className="flex gap-2">
            <button disabled={loading} type="submit" className="pill-filter pill-filter-active">
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="pill-filter">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="pill-filter">Edit</button>
          <button onClick={handleDelete} disabled={loading} className="pill-filter text-destructive">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CreateEventForm({ accessToken, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Webinar",
    date: "",
    time: "",
    link: "",
    bannerImage: "default_event.jpg",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventTypes = ["Webinar", "Workshop", "Pitch Day", "Networking", "Legal Session"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.link) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine date and time into ISO string
      const datetime = new Date(`${formData.date}T${formData.time}`);

      const payload = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        date: datetime.toISOString(),
        link: formData.link,
        bannerImage: formData.bannerImage,
      };

      const response = await fetch(`${API_V1}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      setSubmitted(true);
      toast.success("Event created");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to create event");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="obsidian-card p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Event Created!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your event has been scheduled successfully.
        </p>
        <p className="text-xs text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="obsidian-card p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Create New Event</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Fundraising Strategies for Pre-Seed"
        />

        <FormField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what attendees will learn..."
          textarea
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Event Type</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Meeting Link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://zoom.us/... or meet.google.com/..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />

          <FormField
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-full gradient-blue text-sm font-semibold glow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Event"
          )}
        </motion.button>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
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
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputClass} min-h-[100px] resize-none`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClass}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default MentorDashboard;