import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/NotificationService';

const NotificationPreferences = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    email: {
      approval: true,
      rejection: true,
      projectUpdates: true,
      volunteerUpdates: true,
      securityAlerts: true
    },
    push: {
      approval: true,
      rejection: true,
      projectUpdates: true,
      volunteerUpdates: true,
      securityAlerts: true
    },
    inApp: {
      approval: true,
      rejection: true,
      projectUpdates: true,
      volunteerUpdates: true,
      securityAlerts: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const data = await getNotificationPreferences(userId);
      setPreferences(data);
    } catch (error) {
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (channel, type) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await updateNotificationPreferences(userId, preferences);
      setSuccess('Notification preferences updated successfully');
    } catch (error) {
      setError('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const NotificationSection = ({ title, icon, channel }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={preferences[channel].approval}
              onChange={() => handleToggle(channel, 'approval')}
            />
          }
          label="Registration Approval Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences[channel].rejection}
              onChange={() => handleToggle(channel, 'rejection')}
            />
          }
          label="Registration Rejection Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences[channel].projectUpdates}
              onChange={() => handleToggle(channel, 'projectUpdates')}
            />
          }
          label="Project Updates"
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences[channel].volunteerUpdates}
              onChange={() => handleToggle(channel, 'volunteerUpdates')}
            />
          }
          label="Volunteer Updates"
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences[channel].securityAlerts}
              onChange={() => handleToggle(channel, 'securityAlerts')}
            />
          }
          label="Security Alerts"
        />
      </FormGroup>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notification Preferences
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage how and when you receive notifications
      </Typography>

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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NotificationSection
            title="Email Notifications"
            icon={<EmailIcon color="primary" />}
            channel="email"
          />
        </Grid>
        <Grid item xs={12}>
          <NotificationSection
            title="Push Notifications"
            icon={<NotificationsIcon color="primary" />}
            channel="push"
          />
        </Grid>
        <Grid item xs={12}>
          <NotificationSection
            title="In-App Notifications"
            icon={<CampaignIcon color="primary" />}
            channel="inApp"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Container>
  );
};

export default NotificationPreferences; 