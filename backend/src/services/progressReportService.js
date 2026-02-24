import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import * as repo from "../repositories/progressReportRepository.js";

/**
 * Progress Report Service
 * Handles business logic for Progress Report operations
 */


/** CRUD Operations */

// Find all
export const getAllReports = async () => repo.findAll();

export const getReportById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid ID", 400);
  const report = await repo.findById(id);
  if (!report) throw new AppError("Report not found", 404);
  return report;
};

// Find Report By Idea Id
export const getReportsByIdeaId = async (ideaId) => {
  if (!mongoose.Types.ObjectId.isValid(ideaId)) throw new AppError("Invalid Idea ID", 400);
  return repo.findByIdeaId(ideaId);
};

// Create Report
export const createReport = async ({ userId, ...data }) => {
  if (!data.ideaId || !data.mentorId || !data.weekNumber)
    throw new AppError("Missing required fields", 400);
  return repo.create({ ...data, createdBy: userId, updatedBy: userId });
};

// Update Report
export const updateReport = async (id, { userId, ...data }) => {
  const report = await repo.findById(id);
  if (!report) throw new AppError("Report not found", 404);
  Object.assign(report, data);
  report.updatedBy = userId;
  report.updatedUtc = new Date();
  return repo.save(report);
};

// Delete report
export const deleteReport = async (id, userId) => {
  const report = await repo.findById(id);
  if (!report) throw new AppError("Report not found", 404);
  return repo.softDelete(report, userId);
};

/** Startup Owner Dashboard */
export const getStartupDashboard = async (startupOwnerId, IdeaModel) => {
  const ideas = await IdeaModel.find({ createdBy: startupOwnerId, deletedUtc: null }).lean();
  return Promise.all(ideas.map(async (idea) => {
    const reports = await repo.findByIdeaId(idea._id);
    let milestoneProgress = 0;
    if (reports.length && reports[0].milestones?.length) {
      const completed = reports[0].milestones.filter(m => m.status === "completed").length;
      milestoneProgress = Math.round((completed / reports[0].milestones.length) * 100);
    }
    return {
      ideaId: idea._id,
      title: idea.title,
      budget: idea.budget,
      status: reports[0]?.overallStatus || idea.status,
      milestoneProgress,
      lastReportDate: reports[0]?.reportDate || null,
      totalReports: reports.length,
      reports: reports.map(r => ({
        weekNumber: r.weekNumber,
        reportDate: r.reportDate,
        overallStatus: r.overallStatus,
        milestones: r.milestones,
        attachments: r.attachments
      }))
    };
  }));
};