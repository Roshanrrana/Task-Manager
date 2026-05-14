const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin)
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, status } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        res.status(400);
        throw new Error('Assigned user not found');
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || undefined,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks (with filters)
// @route   GET /api/tasks?project=xxx&status=xxx&assignedTo=xxx
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let query = {};

    // Filter by project
    if (req.query.project) {
      query.project = req.query.project;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Members can only see tasks assigned to them
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Members can only view their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this task');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Members can only update their own task's status
    if (req.user.role === 'member') {
      if (
        !task.assignedTo ||
        task.assignedTo.toString() !== req.user._id.toString()
      ) {
        res.status(403);
        throw new Error('Not authorized to update this task');
      }
      // Members can only change status
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // Admin can update all fields
      if (req.body.assignedTo) {
        const assignee = await User.findById(req.body.assignedTo);
        if (!assignee) {
          res.status(400);
          throw new Error('Assigned user not found');
        }
      }
      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
      task.priority = req.body.priority || task.priority;
      task.status = req.body.status || task.status;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.project = req.body.project || task.project;
    }

    const updatedTask = await task.save();
    const populated = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
