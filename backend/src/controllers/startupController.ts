import { Request, Response } from 'express';

export const listStartups = async (_req: Request, res: Response) => {
  // placeholder - real implementation will query Startup model
  res.json({ data: [], message: 'List of startups (placeholder)' });
};
