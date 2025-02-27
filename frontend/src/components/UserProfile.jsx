import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Person, Favorite, Star, Movie } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, isAuthenticated, token, logout } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [ratedResp, favResp, watchResp] = await Promise.all([
          axios.get('/api/user/rated-movies/', {
            headers: { 'Authorization': `Token ${token}` }
          }),
          axios.get('/api/user/favorites/', {
            headers: { 'Authorization': `Token ${token}` }
          }),
          axios.get('/api/user/watchlist/', {
            headers: { 'Authorization': `Token ${token}` }
          })
        ]);

        setRatedMovies(ratedResp.data);
        setFavoriteMovies(favResp.data);
        setWatchlist(watchResp.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRemoveFromFavorites = async (movieId) => {
    try {
      await axios.delete(`/api/user/favorites/${movieId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      setFavoriteMovies(prevFavorites => 
        prevFavorites.filter(movie => movie.id !== movieId)
      );
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove movie from favorites.');
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await axios.delete(`/api/user/watchlist/${movieId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      setWatchlist(prevWatchlist => 
        prevWatchlist.filter(movie => movie.id !== movieId)
      );
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError('Failed to remove movie from watchlist.');
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await axios.post('/api/user/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setOpenEditModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(
        err.response?.data?.detail || 'Failed to change password. Please try again.'
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please <Link to="/login">log in</Link> to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {user?.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4">{user?.username}</Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => setOpenEditModal(true)}
            >
              Change Password
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              variant="fullWidth"
            >
              <Tab icon={<Star />} label="Rated Movies" />
              <Tab icon={<Favorite />} label="Favorites" />
              <Tab icon={<Movie />} label="Watchlist" />
            </Tabs>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Rated Movies Tab */}
              <TabPanel value={tabValue} index={0}>
                {ratedMovies.length === 0 ? (
                  <Alert severity="info">You haven't rated any movies yet.</Alert>
                ) : (
                  <List>
                    {ratedMovies.map((movie) => (
                      <ListItem 
                        key={movie.id}
                        divider
                        secondaryAction={
                          <Rating 
                            value={movie.user_rating} 
                            readOnly 
                            precision={0.5}
                          />
                        }
                      >
                        <ListItemText 
                          primary={
                            <Link 
                              to={`/movie/${movie.id}`} 
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <Typography variant="body1" color="primary" component="span">
                                {movie.title}
                              </Typography>
                            </Link>
                          }
                          secondary={`${movie.release_year} • ${movie.director}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>
              
              {/* Favorites Tab */}
              <TabPanel value={tabValue} index={1}>
                {favoriteMovies.length === 0 ? (
                  <Alert severity="info">You haven't added any favorites yet.</Alert>
                ) : (
                  <List>
                    {favoriteMovies.map((movie) => (
                      <ListItem 
                        key={movie.id}
                        divider
                        secondaryAction={
                          <Button 
                            color="error" 
                            size="small"
                            onClick={() => handleRemoveFromFavorites(movie.id)}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText 
                          primary={
                            <Link 
                              to={`/movie/${movie.id}`} 
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <Typography variant="body1" color="primary" component="span">
                                {movie.title}
                              </Typography>
                            </Link>
                          }
                          secondary={`${movie.release_year} • ${movie.director}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>
              
              {/* Watchlist Tab */}
              <TabPanel value={tabValue} index={2}>
                {watchlist.length === 0 ? (
                  <Alert severity="info">Your watchlist is empty.</Alert>
                ) : (
                  <List>
                    {watchlist.map((movie) => (
                      <ListItem 
                        key={movie.id}
                        divider
                        secondaryAction={
                          <Button 
                            color="error" 
                            size="small"
                            onClick={() => handleRemoveFromWatchlist(movie.id)}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText 
                          primary={
                            <Link 
                              to={`/movie/${movie.id}`} 
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <Typography variant="body1" color="primary" component="span">
                                {movie.title}
                              </Typography>
                            </Link>
                          }
                          secondary={`${movie.release_year} • ${movie.director}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>
      
      {/* Password Change Dialog */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({
              ...passwordData,
              currentPassword: e.target.value
            })}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({
              ...passwordData,
              newPassword: e.target.value
            })}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default UserProfile;