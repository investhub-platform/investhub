import Event from "../models/Events.js";

// @desc    Create a new Event (Mentors only)
// @route   POST /api/events
// @access  Private (Mentor)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, eventType, date, link, bannerImage } = req.body;

    const event = await Event.create({
      organizerId: req.user.id, // From auth middleware
      title,
      description,
      eventType,
      date,
      link,
      bannerImage,
    });

    res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming events
// @route   GET /api/events
// @access  Public
export const getEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }) // Only future events
      .populate("organizerId", "name email") // Show organizer details
      .sort({ date: 1 }); // Soonest first

    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to an event
// @route   POST /api/events/:id/rsvp
// @access  Private
export const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Compare ObjectId strings to avoid mismatch
    const already = event.attendees.some((a) => String(a) === String(req.user.id));
    if (already) {
      return res.status(400).json({ message: "You have already registered" });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({ message: "RSVP Successful", attendeesCount: event.attendees.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single event by ID
// @route   GET /api/v1/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizerId", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/v1/events/:id
// @access  Private (organizer or admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only organizer or admin can update
    const isOwner = String(event.organizerId) === String(req.user.id);
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: not allowed to update this event" });
    }

    // Allow partial updates
    const updatable = ["title", "description", "eventType", "date", "link", "bannerImage"];
    updatable.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        event[key] = req.body[key];
      }
    });

    await event.save();
    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/v1/events/:id
// @access  Private (organizer or admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only organizer or admin can delete
    const isOwner = String(event.organizerId) === String(req.user.id);
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: not allowed to delete this event" });
    }

    await event.deleteOne();
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};