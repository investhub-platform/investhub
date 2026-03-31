import fs from "fs";
import path from "path";
import multer from "multer";

const avatarsDir = path.resolve(process.cwd(), "uploads", "avatars");
const postAssetsDir = path.resolve(process.cwd(), "uploads", "posts");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(postAssetsDir)) {
  fs.mkdirSync(postAssetsDir, { recursive: true });
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

const postStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, postAssetsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
    const safeUserId = String(req.user?.id || req.body?.createdBy || "user").replace(/[^a-zA-Z0-9_-]/g, "");
    const random = Math.random().toString(36).slice(2, 8);
    cb(null, `${safeUserId}-${Date.now()}-${random}${ext}`);
  },
});

const imageMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
const pitchDeckMimes = new Set([
  ...imageMimes,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

const postAssetsUpload = multer({
  storage: postStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "photo") {
      if (!imageMimes.has(file.mimetype)) {
        cb(new Error("Photo must be JPEG, PNG, or WEBP"));
        return;
      }
      cb(null, true);
      return;
    }

    if (file.fieldname === "pitchDeckFiles") {
      if (!pitchDeckMimes.has(file.mimetype)) {
        cb(new Error("Pitch deck file type is not supported"));
        return;
      }
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported upload field"));
  }
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

export function handlePostAssetsUpload(req, res, next) {
  postAssetsUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "pitchDeckFiles", maxCount: 6 }
  ])(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      err.statusCode = 400;
      err.message = "Uploaded files must be 10MB or less.";
      next(err);
      return;
    }

    err.statusCode = err.statusCode || 400;
    next(err);
  });
}
