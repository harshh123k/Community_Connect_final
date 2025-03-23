const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['Volunteer', 'NGO', 'Government']
  },
  // Common fields for all user types
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  
  // NGO specific fields
  organizationName: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Government specific fields
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number
  },
  
  // Volunteer specific fields
  skills: [{
    type: String,
    trim: true
  }],
  areasOfInterest: [{
    type: String,
    trim: true
  }],
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Approval status
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 