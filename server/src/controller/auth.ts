import type { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import User from "../models/User..model.ts";
import type { AuthRequest } from "../type/types.ts";

const generateJwt = (id: string) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    // console.log(req.body)
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const user = await User.create({ name, email, password });
    if (!user) {
      return res
        .status(400)
        .json({ Message: "cannot be register something went worng" });
    }
    const token = generateJwt(user._id.toHexString());
    res.status(201).json({
      message: "user register succefully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    res.json({
      token: generateJwt(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
// getProfile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id)
      .select("-password")
      .populate("searchHistory");
    if (!user) {
      res.status(400).json({
        message: "user not found or token is expire",
      });
    }
    res.status(200).json({
      message: "user profile detail",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
