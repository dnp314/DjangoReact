import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  Pagination 
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import MovieCard from './MovieCard';

const RecommendedMovies = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  
  const { user, isAuthenticated, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/api/movies/recommendations/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        setRecommendations(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated, token]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current page items
  const currentPageItems = recommendations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Please log in to see personalized movie recommendations.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Recommended For You
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : recommendations.length === 0 ? (
        <Alert severity="info">
          Rate more movies to get personalized recommendations!
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentPageItems.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
          
          {recommendations.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default RecommendedMovies;