import React, { useState, useEffect } from 'react';
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
  CardContent
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

// Stat card component for displaying statistics
const StatCard = ({ title, value, icon }) => (
  <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        {icon && (
          <Box sx={{ color: 'primary.main' }}>
            {icon}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

const GovernmentDashboard = () => {
  const [ngos, setNgos] = useState([]);
  const [stats, setStats] = useState({
    totalNGOs: 0,
    pendingApprovals: 0,
    totalVolunteers: 0,
    activeProjects: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch NGO data and calculate statistics
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ngos');
      const { ngos, totalVolunteers, activeProjects } = response.data;
      
      setNgos(ngos);
      setStats({
        totalNGOs: ngos.length,
        pendingApprovals: ngos.filter(ngo => ngo.approvalStatus === 'Pending').length,
        totalVolunteers,
        activeProjects
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle NGO approval/rejection
  const handleUpdateNGOStatus = async (ngoId, status) => {
    try {
      await axios.patch(`/api/ngos/${ngoId}/status`, { status });
      setSuccess(`NGO ${status.toLowerCase()} successfully`);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status.toLowerCase()} NGO`);
    }
  };

  // Filter NGOs based on search term
  const filteredNGOs = ngos.filter(ngo => 
    ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome, Government Official
        </Typography>
        <Typography color="textSecondary">
          Manage and oversee NGO registrations and activities
        </Typography>
      </Box>

      {/* Statistics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total NGOs" value={stats.totalNGOs} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Volunteers" value={stats.totalVolunteers} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Projects" value={stats.activeProjects} />
        </Grid>
      </Grid>

      {/* NGO Management Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">NGO Management</Typography>
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              placeholder="Search NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
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
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNGOs.map((ngo) => (
                  <TableRow key={ngo._id}>
                    <TableCell>{ngo.name}</TableCell>
                    <TableCell>{ngo.email}</TableCell>
                    <TableCell>
                      {new Date(ngo.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{ngo.approvalStatus}</TableCell>
                    <TableCell>
                      {ngo.approvalStatus === 'Pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateNGOStatus(ngo._id, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleUpdateNGOStatus(ngo._id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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

export default GovernmentDashboard; 