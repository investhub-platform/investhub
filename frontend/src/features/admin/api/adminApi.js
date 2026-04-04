import api from "../../../lib/axios";

export const listUsers = async (params = {}) => {
  const res = await api.get("/v1/admin/users", { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/v1/admin/users/${id}`);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await api.patch(`/v1/admin/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/v1/admin/users/${id}`);
  return res.data;
};

export const getPlatformIncome = async () => {
  const res = await api.get("/v1/admin/income");
  return res.data;
};