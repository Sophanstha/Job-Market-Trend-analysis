import type { Request, Response, NextFunction } from "express";
import { validationResult, body } from "express-validator";

export const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
export const registerRule = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is requied")
    .isEmail()
    .withMessage("Enter the validate email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginRule = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is requied")
    .isEmail()
    .withMessage("Enter the validate email"),
  body("password").notEmpty().withMessage("Password is required"),
];
export const searchRule = [
  body("query")
    .trim()
    .notEmpty()
    .withMessage("Query is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Query must be 2-200 characters"),
];
