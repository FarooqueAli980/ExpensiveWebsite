import Project from "../models/Project.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const createWeekGroups = (start, end) => {
  const weeks = [];
  const msPerDay = 24 * 60 * 60 * 1000;
  let cursor = new Date(start);
  let index = 1;

  while (cursor <= end) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor.getTime() + 6 * msPerDay);
    if (weekEnd > end) weekEnd.setTime(end.getTime());

    weeks.push({
      weekIndex: index,
      label: `Week ${index}`,
      start: weekStart,
      end: weekEnd,
      spent: 0,
      transactionCount: 0,
    });

    cursor.setTime(cursor.getTime() + 7 * msPerDay);
    index += 1;
  }

  return weeks;
};

export const createProject = async (req, res) => {
  try {
    const { name, description, category, startDate, endDate, budget, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Project name is required." });

    const project = await Project.create({
      name,
      description,
      category,
      startDate,
      endDate,
      budget: Number(budget) || 0,
      status: status || "Active",
      user: req.user._id,
    });

    res.status(201).json({ success: true, message: "Project created.", project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectSummary = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const msPerDay = 24 * 60 * 60 * 1000;
    const projectStart = project.startDate ? normalizeDate(project.startDate) : normalizeDate(project.createdAt);
    const projectEndRaw = project.endDate ? new Date(project.endDate) : new Date(projectStart.getTime() + 27 * msPerDay);
    const projectEnd = normalizeDate(projectEndRaw);
    if (projectEnd < projectStart) projectEnd.setTime(projectStart.getTime() + 27 * msPerDay);

    const weeks = createWeekGroups(projectStart, projectEnd);

    const expenses = await Transaction.find({
      user: req.user._id,
      project: project._id,
      type: "Expense",
      date: { $gte: projectStart, $lte: new Date(projectEnd.getTime() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000) },
    })
      .sort({ date: -1 })
      .lean();

    const monthSpending = {};

    expenses.forEach((tx) => {
      const txDate = normalizeDate(tx.date);
      const diffDays = Math.floor((txDate.getTime() - projectStart.getTime()) / msPerDay);
      const weekIndex = Math.min(Math.max(0, Math.floor(diffDays / 7)), weeks.length - 1);
      weeks[weekIndex].spent += Number(tx.amount || 0);
      weeks[weekIndex].transactionCount += 1;

      const key = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`;
      monthSpending[key] = (monthSpending[key] || 0) + Number(tx.amount || 0);
    });

    const budgetRows = await Budget.find({ user: req.user._id, project: project._id }).lean();
    const budgetMap = budgetRows.reduce((map, item) => {
      map[`${item.year}-${item.month}`] = item.amount;
      return map;
    }, {});

    const monthlySummary = [];
    const monthCursor = new Date(projectStart.getFullYear(), projectStart.getMonth(), 1);
    const endMonth = new Date(projectEnd.getFullYear(), projectEnd.getMonth(), 1);

    while (monthCursor <= endMonth) {
      const month = monthCursor.getMonth() + 1;
      const year = monthCursor.getFullYear();
      const key = `${year}-${month}`;
      const budgetAmount = budgetMap[key] || 0;
      const spent = monthSpending[key] || 0;
      const remaining = budgetAmount - spent;
      let status = "No Budget";
      if (budgetAmount > 0) {
        if (remaining < 0) status = "Budget Exceeded";
        else if (remaining <= budgetAmount * 0.2) status = "Near Limit";
        else status = "Within Budget";
      } else if (spent > 0) {
        status = "Overspent";
      }

      monthlySummary.push({
        month,
        year,
        label: monthCursor.toLocaleString("default", { month: "short", year: "numeric" }),
        budget: budgetAmount,
        spent,
        remaining,
        status,
      });

      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalBudget = project.budget || 0;
    const remaining = totalBudget - totalSpent;
    const utilization = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
    const now = normalizeDate(new Date());
    const activeWeek = weeks.find((week) => now >= normalizeDate(week.start) && now <= normalizeDate(week.end));

    const summary = {
      totalBudget,
      totalSpent,
      remaining,
      utilization,
      totalWeeks: weeks.length,
      weeklyTarget: weeks.length > 0 ? Number((totalBudget / weeks.length).toFixed(2)) : 0,
      currentWeek: activeWeek ? activeWeek.label : now < projectStart ? "Upcoming" : "Completed",
      activeWeekIndex: activeWeek?.weekIndex || null,
      transactionCount: expenses.length,
    };

    const recentTransactions = expenses.slice(0, 5);

    res.status(200).json({
      success: true,
      project,
      summary,
      weeks,
      monthlySummary,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, category, startDate, endDate, budget, status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, description, category, startDate, endDate, budget: Number(budget) || 0, status },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.status(200).json({ success: true, message: "Project updated.", project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.status(200).json({ success: true, message: "Project deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
