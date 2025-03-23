const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      startDate,
      endDate,
      location,
      maxVolunteers,
      requiredSkills,
      status
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !location || !maxVolunteers) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Create new project
    const project = new Project({
      title,
      description,
      image,
      startDate,
      endDate,
      location,
      maxVolunteers,
      requiredSkills: requiredSkills || [],
      status: status || 'Open',
      ngoId: req.user._id
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('ngoId', 'name organizationName')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ngoId', 'name organizationName')
      .populate('volunteers', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the NGO that created the project
    if (project.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the NGO that created the project
    if (project.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.remove();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Apply for a project
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is open
    if (project.status !== 'Open') {
      return res.status(400).json({ message: 'Project is not accepting volunteers' });
    }

    // Check if user already applied
    if (project.volunteers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already applied to this project' });
    }

    // Check if project is full
    if (project.currentVolunteers >= project.maxVolunteers) {
      return res.status(400).json({ message: 'Project has reached maximum volunteers' });
    }

    project.volunteers.push(req.user._id);
    project.currentVolunteers += 1;
    
    if (project.currentVolunteers === project.maxVolunteers) {
      project.status = 'Closed';
    }

    await project.save();
    res.json({ message: 'Successfully applied to project' });
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({ message: 'Failed to apply to project' });
  }
});

module.exports = router; 