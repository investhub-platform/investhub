import * as service from "../services/progressReportService.js";
import Idea from "../models/Idea.js";

/**
 * Progress Controller
 * Handles HTTP requests and responses
 * Delegates business logic to Progress Report Service
 */


export const listAll = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getAllReports() }); }
  catch (err) { next(err); }
};

export const getSingle = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getReportById(req.params.id) }); }
  catch (err) { next(err); }
};

export const getByIdea = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getReportsByIdeaId(req.params.ideaId) }); }
  catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try { 
    res.status(201).json({ success: true, data: await service.createReport({ userId: req.user.id, ...req.body }) }); 
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try { 
    res.json({ success: true, data: await service.updateReport(req.params.id, { userId: req.user.id, ...req.body }) }); 
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try { 
    await service.deleteReport(req.params.id, req.user.id); 
    res.json({ success: true, message: "Report delete successfully" }); 
  } catch (err) { next(err); }
};

// Startup Owner Dashboard
export const getStartupDashboard = async (req, res, next) => {
  try {
    const data = await service.getStartupDashboard(req.user.id, Idea);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};