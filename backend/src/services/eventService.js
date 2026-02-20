import * as eventRepo from '../repositories/eventRepository.js';
import AppError from '../utils/AppError.js';

/**
 * EventService
 * Business logic for event & RSVP operations.
 * All DB operations delegate to eventRepository.
 */

/** Create a new event for an organizer. */
export const createEvent = async (organizerId, { title, description, eventType, date, link, bannerImage }) =>
  eventRepo.create({ organizerId, title, description, eventType, date, link, bannerImage });

/** Return all upcoming (future) events with organizer info. */
export const getUpcomingEvents = async () => eventRepo.findUpcoming();

/**
 * Return a single event by ID with organizer info.
 * Throws 404 if not found.
 */
export const getEventById = async (id) => {
  const event = await eventRepo.findByIdWithOrganizer(id);
  if (!event) throw new AppError('Event not found', 404);
  return event;
};

/**
 * Register a user as an attendee.
 * Throws 400 if the user already RSVP'd, 404 if the event doesn't exist.
 * Returns updated attendee count.
 */
export const rsvpToEvent = async (eventId, userId) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const already = event.attendees.some((a) => String(a) === String(userId));
  if (already) throw new AppError('You have already registered', 400);

  event.attendees.push(userId);
  await eventRepo.save(event);
  return event.attendees.length;
};

/**
 * Apply a partial update to an event.
 * Only the organizer or an admin may update.
 * Returns the saved event document.
 */
export const updateEvent = async (eventId, userId, roles, payload) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const isOwner = String(event.organizerId) === String(userId);
  const isAdmin = Array.isArray(roles) && roles.includes('admin');
  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: not allowed to update this event', 403);
  }

  const updatable = ['title', 'description', 'eventType', 'date', 'link', 'bannerImage'];
  updatable.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      event[key] = payload[key];
    }
  });

  return eventRepo.save(event);
};

/**
 * Delete an event.
 * Only the organizer or an admin may delete.
 */
export const deleteEvent = async (eventId, userId, roles) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const isOwner = String(event.organizerId) === String(userId);
  const isAdmin = Array.isArray(roles) && roles.includes('admin');
  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: not allowed to delete this event', 403);
  }

  await eventRepo.deleteDoc(event);
};
