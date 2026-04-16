import type { Response } from "express";
import type { AuthRequest } from "../type/types.ts";
import SearchHistory from "../models/SearchHistory.ts";

export const getSearchHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const history = await SearchHistory.find({ userId: req.user?._id ?? null})
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteHistory = async(req:AuthRequest , res:Response)=>{
    try {
    
    const {id} = req.params ;
        
    const entry = await SearchHistory.findOne({
        _id: id ?? null,
        userId: req.user?._id ?? null,
      });

      if (!entry) {
        res.status(404).json({ message: "History entry not found" });
        return;
      }
      res.status(200).json({
        message : "deleted succefully"
      })
    } catch (error) {
         res.status(500).json({ message: (error as Error).message });
    }
} 

