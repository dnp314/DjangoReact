import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import MovieCard from './MovieCard';

const SearchMovies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const handleSearch = async (e) => {
    e.preventDefault();
  
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
  
    try {
      const response = await axios.get(`http://localhost:8000/api/movies/`, {
        params: { search: searchTerm }
      });

      console.log('API Response:', response.data);

      const movieResults = Array.isArray(response.data) ? response.data : [];
      setMovies(movieResults);
      setTotalPages(Math.ceil(movieResults.length / itemsPerPage));
      setPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ensure movies is always an array before slicing
  const currentPageItems = (Array.isArray(movies) ? movies : []).slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Movies
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="search-type-label">Search By</InputLabel>
              <Select
                labelId="search-type-label"
                value={searchType}
                label="Search By"
                onChange={(e) => setSearchType(e.target.value)}
              >
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="director">Director</MenuItem>
                <MenuItem value="actor">Actor</MenuItem>
                <MenuItem value="genre">Genre</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : searched && movies.length === 0 ? (
        <Alert severity="info">No movies found matching your search criteria.</Alert>
      ) : movies.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Found {movies.length} movies
          </Typography>
          
          <Grid container spacing={3}>
            {currentPageItems.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
          
          {movies.length > itemsPerPage && (
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
      ) : null}
    </Container>
  );
};

export default SearchMovies;
