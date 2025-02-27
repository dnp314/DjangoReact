import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Chip,
  Rating,
  CardActionArea,
  CardActions
} from '@mui/material';
import { 
  Bookmark as BookmarkIcon, 
  BookmarkBorder as BookmarkBorderIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const MovieCard = ({ movie }) => {
  const { currentUser } = useContext(AuthContext);
  const [inWatchlist, setInWatchlist] = React.useState(movie.in_watchlist);
  
  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) return;
    
    try {
      const action = inWatchlist ? 'remove' : 'add';
      await axios.post(`http://localhost:8000/api/movies/${movie.imdb_id}/watchlist/`, {
        action
      });
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };
  
  // Display only first 3 genres
  const displayGenres = movie.genres?.slice(0, 3) || [];

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.03)',
        }
      }}
    >
      <CardActionArea component={Link} to={`/movie/${movie.imdb_id}`}>
        <CardMedia
          component="img"
          height="300"
          image={movie.poster_url || '/images/default-movie.jpg'}
          alt={movie.name}
          onError={(e) => {
            e.target.src = '/images/default-movie.jpg';
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {movie.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {movie.year}
          </Typography>
          
          {displayGenres.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {displayGenres.map((genre, index) => (
                <Chip 
                  key={index} 
                  label={genre} 
                  size="small" 
                  variant="outlined"
                  sx={{ marginBottom: '5px' }}
                />
              ))}
            </Box>
          )}
          
          {movie.rating_value && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating 
                value={movie.rating_value / 2} 
                precision={0.1} 
                size="small" 
                readOnly 
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {(movie.rating_value / 2).toFixed(1)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing>
        {currentUser && (
          <IconButton 
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            onClick={handleWatchlistToggle}
            color={inWatchlist ? "primary" : "default"}
          >
            {inWatchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

export default MovieCard;