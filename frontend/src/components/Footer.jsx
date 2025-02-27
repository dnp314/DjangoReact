import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body1">
            © {new Date().getFullYear()} Movie Recommender App
          </Typography>
          
          <Box>
            <IconButton color="inherit" aria-label="GitHub">
              <GitHubIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="LinkedIn">
              <LinkedInIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Twitter">
              <TwitterIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              About
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              Privacy
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;