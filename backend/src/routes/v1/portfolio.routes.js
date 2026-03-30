// routes/v1/portfolio.routes.js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} from "../../controllers/portfolioController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getPortfolios);
router.get("/:id", getPortfolio);
router.post("/", createPortfolio);
router.put("/:id", updatePortfolio);
router.delete("/:id", deletePortfolio);

export default router;
