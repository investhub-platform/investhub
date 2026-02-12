import Startup from '../models/Startup.js';

export const listStartups = async (_req, res) => {
  const docs = await Startup.find().lean();
  res.json({ data: docs });
};

export const createStartup = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });

  const doc = await Startup.create({ name, description });
  res.status(201).json({ data: doc });
};
