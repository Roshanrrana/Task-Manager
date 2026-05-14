const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    // Members only see their own stats
    if (req.user.role === 'member') {
      projectQuery = { members: req.user._id };
      taskQuery = { assignedTo: req.user._id };
    }

    // Project stats
    const totalProjects = await Project.countDocuments(projectQuery);
    const activeProjects = await Project.countDocuments({ ...projectQuery, status: 'active' });
    const completedProjects = await Project.countDocuments({ ...projectQuery, status: 'completed' });

    // Task stats
    const totalTasks = await Task.countDocuments(taskQuery);
    const todoTasks = await Task.countDocuments({ ...taskQuery, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    // Task status distribution for pie chart
    const taskStatusDistribution = [
      { name: 'Todo', value: todoTasks, color: '#6366f1' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    // Task priority distribution
    const highPriority = await Task.countDocuments({ ...taskQuery, priority: 'high' });
    const mediumPriority = await Task.countDocuments({ ...taskQuery, priority: 'medium' });
    const lowPriority = await Task.countDocuments({ ...taskQuery, priority: 'low' });

    const taskPriorityDistribution = [
      { name: 'High', value: highPriority, color: '#ef4444' },
      { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
      { name: 'Low', value: lowPriority, color: '#10b981' },
    ];

    // Weekly progress - tasks completed in the last 7 days
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const completed = await Task.countDocuments({
        ...taskQuery,
        status: 'completed',
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      weeklyProgress.push({
        day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        date: startOfDay.toISOString().split('T')[0],
        completed,
      });
    }

    // Team members count
    const totalMembers = await User.countDocuments();

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming deadlines
    const upcomingDeadlines = await Task.find({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() },
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      taskStatusDistribution,
      taskPriorityDistribution,
      weeklyProgress,
      totalMembers,
      recentTasks,
      upcomingDeadlines,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
