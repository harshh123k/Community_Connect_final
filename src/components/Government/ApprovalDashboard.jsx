import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import { sendApprovalNotification } from '../../services/NotificationService';

const ApprovalDashboard = () => {
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalPending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });

  const fetchPendingNGOs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/government/pending-ngos');
      setPendingNGOs(response.data.ngos);
    } catch (error) {
      setError('Failed to fetch pending NGO registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/government/approval-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = (ngo) => {
    setSelectedNGO(ngo);
    setViewDetailsOpen(true);
  };

  const validateNGO = (ngo) => {
    const errors = [];
    
    if (!ngo.registrationNumber.match(/^[A-Z]{2}\d{6}$/)) {
      errors.push('Invalid registration number format');
    }
    
    if (!ngo.email.endsWith('.org') && !ngo.email.endsWith('.ngo')) {
      errors.push('Email domain should be .org or .ngo');
    }
    
    if (!ngo.phone.match(/^\d{10}$/)) {
      errors.push('Invalid phone number');
    }
    
    if (ngo.description.length < 100) {
      errors.push('Description should be at least 100 characters');
    }
    
    return errors;
  };

  const handleApprove = async () => {
    const validationErrors = validateNGO(selectedNGO);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      await axios.post(`/api/government/approve-ngo/${selectedNGO.id}`);
      await sendApprovalNotification(selectedNGO.id, 'NGO', true);
      setSuccess('NGO registration approved successfully');
      fetchPendingNGOs();
      fetchStats();
      setApprovalDialogOpen(false);
      setViewDetailsOpen(false);
    } catch (error) {
      setError('Failed to approve NGO registration');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.length < 20) {
      setError('Please provide a detailed reason for rejection (minimum 20 characters)');
      return;
    }

    try {
      await axios.post(`/api/government/reject-ngo/${selectedNGO.id}`, {
        reason: rejectionReason
      });
      await sendApprovalNotification(selectedNGO.id, 'NGO', false, rejectionReason);
      setSuccess('NGO registration rejected');
      fetchPendingNGOs();
      fetchStats();
      setRejectionDialogOpen(false);
      setViewDetailsOpen(false);
      setRejectionReason('');
    } catch (error) {
      setError('Failed to reject NGO registration');
    }
  };

  useEffect(() => {
    fetchPendingNGOs();
    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          NGO Registration Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage NGO registration requests
        </Typography>
      </Box>

      {(error || success) && (
        <Alert 
          severity={error ? "error" : "success"} 
          sx={{ mb: 3 }}
          onClose={() => {
            setError('');
            setSuccess('');
          }}
        >
          {error || success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h4">
                {stats.totalPending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Today
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {stats.approvedToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected Today
              </Typography>
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                {stats.rejectedToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NGO NAME</TableCell>
                <TableCell>REGISTRATION NUMBER</TableCell>
                <TableCell>EMAIL</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : pendingNGOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending NGO registrations
                  </TableCell>
                </TableRow>
              ) : (
                pendingNGOs.map((ngo) => (
                  <TableRow key={ngo.id}>
                    <TableCell>{ngo.ngoName}</TableCell>
                    <TableCell>{ngo.registrationNumber}</TableCell>
                    <TableCell>{ngo.email}</TableCell>
                    <TableCell>
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          bgcolor: '#FFF3CD',
                          color: '#997404',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(ngo)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => {
                            setSelectedNGO(ngo);
                            setApprovalDialogOpen(true);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => {
                            setSelectedNGO(ngo);
                            setRejectionDialogOpen(true);
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Enhanced View Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1 }} />
            NGO Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNGO && (
            <Grid container spacing={3} sx={{ pt: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    NGO Name
                  </Typography>
                  <Typography variant="body1">{selectedNGO.ngoName}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedNGO.email}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Phone
                  </Typography>
                  <Typography variant="body1">{selectedNGO.phone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Registration Number
                  </Typography>
                  <Typography variant="body1">{selectedNGO.registrationNumber}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1">{selectedNGO.address}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">{selectedNGO.ngoDescription}</Typography>
                  </Paper>
                </Box>
              </Grid>

              {validateNGO(selectedNGO).length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Validation Warnings:
                    </Typography>
                    <ul>
                      {validateNGO(selectedNGO).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              setViewDetailsOpen(false);
              setApprovalDialogOpen(true);
            }}
            disabled={validateNGO(selectedNGO).length > 0}
          >
            Proceed to Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
      >
        <DialogTitle>Approve NGO Registration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this NGO registration? This will grant them access to the NGO dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
      >
        <DialogTitle>Reject NGO Registration</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this NGO registration.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalDashboard; 