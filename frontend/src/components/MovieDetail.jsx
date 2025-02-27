import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Paper,
  Rating,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  BookmarkAdd as BookmarkAddIcon,
  BookmarkRemove as BookmarkRemoveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/movies/${id}/`);
        setMovie(response.data);
        setUserRating(response.data.user_rating || 0);
        setInWatchlist(response.data.in_watchlist || false);
        
        // Fetch recommendations based on this movie
        const recResponse = await axios.get(`http://localhost:8000/api/movies/recommendations/?movie_id=${id}`);
        setRecommendations(recResponse.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleRatingChange = async (event, newValue) => {
    if (!currentUser) return;
    
    try {
      await axios.post(`http://localhost:8000/api/movies/${id}/rate/`, {
        rating: newValue * 2  // Convert 0-5 to 0-10 scale
      });
      setUserRating(newValue);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!currentUser) return;
    
    try {
      const action = inWatchlist ? 'remove' : 'add';
      await axios.post(`http://localhost:8000/api/movies/${id}/watchlist/`, {
        action
      });
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>Movie not found</Typography>
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Home
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Movie Poster */}
          <Grid item xs={12} md={4}>
            <img
              src={movie.poster_url || '/images/default-movie.jpg'}
              alt={movie.name}
              style={{ 
                width: '100%', 
                maxHeight: '500px', 
                objectFit: 'cover',
                borderRadius: '8px' 
              }}
              onError={(e) => {
                e.target.src = '/images/default-movie.jpg';
              }}
            />
            
            {currentUser && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color={inWatchlist ? "error" : "primary"}
                  startIcon={inWatchlist ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
                  onClick={handleWatchlistToggle}
                  fullWidth
                >
                  {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography component="legend">Your Rating:</Typography>
                  <Rating
                    name="user-rating"
                    value={userRating}
                    precision={0.5}
                    onChange={handleRatingChange}
                  />
                </Box>
              </Box>
            )}
          </Grid>
          
          {/* Movie Details */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {movie.name} {movie.year && `(${movie.year})`}
            </Typography>
            
            {movie.genres?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {movie.genres.map((genre, index) => (
                  <Chip key={index} label={genre} variant="outlined" size="small" />
                ))}
              </Box>
            )}
            
            {movie.rating_value && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating 
                  value={movie.rating_value / 2} 
                  precision={0.1} 
                  readOnly 
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {(movie.rating_value / 2).toFixed(1)} ({movie.rating_count} ratings)
                </Typography>
              </Box>
            )}
            
            {(movie.certificate || movie.runtime) && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {movie.certificate && `${movie.certificate} • `}{movie.runtime && `${movie.runtime}`}
              </Typography>
            )}
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {movie.summary_text && movie.summary_text !== 'Add a Plot' 
                ? movie.summary_text 
                : 'No plot summary available for this movie.'}
            </Typography>
            
            {movie.director && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Director:</strong> {movie.director.name}
              </Typography>
            )}
            
            {movie.cast?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Cast</Typography>
                <Grid container spacing={1}>
                  {movie.cast.map((actor, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                          {actor.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{actor.name}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            You May Also Like
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((rec) => (
              <Grid item key={rec.imdb_id} xs={12} sm={6} md={4} lg={3}>
                <Paper 
                  component={Link} 
                  to={`/movie/${rec.imdb_id}`}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                    }
                  }}
                >
                  <img
                    src={rec.poster_url || '/images/default-movie.jpg'}
                    alt={rec.name}
                    style={{ width: '60px', height: '90px', objectFit: 'cover', marginRight: '12px' }}
                    onError={(e) => {
                      e.target.src = '/images/default-movie.jpg';
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" noWrap>{rec.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{rec.year}</Typography>
                    {rec.rating_value && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Rating value={rec.rating_value / 2} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {(rec.rating_value / 2).toFixed(1)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default MovieDetail;