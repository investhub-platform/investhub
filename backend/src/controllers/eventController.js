const Event = require('../models/eventModel');

// @desc    Create a new Event (Mentors only)
// @route   POST /api/events
// @access  Private (Mentor)
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, date, link, bannerImage } = req.body;

    const event = await Event.create({
      organizerId: req.user.id, // From auth middleware
      title,
      description,
      eventType,
      date,
      link,
      bannerImage
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all upcoming events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }) // Only future events
      .populate('organizerId', 'name email') // Show organizer details
      .sort({ date: 1 }); // Soonest first

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    RSVP to an event
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already RSVP'd
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already registered' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({ message: 'RSVP Successful', attendeesCount: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  rsvpEvent,
};