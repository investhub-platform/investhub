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


export const findActiveMentorsByExpertise = async (expertise) => {
  return User.find({
    roles: "mentor",
    status: "active",
    deletedUtc: null,
    "profile.Expertise": expertise,
  })
    .select("_id email preferences profile.Expertise")
    .lean();
};

export const findByRole = async (role) => {
  return User.find({
    roles: role,
    status: "active",
    deletedUtc: null,
  })
    .select("_id email preferences")
    .lean();
};

// repositories/userRepository.js
export const listActiveUsersForNotification = async () => {
  return User.find({
    status: "active",
    deletedUtc: null,
  })
    .select("_id email preferences")
    .lean();
};