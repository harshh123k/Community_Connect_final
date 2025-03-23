const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get volunteer profile and projects
router.get('/profile', auth, async (req, res) => {
  try {
    const volunteer = await User.findById(req.user._id).select('-password');
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Get all projects where the volunteer is participating
    const projects = await Project.find({
      volunteers: req.user._id
    }).populate('ngoId', 'name organizationName');

    // Calculate statistics
    const activeProjects = projects.filter(p => p.status === 'Open');
    const completedProjects = projects.filter(p => p.status === 'Completed');
    
    // Calculate total hours (assuming 8 hours per day)
    const totalHours = completedProjects.reduce((total, project) => {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      return total + (days * 8);
    }, 0);

    // Calculate impact score (based on completed projects)
    const impactScore = completedProjects.length * 10;

    res.json({
      success: true,
      volunteer: {
        ...volunteer.toObject(),
        totalHours,
        impactScore
      },
      projects: projects.map(project => ({
        ...project.toObject(),
        ngo: project.ngoId, // Map ngoId to ngo for frontend compatibility
        status: project.status === 'Open' ? 'Active' : project.status
      }))
    });
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Leave a project
router.post('/projects/:projectId/leave', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Remove volunteer from project
    project.volunteers = project.volunteers.filter(
      v => v.toString() !== req.user._id.toString()
    );
    project.currentVolunteers = project.volunteers.length;

    await project.save();

    res.json({ success: true, message: 'Successfully left the project' });
  } catch (error) {
    console.error('Error leaving project:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 