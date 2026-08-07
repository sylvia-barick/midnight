import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShieldIcon from '@mui/icons-material/Shield';
import { NavLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export const Navbar: React.FC = () => {
  const { isConnected, walletAddress } = useWallet();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Notes', path: '/notes' },
    { label: 'Deploy Contract', path: '/deploy' },
    { label: 'About', path: '/about' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? '#6366f1' : '#ffffff',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.95rem',
    position: 'relative' as const,
    padding: '6px 12px',
    transition: 'all 0.3s ease',
  });

  return (
    <AppBar position="sticky" sx={{ background: 'rgba(3, 3, 8, 0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: 'none' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '70px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }} component={NavLink} to="/">
            <Box
              sx={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              <ShieldIcon sx={{ color: '#fff', fontSize: '20px' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: '800', letterSpacing: '0.5px', background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SECRET NOTES
            </Typography>
          </Box>

          {/* Desktop Nav Items */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} style={navLinkStyle}>
                  {item.label}
                </NavLink>
              ))}
            </Box>
          )}

          {/* Desktop Wallet Button / Mobile Menu Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isConnected && !isMobile && (
              <Box
                sx={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {walletAddress ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}` : 'Connected'}
                </Typography>
              </Box>
            )}

            {isMobile ? (
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            ) : null}
          </Box>
        </Toolbar>
      </Container>

      {/* Drawer for Mobile Navigation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 250,
              background: 'rgba(3, 3, 8, 0.95)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
            },
          },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Menu
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={NavLink} to={item.path} sx={{ borderRadius: '8px', mb: 1 }}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};
