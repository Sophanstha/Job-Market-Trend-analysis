import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../type/types.ts";
import jwt from "jsonwebtoken";
import User from "../models/User..model.ts";
interface JwtPayload {
  id: string;
}

const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
  try {
    const token = authHeader.split(" ")[1] ;
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
    ) 
    if (typeof decoded === "string" || !("id" in decoded)) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch {
    // Invalid token — just skip, do not block
  }

  next();
};


export default protect
// optional Auth 

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return;
  }
  next();
};