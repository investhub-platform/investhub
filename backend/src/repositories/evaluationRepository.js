import Evaluation from '../models/Evaluation.js';

/**
 * EvaluationRepository
 * Pure database operations for the Evaluation model.
 */

/** Find the evaluation tied to a specific startup (one-to-one). */
export const findByStartup = (startupId) => Evaluation.findOne({ startupId });

/** Persist a new evaluation. */
export const create = (payload) => Evaluation.create(payload);

/** Save changes to an existing evaluation document. */
export const save = (doc) => doc.save();

/** Remove an evaluation document from the database. */
export const deleteDoc = (doc) => doc.deleteOne();
