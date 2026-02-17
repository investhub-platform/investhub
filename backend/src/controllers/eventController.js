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