import JobData from "../models/JobData.model.ts";
import SearchHistory from "../models/SearchHistory.ts";
import User from "../models/User..model.ts";
// import { AuthRequest } from "../type/types";
import type { AuthRequest } from "../type/types.ts";

// ── GET /api/admin/stats ────────────────────────────────────────
export const getAdminStats = async (req:AuthRequest , res: Response): Promise<void> => {
  try {
    const totalUsers    = await User.countDocuments();
    const totalSearches = await SearchHistory.countDocuments();
    const totalCategories = await JobData.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const searchesThisWeek = await SearchHistory.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Registered vs anonymous searches
    const registeredSearches = await SearchHistory.countDocuments({
      userId: { $ne: null },
    });
    const anonymousSearches = totalSearches - registeredSearches;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSearches,
        totalCategories,
        newUsersThisWeek,
        searchesThisWeek,
        registeredSearches,
        anonymousSearches,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── GET /api/admin/users ─────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;

    const users = await User.find({})
      .select("name email role createdAt searchHistory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments();

    const usersWithCount = users.map((u) => ({
      _id:          u._id,
      name:         u.name,
      email:        u.email,
      role:         u.role,
      createdAt:    u.createdAt,
      searchCount:  u.searchHistory?.length ?? 0,
    }));

    res.status(200).json({
      success: true,
      users:   usersWithCount,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── GET /api/admin/searches ──────────────────────────────────────
export const getAllSearches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;

    const searches = await SearchHistory.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = searches.map((s) => ({
      _id:          s._id,
      query:        s.query,
      topResult:    s.topResult,
      resultsCount: s.resultsCount,
      createdAt:    s.createdAt,
      user: s.userId
        ? { name: (s.userId as any).name, email: (s.userId as any).email }
        : { name: "Anonymous", email: null },
    }));

    res.status(200).json({ success: true, searches: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── GET /api/admin/top-categories ────────────────────────────────
export const getTopCategoriesAllTime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await SearchHistory.aggregate([
      { $group: { _id: "$topResult", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const formatted = results.map((r) => ({
      title:       r._id,
      searchCount: r.count,
    }));

    res.status(200).json({ success: true, categories: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};