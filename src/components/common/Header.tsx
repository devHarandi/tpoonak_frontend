import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles/Header.module.css';
import { removeToken } from '@/utils/storage';
import { getProfile } from '@/services/user';
import { GetProfileResponse } from '@/types/user';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<GetProfileResponse['data'] | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile and handle errors
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        setProfile(response.data);

        // Check if first_name and last_name are empty
        const { first_name, last_name } = response.data.profile;
        if (!first_name && !last_name) {
          router.push('/editprofile');
        }
      } 
      catch (err: any) 
      {
        if (err.isNetworkError) 
        {
          setSnackbar({
            open: true,
            message: err.message || 'اتصال به اینترنت قطع شده است. لطفاً اتصال خود را بررسی کنید.',
            severity: 'error',
          });
        } 
        else if (err.response?.status === 403 || err.response?.status === 401) 
        {
          setTimeout(() => {
            removeToken();
            router.push('/login');
          }, 2000);
        } 
        else 
        {
          setSnackbar({
            open: true,
            message: 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSnackbar({
        open: true,
        message: 'اتصال به اینترنت برقرار شد.',
        severity: 'success',
      });
    };

    const handleOffline = () => {
      setSnackbar({
        open: true,
        message: 'اتصال به اینترنت قطع شده است. لطفاً اتصال خود را بررسی کنید.',
        severity: 'error',
      });
    };

    // Initial check for network status
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleMenuItemClick = (item: string) => {
    console.log(`${item} کلیک شد`);
    setOpen(false);
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  // Define base menu items
  const baseMenuItems = [
    { text: 'خانه', id: 'home', icon: <HomeIcon />, link: '/home' },
    { text: 'حساب کاربری', id: 'account', icon: <PersonIcon />, link: '/profile' },
    { text: 'درباره ما', id: 'about', icon: <InfoIcon />, link: '/about' },
    { text: 'قوانین و مقررات', id: 'rules', icon: <GavelIcon />, link: '/rules' },
    { text: 'سفارشات من', id: 'orders', icon: <AssignmentIcon />, link: '/myorders' },
  ];

  // Conditional admin menu items
  const adminMenuItems = profile?.profile.roles.some(role => role.name === 'Admin') ? [
    { text: 'گزارش مالی', id: 'financial-report', icon: <AssessmentIcon />, link: '/admin/transactions' },
    { text: 'مدیریت کاربران', id: 'user-management', icon: <GroupIcon />, link: '/admin/users' },
    { text: 'مدیریت سفارشات', id: 'order-management', icon: <AssignmentIcon />, link: '/admin/orders' },
  ] : [];

  const exitMenuItem = [{ text: 'خروج', id: 'logout', icon: <ExitToAppIcon />, link: '/login' }];

  // Combine menu items
  const menuItems = [...baseMenuItems, ...adminMenuItems, ...exitMenuItem];

  // Get display name
  const getDisplayName = (): string => {
    if (!profile) return 'کاربر سیستم';
    const { first_name, last_name } = profile.profile;
    return first_name || last_name ? `${first_name} ${last_name}`.trim() : 'کاربر سیستم';
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a', textAlign: 'right' }}>
          در حال بارگذاری...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        className={styles.header}
        sx={{
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1100,
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          minHeight: '60px',
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Tipax Logo"
          width={50}
          height={34}
          className={styles.logo}
        />
        <Typography
          variant="h6"
          className={styles.title}
          sx={{ fontFamily: 'IranYekan, sans-serif', fontWeight: 'bold', color: '#00784a', flexGrow: 1, textAlign: 'center' }}
        >
          {title}
        </Typography>
        <IconButton onClick={toggleDrawer} className={styles.menuButton}>
          <MenuIcon sx={{ color: '#767676', fontSize: 30 }} />
        </IconButton>
      </Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: 'min(100vw, 430px)', sm: 'min(100vw, 430px)' },
            maxWidth: '430px',
            bgcolor: '#ffffff',
            color: '#000000',
            height: '100%',
            overflowX: 'hidden',
            fontFamily: 'IranYekan, sans-serif',
          },
        }}
      >
        <Box sx={{ p: 0, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={toggleDrawer}
              sx={{ zIndex: 1, width: 40, height: 40 }}
            >
              <ArrowBackIcon sx={{ color: '#000000', fontSize: 24 }} />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'IranYekan, sans-serif',
                fontWeight: 'bold',
                color: '#000000',
                flexGrow: 1,
                textAlign: 'right',
              }}
            >
              تنظیمات تیپاکس پونک
            </Typography>
            <Box sx={{ width: 40, height: 40 }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, direction: 'rtl' }}>
            <AccountCircleIcon sx={{ color: '#757575', fontSize: 48, mr: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'IranYekan, sans-serif',
                  color: '#2e2e2e',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  mr: 1,
                }}
              >
                {getDisplayName()}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'IranYekan, sans-serif',
                  color: '#9f9c9c',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mr: 1,
                }}
              >
                {profile?.profile.mobile || 'نامشخص'}
              </Typography>
            </Box>
          </Box>
          <div style={{ height: '10px', backgroundColor: 'rgb(248, 248, 248)', width: '100%', padding: 0, margin: 0 }}></div>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.id}
                onClick={item.id === 'logout' ? handleLogout : () => handleMenuItemClick(item.text)}
                sx={{ justifyContent: 'flex-end' }}
                {...(item.link ? { component: Link, href: item.link } : {})}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontFamily: 'IranYekan, sans-serif',
                    fontWeight: 'medium',
                    color: '#000000',
                    textAlign: 'right',
                  }}
                />
                <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'flex-end' }}>
                  {item.icon}
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            fontFamily: 'IranYekan, sans-serif',
            bgcolor: snackbar.severity === 'error' ? '#ffebee' : '#00784a',
            color: snackbar.severity === 'error' ? '#fbd700' : '#fff',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'error' ? '#fbd700' : '#fff',
            },
            textAlign: 'right',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;