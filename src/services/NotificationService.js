import axios from 'axios';

export const sendApprovalNotification = async (userId, userType, isApproved, rejectionReason = '') => {
  try {
    await axios.post('/api/notifications/send', {
      userId,
      userType,
      type: isApproved ? 'APPROVAL' : 'REJECTION',
      message: isApproved
        ? `Your ${userType} registration has been approved. You can now log in to your account.`
        : `Your ${userType} registration has been rejected. Reason: ${rejectionReason}`,
      metadata: {
        isApproved,
        rejectionReason: rejectionReason || undefined
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

export const fetchNotifications = async (userId) => {
  try {
    const response = await axios.get(`/api/notifications/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await axios.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const subscribeToNotifications = async (userId) => {
  try {
    await axios.post('/api/notifications/subscribe', {
      userId,
      endpoint: window.location.origin
    });
  } catch (error) {
    console.error('Failed to subscribe to notifications:', error);
    throw error;
  }
};

export const getNotificationPreferences = async (userId) => {
  try {
    const response = await axios.get(`/api/notifications/${userId}/preferences`);
    return response.data;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    await axios.put(`/api/notifications/${userId}/preferences`, preferences);
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
}; 