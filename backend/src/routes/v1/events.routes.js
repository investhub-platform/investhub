import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as eventController from "../../controllers/eventController.js";

const router = Router();

router.post("/", protect, eventController.createEvent);
router.get("/", eventController.getEvents);
router.post("/:id/rsvp", protect, eventController.rsvpEvent);

export default router;
