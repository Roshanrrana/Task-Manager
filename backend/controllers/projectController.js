const Project = require('../models/Project');
const Task = require('../models/Task');
const mongoose = require('mongoose');

const assertDeadlineNotPast = (deadline, res) => {
  if (!deadline) return;
  const deadlineDate = new Date(deadline);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (deadlineDate < startOfToday) {
    res.status(400);
    throw new Error('Deadline cannot be in the past');
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res, next) => {
  try {
    const { title, description, members, deadline, status } = req.body;

    assertDeadlineNotPast(deadline, res);

    const project = await Project.create({
      title,
      description,
      members: members || [],
      createdBy: req.user._id,
      deadline,
      status: status || 'active',
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Project created] "${project.title}" _id=${project._id} -> Mongo host: ${mongoose.connection.host} | database: ${mongoose.connection.name}`
      );
    }

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query = {};

    // Members can only see projects they belong to
    if (req.user.role === 'member') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const { title, description, members, deadline, status } = req.body;

    if (deadline !== undefined) {
      assertDeadlineNotPast(deadline, res);
    }

    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;
    project.members = members || project.members;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project (and its tasks)
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and associated tasks removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Remove members from project
// @route   PUT /api/projects/:id/members
// @access  Private (Admin)
const updateProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const { members } = req.body;

    if (!members || !Array.isArray(members)) {
      res.status(400);
      throw new Error('Members must be an array of user IDs');
    }

    project.members = members;
    const updatedProject = await project.save();

    const populated = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectMembers,
};
