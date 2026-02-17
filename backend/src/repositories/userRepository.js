import User from "../models/User.js";

export const findByEmail = (email) => User.findOne({ email: email.toLowerCase() });

export const findById = (id) => User.findById(id);

export const create = (payload) => User.create(payload);

export const save = (doc) => doc.save();

export const updateById = (id, payload) =>
  User.findByIdAndUpdate(id, payload, { new: true });

export const list = ({ q, status, role, page = 1, limit = 20 }) => {
  const filter = { deletedUtc: null };

  if (status) filter.status = status;
  if (role) filter.roles = role;

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  return User.find(filter).sort({ createdUtc: -1 }).skip(skip).limit(limit);
};
export const findPublicById = (id) =>
  User.findById(id).select("-passwordHash -refreshTokenHash -emailOtpHash -resetOtpHash");
