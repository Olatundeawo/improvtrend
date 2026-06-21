import { getUserXpSummary, assertLevel } from "../services/xp.service.js";

// export async function getXpSummary(req, res) {
//   try {
//     const { userId } = req.params;
//     const summary = await getUserXpSummary(userId);
//     res.json({ success: true, data: summary });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// }
export async function getXpSummary(req, res, next) {
  try {
    const summary = await getUserXpSummary(req.user.id);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getXpHistory(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.xpTransaction.findMany({
        where:   { userId },
        orderBy: { createdAt: "desc" },
        skip:    Number(skip),
        take:    Number(limit),
      }),
      prisma.xpTransaction.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: { transactions, total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function checkAction(req, res, next) {
  try {
    await assertLevel(req.user.id, req.params.action);
    res.json({ success: true, allowed: true });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ success: false, allowed: false, message: err.message });
    }
    next(err);
  }
}