import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

// Stat card component for displaying statistics
const StatCard = ({ title, value, icon }) => (
  <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
    <CardContent>
      <Stack spacing={1}>
        <Typography color="textSecondary" variant="body2">
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </Stack>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalVolunteers: 0,
    pendingApprovals: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo || !userInfo._id) {
        throw new Error('User information not found or invalid');
      }

      // Fetch projects
      const projectsResponse = await axios.get(`/api/projects/ngo/${userInfo._id}`);
      setProjects(projectsResponse.data.projects || []);

      // Fetch volunteers
      const volunteersResponse = await axios.get(`/api/volunteers/ngo/${userInfo._id}`);
      setVolunteers(volunteersResponse.data.volunteers || []);

      // Update statistics
      setStats({
        totalProjects: projectsResponse.data.projects?.length || 0,
        activeProjects: projectsResponse.data.projects?.filter(p => p.status === 'active').length || 0,
        totalVolunteers: volunteersResponse.data.volunteers?.length || 0,
        pendingApprovals: volunteersResponse.data.volunteers?.filter(v => v.status === 'pending').length || 0
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = () => {
    navigate('/ngo/projects/create');
  };

  const handleEditProject = (projectId) => {
    navigate(`/ngo/projects/edit/${projectId}`);
  };

  const handleApproveVolunteer = async (volunteerId) => {
    try {
      await axios.patch(`/api/volunteers/${volunteerId}/approve`);
      setSuccess('Volunteer approved successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve volunteer');
    }
  };

  const handleRejectVolunteer = async (volunteerId) => {
    try {
      await axios.patch(`/api/volunteers/${volunteerId}/reject`);
      setSuccess('Volunteer rejected successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject volunteer');
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your NGO Dashboard
        </Typography>
        <Typography color="textSecondary">
          Manage your projects, volunteers, and track your impact from one central location.
        </Typography>
      </Paper>

      {/* Statistics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Projects" value={stats.totalProjects} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Projects" value={stats.activeProjects} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Volunteers" value={stats.totalVolunteers} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} />
        </Grid>
      </Grid>

      {/* Projects Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Your Projects</Typography>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              Create New Project
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No projects found</TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project._id}>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status === 'completed' ? 'Completed' : 'Active'}
                          color={project.status === 'completed' ? 'success' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{project.progress || 0}%</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Project">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditProject(project._id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Volunteer Applications Section */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Volunteer Applications</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {volunteers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No volunteer applications</TableCell>
                  </TableRow>
                ) : (
                  volunteers.map((volunteer) => (
                    <TableRow key={volunteer._id}>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {volunteer.skills?.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={volunteer.isApproved ? 'Approved' : 'Pending'}
                          color={volunteer.isApproved ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {!volunteer.isApproved && (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() => handleApproveVolunteer(volunteer._id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() => handleRejectVolunteer(volunteer._id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 