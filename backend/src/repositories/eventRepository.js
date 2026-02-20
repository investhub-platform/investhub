import Event from '../models/Events.js';

/**
 * EventRepository
 * Pure database operations for the Event model.
 */

/** Create a new event document. */
export const create = (payload) => Event.create(payload);

/**
 * Find all future events, optionally filtered.
 * Populates the organizer's name and email for display.
 */
export const findUpcoming = (filter = {}) =>
  Event.find({ date: { $gte: new Date() }, ...filter })
    .populate('organizerId', 'name email')
    .sort({ date: 1 }); // Soonest first

/** Find a single event by its _id (no population). */
export const findById = (id) => Event.findById(id);

/** Find a single event by its _id with organizer details populated. */
export const findByIdWithOrganizer = (id) =>
  Event.findById(id).populate('organizerId', 'name email');

/** Save changes to an existing event document. */
export const save = (doc) => doc.save();

/** Remove an event document from the database. */
export const deleteDoc = (doc) => doc.deleteOne();
