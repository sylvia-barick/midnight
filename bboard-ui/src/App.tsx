import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Navbar, Footer } from './components';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { MyNotes } from './pages/MyNotes';
import { Deploy } from './pages/Deploy';
import { About } from './pages/About';

const App: React.FC = () => {
  return (
    <Router>
      <Box
        sx={{
          background: '#030308',
          minHeight: '100vh',
          color: '#fff',
          fontFamily: '"Outfit", "Space Grotesk", sans-serif',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        {/* Background Animated Blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            height: '60vh',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, rgba(0,0,0,0) 60%)',
            filter: 'blur(120px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Navbar />

        <Container
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pb: 6,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes" element={<MyNotes />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Container>

        <Footer />
      </Box>
    </Router>
  );
};

export default App;
