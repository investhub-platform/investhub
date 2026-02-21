import * as eventService from '../services/eventService.js';

// @desc    Create a new Event
// @route   POST /api/v1/events
// @access  Private (Mentor)
export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming events
// @route   GET /api/v1/events
// @access  Public
export const getEvents = async (_req, res, next) => {
  try {
    const events = await eventService.getUpcomingEvents();
    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single event by ID
// @route   GET /api/v1/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to an event
// @route   POST /api/v1/events/:id/rsvp
// @access  Private
export const rsvpEvent = async (req, res, next) => {
  try {
    const attendeesCount = await eventService.rsvpToEvent(req.params.id, req.user.id);
    res.status(200).json({ message: 'RSVP Successful', attendeesCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/v1/events/:id
// @access  Private (organizer or admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(
      req.params.id,
      req.user.id,
      req.user.roles,
      req.body
    );
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
    await eventService.deleteEvent(req.params.id, req.user.id, req.user.roles);
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
