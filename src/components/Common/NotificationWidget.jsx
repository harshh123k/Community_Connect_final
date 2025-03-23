import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Button,
  Chip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Campaign as CampaignIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead } from '../../services/NotificationService';

const NotificationWidget = ({ userId, limit = 5 }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAndUpdateNotifications = async () => {
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data.slice(0, limit));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndUpdateNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchAndUpdateNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, limit]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    // Navigate based on notification type
    if (notification.type === 'APPROVAL') {
      navigate('/dashboard');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPROVAL':
        return <CheckIcon color="success" />;
      case 'REJECTION':
        return <CloseIcon color="error" />;
      case 'EMAIL':
        return <EmailIcon color="primary" />;
      default:
        return <CampaignIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'APPROVAL':
        return 'success';
      case 'REJECTION':
        return 'error';
      case 'EMAIL':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Notifications</Typography>
        <IconButton size="small" onClick={() => navigate('/notifications')}>
          <MoreHorizIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary">No notifications</Typography>
        </Box>
      ) : (
        <>
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap>
                        {notification.message}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color={getNotificationColor(notification.type)}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          {notifications.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                size="small"
                onClick={() => navigate('/notifications')}
                endIcon={<MoreHorizIcon />}
              >
                View All
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default NotificationWidget; 