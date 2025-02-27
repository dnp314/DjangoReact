import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center'
        }}
      >
        <MovieFilterIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          size="large"
          sx={{ minWidth: 200 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;