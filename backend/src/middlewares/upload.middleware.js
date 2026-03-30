import fs from "fs";
import path from "path";
import multer from "multer";

const avatarsDir = path.resolve(process.cwd(), "uploads", "avatars");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeUserId = String(req.user?.id || "user").replace(/[^a-zA-Z0-9_-]/g, "");
    const random = Math.random().toString(36).slice(2, 8);
    cb(null, `${safeUserId}-${Date.now()}-${random}${ext}`);
  },
});

const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileFilter(_req, file, cb) {
  if (!allowedMimes.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    return;
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export function handleAvatarUpload(req, res, next) {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      err.statusCode = 400;
      err.message = "Avatar must be 2MB or less.";
      next(err);
      return;
    }

    err.statusCode = err.statusCode || 400;
    next(err);
  });
}
