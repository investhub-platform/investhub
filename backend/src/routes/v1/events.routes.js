import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as eventController from "../../controllers/eventController.js";

const router = Router();

router.post("/", protect, eventController.createEvent);
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.post("/:id/rsvp", protect, eventController.rsvpEvent);
router.put("/:id", protect, eventController.updateEvent);
router.delete("/:id", protect, eventController.deleteEvent);

export default router;
