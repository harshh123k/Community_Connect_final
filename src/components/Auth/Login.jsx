import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Business,
  AccountBalance
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { url } from '../../Global/URL';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/auth/login`, formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        // Redirect based on user type
        switch (response.data.user.userType.toLowerCase()) {
          case 'ngo':
            navigate('/ngo/dashboard');
            break;
          case 'government':
            navigate('/government/dashboard');
            break;
          case 'volunteer':
            navigate('/volunteer/dashboard');
            break;
          default:
            navigate('/login');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterClick = (userType) => {
    navigate('/register', { state: { userType: userType.toLowerCase() } });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3
      }}
    >
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              width: '100%'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <Typography
                component="div"
                sx={{
                  color: '#dc3545',
                  fontSize: '3rem',
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                ❤️
              </Typography>
            </motion.div>

            <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to continue making a difference in your community
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#dc3545',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc3545',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc3545',
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#dc3545',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc3545',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc3545',
                  },
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1,
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      sx={{
                        color: '#dc3545',
                        '&.Mui-checked': {
                          color: '#dc3545',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">Remember me</Typography>
                  }
                />
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#dc3545',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  bgcolor: '#dc3545',
                  '&:hover': {
                    bgcolor: '#c82333',
                  },
                  '&:disabled': {
                    bgcolor: '#e4606d',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            <Divider sx={{ width: '100%', my: 4 }} />

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              New to our platform? Join as:
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              maxWidth: 400
            }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Person />}
                onClick={() => handleRegisterClick('volunteer')}
                sx={{
                  py: 1.5,
                  color: '#198754',
                  borderColor: '#198754',
                  '&:hover': {
                    borderColor: '#198754',
                    bgcolor: 'rgba(25, 135, 84, 0.04)'
                  }
                }}
              >
                Volunteer
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Business />}
                onClick={() => handleRegisterClick('ngo')}
                sx={{
                  py: 1.5,
                  color: '#0d6efd',
                  borderColor: '#0d6efd',
                  '&:hover': {
                    borderColor: '#0d6efd',
                    bgcolor: 'rgba(13, 110, 253, 0.04)'
                  }
                }}
              >
                NGO
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AccountBalance />}
                onClick={() => handleRegisterClick('government')}
                sx={{
                  py: 1.5,
                  color: '#6f42c1',
                  borderColor: '#6f42c1',
                  '&:hover': {
                    borderColor: '#6f42c1',
                    bgcolor: 'rgba(111, 66, 193, 0.04)'
                  }
                }}
              >
                Government
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login; 