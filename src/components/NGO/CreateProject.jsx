import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  FormControl,
  Dialog,
  IconButton,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';

const CreateProject = ({ open, onClose, editProject = null }) => {
  const [formData, setFormData] = useState({
    title: editProject?.title || '',
    description: editProject?.description || '',
    startDate: editProject?.startDate || '',
    endDate: editProject?.endDate || '',
    location: editProject?.location || '',
    maxVolunteers: editProject?.maxVolunteers || '1',
    requiredSkills: editProject?.requiredSkills || 'Education',
    status: editProject?.status || 'Active',
    projectImage: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imagePreview, setImagePreview] = useState(editProject?.imageUrl || '');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.maxVolunteers || formData.maxVolunteers < 1) {
      newErrors.maxVolunteers = 'At least 1 volunteer is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          projectImage: 'Image size should be less than 5MB'
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          projectImage: 'Please upload an image file'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        projectImage: file
      }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({
        ...prev,
        projectImage: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'projectImage' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const endpoint = editProject 
        ? `/api/projects/${editProject.id}`
        : '/api/projects';
      
      const method = editProject ? 'put' : 'post';
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      const response = await axios[method](endpoint, formDataToSend, config);
      
      if (response.status === 201 || response.status === 200) {
        onClose();
        window.location.reload(); // Refresh to show new project
      }
    } catch (error) {
      console.error('Project creation error:', error);
      setSubmitError(error.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '8px',
          p: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {editProject ? 'Edit Project' : 'Create New Project'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Project Title <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            required
            fullWidth
            name="title"
            placeholder="Enter project title"
            value={formData.title}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            error={!!errors.title}
            helperText={errors.title}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Project Image
          </Typography>
          <Box
            sx={{
              border: '2px dashed #E9ECEF',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              bgcolor: '#F8F9FA',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#0D6EFD'
              }
            }}
            onClick={() => document.getElementById('project-image-input').click()}
          >
            {imagePreview ? (
              <Box sx={{ position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Project preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, projectImage: null }));
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload project image
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Maximum size: 5MB
                </Typography>
              </>
            )}
            <input
              type="file"
              id="project-image-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </Box>
          {errors.projectImage && (
            <FormHelperText error>{errors.projectImage}</FormHelperText>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Description <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="description"
            placeholder="Enter project description"
            value={formData.description}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            error={!!errors.description}
            helperText={errors.description}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Start Date <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              required
              fullWidth
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  '& fieldset': {
                    borderColor: '#E9ECEF',
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              End Date <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              required
              fullWidth
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  '& fieldset': {
                    borderColor: '#E9ECEF',
                  }
                }
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Location <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            required
            fullWidth
            name="location"
            placeholder="Enter project location"
            value={formData.location}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            error={!!errors.location}
            helperText={errors.location}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Maximum Volunteers <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            required
            fullWidth
            type="number"
            name="maxVolunteers"
            placeholder="Enter maximum number of volunteers"
            value={formData.maxVolunteers}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            error={!!errors.maxVolunteers}
            helperText={errors.maxVolunteers}
            InputProps={{
              inputProps: { min: 1 }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Required Skills <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            select
            fullWidth
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          >
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Healthcare">Healthcare</MenuItem>
            <MenuItem value="Environment">Environment</MenuItem>
            <MenuItem value="Social Work">Social Work</MenuItem>
            <MenuItem value="Technology">Technology</MenuItem>
            <MenuItem value="Arts & Culture">Arts & Culture</MenuItem>
            <MenuItem value="Sports & Recreation">Sports & Recreation</MenuItem>
            <MenuItem value="Animal Welfare">Animal Welfare</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Status <Typography component="span" color="error">*</Typography>
          </Typography>
          <TextField
            select
            fullWidth
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                }
              }
            }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#0D6EFD',
            '&:hover': {
              bgcolor: '#0B5ED7'
            },
            textTransform: 'none',
            py: 1.5
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            editProject ? 'Update Project' : 'Create Project'
          )}
        </Button>
      </Box>
    </Dialog>
  );
};

export default CreateProject; 