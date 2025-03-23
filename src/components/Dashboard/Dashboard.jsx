import React from 'react';
import { Box, Container, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { Assignment, CheckCircle, Person, Business } from '@mui/icons-material';

const Dashboard = () => {
  const profileData = {
    name: 'Raghav biswas',
    email: 'harshwardhanpsingh123@gmail.com',
    phone: '9999999999',
    address: 'mumbai'
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Active Projects */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment sx={{ mr: 1 }} />
                <Typography variant="h6">Active Projects</Typography>
              </Box>
              <Typography variant="h2" sx={{ color: '#1976d2' }}>0</Typography>
              <Box sx={{ mt: 1, width: '100%', height: 4, bgcolor: '#1976d2' }} />
            </Paper>
          </Grid>

          {/* Completed Projects */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="h6">Completed Projects</Typography>
              </Box>
              <Typography variant="h2" sx={{ color: '#2e7d32' }}>0</Typography>
              <Box sx={{ mt: 1, width: '100%', height: 4, bgcolor: '#2e7d32' }} />
            </Paper>
          </Grid>
        </Grid>

        {/* Profile Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Person sx={{ mr: 1 }} />
            <Typography variant="h6">Profile Information</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography>{profileData.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography>{profileData.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{profileData.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography>{profileData.address}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* My Projects */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Assignment sx={{ mr: 1 }} />
            <Typography variant="h6">My Projects</Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PROJECT NAME</TableCell>
                <TableCell>NGO</TableCell>
                <TableCell>START DATE</TableCell>
                <TableCell>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* NGO Information */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Business sx={{ mr: 1 }} />
            <Typography variant="h6">NGO Information</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Organization</Typography>
              <Typography>-</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip label="APPROVED" color="success" size="small" />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 