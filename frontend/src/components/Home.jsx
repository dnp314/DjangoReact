import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import MovieCard from './MovieCard';
import { AuthContext } from '../contexts/AuthContext';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/movies/');
        setMovies(response.data.results || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      if (currentUser) {
        try {
          const response = await axios.get('http://localhost:8000/api/movies/personalized/');
          setRecommendations(response.data);
        } catch (error) {
          console.error('Error fetching personalized recommendations:', error);
        }
      }
    };

    fetchMovies();
    fetchRecommendations();
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(to right, #1976d2, #0a4777)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Movie Recommender
        </Typography>
        <Typography variant="body1">
          Discover new movies tailored to your taste. Rate movies to get personalized recommendations.
        </Typography>
      </Paper>

      {currentUser && recommendations.length > 0 && (
        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            centered
          >
            <Tab label="All Movies" />
            <Tab label="Recommended For You" />
          </Tabs>
        </Box>
      )}

      {tabValue === 0 || !currentUser ? (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
            Popular Movies
          </Typography>
          <Grid container spacing={3}>
            {movies.map((movie) => (
              <Grid item key={movie.imdb_id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
            Recommendations For You
          </Typography>
          <Grid container spacing={3}>
            {recommendations.map((movie) => (
              <Grid item key={movie.imdb_id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Home;