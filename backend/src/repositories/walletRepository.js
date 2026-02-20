import Wallet from '../models/Wallet.js';

/**
 * WalletRepository
 * Pure database operations for the Wallet model.
 * No business logic — only queries.
 */

/** Find the wallet that belongs to a user (optionally inside a Mongo session). */
export const findByUser = (userId, session = null) => {
  const query = Wallet.findOne({ userId });
  return session ? query.session(session) : query;
};

/** Find a wallet by its own _id (optionally inside a Mongo session). */
export const findById = (id, session = null) => {
  const query = Wallet.findById(id);
  return session ? query.session(session) : query;
};

/** Create a new wallet document. */
export const create = (payload) => Wallet.create(payload);

/** Persist changes to an existing wallet document. */
export const save = (doc, session = null) =>
  session ? doc.save({ session }) : doc.save();
