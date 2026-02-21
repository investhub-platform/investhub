import Transaction from '../models/Transaction.js';

/**
 * TransactionRepository
 * Pure database operations for the Transaction model.
 */

/**
 * Create a single transaction.
 * Pass a Mongo session for atomic operations.
 */
export const create = async (payload, session = null) => {
  if (session) {
    // Transaction.create with a session requires the array syntax
    const [tx] = await Transaction.create([payload], { session });
    return tx;
  }
  return Transaction.create(payload);
};

/**
 * Create multiple transactions in one call (used for investment debit + credit).
 * Requires a Mongo session.
 */
export const createMany = (payloads, session) => {
  // Use insertMany when creating multiple documents within a session.
  // Model.create with a session + multiple docs can fail unless `ordered: true` is set.
  return Transaction.insertMany(payloads, { session, ordered: true });
};

/**
 * Find all transactions for a user with optional extra filters.
 * Always sorted newest-first.
 */
export const findByUser = (userId, filter = {}) =>
  Transaction.find({ userId, ...filter }).sort({ createdAt: -1 });

/** Look up the pending transaction created during deposit initiation. */
export const findByPaymentId = (paymentId) =>
  Transaction.findOne({ paymentId });

/** Persist changes to an existing transaction document. */
export const save = (doc, session = null) =>
  session ? doc.save({ session }) : doc.save();
