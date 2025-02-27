import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import MovieDetail from './components/MovieDetail';
import LoginRegister from './components/LoginRegister';
import RecommendedMovies from './components/RecommendedMovies';
import SearchMovies from './components/SearchMovies';
import UserProfile from './components/UserProfile';
import NotFound from './components/NotFound';
import Footer from './components/Footer';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
});

// App component
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 120px)', paddingTop: '64px', paddingBottom: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/recommendations" element={<RecommendedMovies />} />
              <Route path="/search" element={<SearchMovies />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;