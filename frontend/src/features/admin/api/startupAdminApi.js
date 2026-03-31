import api from "../../../lib/axios";

// Get all startups
export const getAllStartups = async () => {
  const res = await api.get("/v1/startups");
  return res.data;
};

// Get pending startups only
export const getPendingStartups = async () => {
  const res = await api.get("/v1/startups/status/pending");
  return res.data;
};

// Approve startup
export const approveStartup = async (id) => {
  const res = await api.patch(`/v1/startups/${id}/approve`);
  return res.data;
};

// Reject startup
export const rejectStartup = async (id) => {
  const res = await api.patch(`/v1/startups/${id}/reject`);
  return res.data;
};