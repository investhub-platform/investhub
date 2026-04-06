// controllers/portfolioController.js
import * as portfolioService from "../services/portfolioService.js";

export const getPortfolios = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolios(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolioById(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.createPortfolio(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updatePortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.updatePortfolio(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deletePortfolio = async (req, res, next) => {
  try {
    await portfolioService.deletePortfolio(req.params.id, req.user.id);
    res.json({ success: true, data: { message: "Portfolio deleted" } });
  } catch (err) {
    next(err);
  }
};
