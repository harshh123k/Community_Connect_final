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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';

const VolunteerApprovals = () => {
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ngo/pending-volunteers');
      setPendingVolunteers(response.data.volunteers);
    } catch (error) {
      setError('Failed to fetch pending volunteer registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVolunteers();
  }, []);

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setViewDetailsOpen(true);
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/api/ngo/approve-volunteer/${selectedVolunteer.id}`);
      setSuccess('Volunteer registration approved successfully');
      fetchPendingVolunteers();
      setApprovalDialogOpen(false);
      setViewDetailsOpen(false);
    } catch (error) {
      setError('Failed to approve volunteer registration');
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/api/ngo/reject-volunteer/${selectedVolunteer.id}`, {
        reason: rejectionReason
      });
      setSuccess('Volunteer registration rejected');
      fetchPendingVolunteers();
      setRejectionDialogOpen(false);
      setViewDetailsOpen(false);
      setRejectionReason('');
    } catch (error) {
      setError('Failed to reject volunteer registration');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Volunteer Registration Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage volunteer registration requests
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

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NAME</TableCell>
                <TableCell>EMAIL</TableCell>
                <TableCell>PHONE</TableCell>
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
              ) : pendingVolunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending volunteer registrations
                  </TableCell>
                </TableRow>
              ) : (
                pendingVolunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell>{volunteer.fullName}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.phone}</TableCell>
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
                          onClick={() => handleViewDetails(volunteer)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => {
                            setSelectedVolunteer(volunteer);
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
                            setSelectedVolunteer(volunteer);
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

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Volunteer Details</DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Full Name</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedVolunteer.fullName}</Typography>

              <Typography variant="subtitle2" gutterBottom>Email</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedVolunteer.email}</Typography>

              <Typography variant="subtitle2" gutterBottom>Phone</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedVolunteer.phone}</Typography>

              <Typography variant="subtitle2" gutterBottom>Address</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedVolunteer.address}</Typography>

              <Typography variant="subtitle2" gutterBottom>Areas of Interest</Typography>
              <List dense sx={{ mb: 2 }}>
                {selectedVolunteer.areasOfInterest.map((area, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={area} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle2" gutterBottom>Skills</Typography>
              <List dense>
                {selectedVolunteer.skills.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={skill} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
      >
        <DialogTitle>Approve Volunteer Registration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this volunteer registration? They will be notified and can start participating in projects.
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
        <DialogTitle>Reject Volunteer Registration</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this volunteer registration.
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

export default VolunteerApprovals; 