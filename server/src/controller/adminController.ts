import JobData from "../models/JobData.model.ts";
import SearchHistory from "../models/SearchHistory.ts";
import User from "../models/User..model.ts";
// import { AuthRequest } from "../type/types";
import type { AuthRequest } from "../type/types.ts";

// ── GET /api/admin/stats ────────────────────────────────────────
export const getAdminStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
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

    const users = await User.find({ isDeleted: { $ne: true } })
      .select("name email role createdAt searchHistory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });

    const usersWithCount = users.map((u) => ({
      _id:         u._id,
      name:        u.name,
      email:       u.email,
      role:        u.role,
      createdAt:   u.createdAt,
      searchCount: u.searchHistory?.length ?? 0,
    }));

    res.status(200).json({
      success: true,
      users:   usersWithCount,
      pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── GET /api/admin/searches ──────────────────────────────────────
export const getAllSearches = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;

    const searches = await SearchHistory.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = searches.map((s) => ({
      _id: s._id,
      query: s.query,
      topResult: s.topResult,
      resultsCount: s.resultsCount,
      createdAt: s.createdAt,
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
export const getTopCategoriesAllTime = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const results = await SearchHistory.aggregate([
      { $group: { _id: "$topResult", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const formatted = results.map((r) => ({
      title: r._id,
      searchCount: r.count,
    }));

    res.status(200).json({ success: true, categories: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── GET /api/admin/search-trend ──────────────────────────────────
export const getSearchTrend = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today = 30 days total
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const results = await SearchHistory.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a complete 30-day series, filling gaps with 0
    const dateMap = new Map(results.map((r) => [r._id, r.count]));
    const series: { date: string; count: number }[] = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0]!;
      series.push({ date: key, count: dateMap.get(key) ?? 0 });
    }

    res.status(200).json({ success: true, series });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res
        .status(400)
        .json({ message: "A user with this email already exists." });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // pre-save hook hashes it
      role: role === "admin" ? "admin" : "user",
    });

    res.status(201).json({
      success: true,
      message: `${user.email} created successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (emailTaken) {
        res.status(400).json({ message: "This email is already in use." });
        return;
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (role && ["user", "admin"].includes(role)) {
      if (id === req.user?._id.toString() && role !== "admin") {
        res
          .status(400)
          .json({ message: "You cannot remove your own admin role." });
        return;
      }
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.email} updated successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user?._id.toString()) {
      res.status(400).json({ message: "You cannot delete your own account." });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (user.role === "admin") {
      res.status(400).json({ message: "Cannot delete another admin." });
      return;
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res
      .status(200)
      .json({ success: true, message: `${user.email} has been deleted.` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
