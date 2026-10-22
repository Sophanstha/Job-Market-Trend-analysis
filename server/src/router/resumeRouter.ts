import { Router } from "express";
import multer from "multer";
import analyizResume from "../controller/resumeController.ts";

const resumeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB maximum
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

resumeRouter.post(
  "/analyze",
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed. Ensure the file is a PDF under 5MB.",
        });
      }
      next();
    });
  },
  analyizResume
);

export default resumeRouter;