import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import PrivateRoute from './components/Auth/PrivateRoute';
import NGO from './components/NGO/Dashboard';
import Government from './components/Government/GovernmentDashboard';
import Volunteer from './components/Volunteer/Dashboard';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Protected Routes */}
            <Route
              path="/ngo/dashboard"
              element={
                <PrivateRoute allowedRoles={['NGO']}>
                  <NGO />
                </PrivateRoute>
              }
            />
            <Route
              path="/government/dashboard"
              element={
                <PrivateRoute allowedRoles={['Government']}>
                  <Government />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer/dashboard"
              element={
                <PrivateRoute allowedRoles={['Volunteer']}>
                  <Volunteer />
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 