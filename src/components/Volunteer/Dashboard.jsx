import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Work,
  CheckCircle,
  TrendingUp,
  Group,
  Person,
  Business,
  CalendarToday,
  LocationOn,
  Favorite,
  Assignment,
} from '@mui/icons-material';
import axios from 'axios';
import { url } from '../../Global/URL';

const Dashboard = () => {
  const [volunteerData, setVolunteerData] = useState(null);
  const [projects, setProjects] = useState({
    active: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = localStorage.getItem('token');
        console.log('User Info from localStorage:', userInfo);
        console.log('Token:', token);
        
        if (!userInfo || !userInfo._id || !token) {
          console.error('Missing user info or token');
          throw new Error('Please login to view your dashboard');
        }

        console.log('Fetching volunteer data...');
        const response = await axios.get(`${url}/api/volunteers/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          setVolunteerData(response.data.volunteer);
          // Separate projects into active and completed
          const activeProjs = response.data.projects?.filter(p => p.status === 'Open') || [];
          const completedProjs = response.data.projects?.filter(p => p.status === 'Completed') || [];
          console.log('Active Projects:', activeProjs);
          console.log('Completed Projects:', completedProjs);
          setProjects({
            active: activeProjs,
            completed: completedProjs
          });
        } else {
          console.error('API returned success: false', response.data);
          setError(response.data.message || 'Failed to fetch volunteer data');
        }
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        if (err.response?.status === 401) {
          setError('Please login again to view your dashboard');
        } else {
          setError(err.message || 'Failed to fetch volunteer data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        {/* Project Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Assignment color="primary" />
                    <Typography variant="h6">Active Projects</Typography>
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h3" color="primary">
                    {projects.active.length}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(projects.active.length / (projects.active.length + projects.completed.length)) * 100}
                    color="primary"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle color="success" />
                    <Typography variant="h6">Completed Projects</Typography>
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h3" color="success.main">
                    {projects.completed.length}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(projects.completed.length / (projects.active.length + projects.completed.length)) * 100}
                    color="success"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Profile Section */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} alignItems="center">
                <Person color="primary" />
                <Typography variant="h6">Profile Information</Typography>
              </Stack>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography>{volunteerData?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography>{volunteerData?.email}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography>{volunteerData?.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography>{volunteerData?.address}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} alignItems="center">
                <Assignment color="primary" />
                <Typography variant="h6">My Projects</Typography>
              </Stack>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>NGO</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...projects.active, ...projects.completed].length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No projects found</TableCell>
                    </TableRow>
                  ) : (
                    [...projects.active, ...projects.completed].map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.ngo?.name}</TableCell>
                        <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.isCompleted ? 'Completed' : 'Active'}
                            color={project.isCompleted ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* NGO Information */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} alignItems="center">
                <Business color="primary" />
                <Typography variant="h6">NGO Information</Typography>
              </Stack>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Organization</Typography>
                  <Typography>{volunteerData?.ngo?.name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={volunteerData?.isApproved ? 'Approved' : 'Pending Approval'}
                    color={volunteerData?.isApproved ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Skills and Interests */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} alignItems="center">
                <Favorite color="primary" />
                <Typography variant="h6">Skills & Interests</Typography>
              </Stack>
            }
          />
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {volunteerData?.skills?.map((skill, index) => (
                    <Chip key={index} label={skill} color="primary" size="small" />
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Interests
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {volunteerData?.interests?.map((interest, index) => (
                    <Chip key={index} label={interest} color="success" size="small" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader title="Actions" />
          <CardContent>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CalendarToday />}
                color="primary"
              >
                View Schedule
              </Button>
              <Button
                variant="contained"
                startIcon={<LocationOn />}
                color="success"
              >
                View Projects
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default Dashboard; 