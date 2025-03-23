const express = require('express');
const router = express.Router();
const Ngo = require('../models/Ngo');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all NGOs (Government only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is government
    if (req.user.userType !== 'Government') {
      return res.status(403).json({ message: 'Access denied. Government officials only.' });
    }

    const ngos = await User.find({ userType: 'NGO' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get total volunteers and active projects
    const totalVolunteers = await User.countDocuments({ userType: 'Volunteer' });
    const activeProjects = 0; // You'll need to implement this based on your Project model

    res.json({
      ngos,
      totalVolunteers,
      activeProjects
    });
  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get NGO by ID
router.get('/:id', async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new NGO
router.post('/', async (req, res) => {
  const ngo = new Ngo({
    name: req.body.name,
    email: req.body.email,
    registrationNumber: req.body.registrationNumber,
    description: req.body.description,
    address: req.body.address,
    contactPerson: req.body.contactPerson,
    documents: req.body.documents
  });

  try {
    const newNgo = await ngo.save();
    res.status(201).json(newNgo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update NGO approval status (Government only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // Check if user is government
    if (req.user.userType !== 'Government') {
      return res.status(403).json({ message: 'Access denied. Government officials only.' });
    }

    const ngo = await User.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    if (ngo.userType !== 'NGO') {
      return res.status(400).json({ message: 'User is not an NGO' });
    }

    ngo.approvalStatus = req.body.status;
    ngo.isApproved = req.body.status === 'Approved';
    await ngo.save();

    res.json({ message: 'NGO status updated successfully' });
  } catch (error) {
    console.error('Update NGO status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update NGO
router.patch('/:id', async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        ngo[key] = req.body[key];
      }
    });

    const updatedNgo = await ngo.save();
    res.json(updatedNgo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete NGO
router.delete('/:id', async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    
    await ngo.remove();
    res.json({ message: 'NGO deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 