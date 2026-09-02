import { ReactElement, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Image from 'next/image';
import styles from './styles/Header.module.css';
import { removeToken } from '@/utils/storage';
import { getProfile } from '@/services/user';
import { GetProfileResponse } from '@/types/user';

interface HeaderProps {
  title: string;
}

type MenuItem = {
  text: string;
  id: string;
  icon: ReactElement;
  link?: string;
  danger?: boolean;
};

const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<GetProfileResponse['data'] | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        setProfile(response.data);

        const { first_name, last_name, customer_type, company_name } = response.data.profile;
        const needsProfileCompletion =
          !first_name?.trim() ||
          !last_name?.trim() ||
          (customer_type === 'company' && !company_name?.trim());

        if (needsProfileCompletion && pathname !== '/editprofile') {
          router.push('/editprofile');
        }
      } catch (err: any) {
        if (err.isNetworkError) {
          setSnackbar({
            open: true,
            message: err.message || 'اتصال به اینترنت قطع شده است.',
            severity: 'error',
          });
        } else if (err.response?.status === 403 || err.response?.status === 401) {
          setTimeout(() => {
            removeToken();
            router.push('/login');
          }, 1200);
        } else {
          setSnackbar({
            open: true,
            message: 'دریافت اطلاعات کاربر با خطا مواجه شد.',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [pathname, router]);

  useEffect(() => {
    const handleOnline = () => setSnackbar({
      open: true,
      message: 'اتصال به اینترنت برقرار شد.',
      severity: 'success',
    });
    const handleOffline = () => setSnackbar({
      open: true,
      message: 'اتصال به اینترنت قطع شده است.',
      severity: 'error',
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getDisplayName = () => {
    if (!profile) return 'کاربر سیستم';
    const { first_name, last_name } = profile.profile;
    return first_name || last_name ? `${first_name} ${last_name}`.trim() : 'کاربر سیستم';
  };

  const baseMenuItems: MenuItem[] = [
    { text: 'خانه', id: 'home', icon: <HomeOutlinedIcon />, link: '/home' },
    { text: 'حساب کاربری', id: 'account', icon: <PersonOutlineIcon />, link: '/profile' },
    { text: 'سفارشات من', id: 'orders', icon: <ReceiptLongOutlinedIcon />, link: '/myorders' },
    { text: 'درباره ما', id: 'about', icon: <InfoOutlinedIcon />, link: '/about' },
    { text: 'قوانین و مقررات', id: 'rules', icon: <GavelOutlinedIcon />, link: '/rules' },
  ];

  const adminMenuItems: MenuItem[] = profile?.profile.roles.some((role) => role.name === 'Admin')
    ? [
        { text: 'گزارش مالی', id: 'financial-report', icon: <AssessmentOutlinedIcon />, link: '/admin/transactions' },
        { text: 'مدیریت کاربران', id: 'user-management', icon: <GroupOutlinedIcon />, link: '/admin/users' },
        { text: 'مدیریت سفارشات', id: 'order-management', icon: <LocalShippingOutlinedIcon />, link: '/admin/orders' },
      ]
    : [];

  const menuItems: MenuItem[] = [
    ...baseMenuItems,
    ...adminMenuItems,
    { text: 'خروج از حساب', id: 'logout', icon: <LogoutRoundedIcon />, danger: true },
  ];

  const handleNavigate = (item: MenuItem) => {
    setOpen(false);
    if (item.id === 'logout') {
      removeToken();
      router.push('/login');
      return;
    }
    if (item.link) router.push(item.link);
  };

  return (
    <>
      <Box className={styles.header} component="header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box className={styles.brandMark}>
            <Image src="/images/logo.png" alt="لوگوی تیپاکس پونک" width={34} height={34} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography className={styles.brandName}>تیپاکس پونک</Typography>
            <Typography className={styles.pageTitle}>{title.replace('تیپاکس پونک - ', '')}</Typography>
          </Box>
        </Box>
        <IconButton
          onClick={() => setOpen(true)}
          className={styles.menuButton}
          aria-label="باز کردن منوی کاربری"
        >
          <MenuRoundedIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ className: styles.drawerPaper }}
      >
        <Box className={styles.drawerHeader}>
          <IconButton onClick={() => setOpen(false)} className={styles.drawerClose} aria-label="بستن منو">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography className={styles.drawerTitle}>منوی کاربری</Typography>
        </Box>

        <Box className={styles.profileSummary}>
          <Avatar
            src={profile?.profile.profile_image || undefined}
            alt="تصویر پروفایل"
            className={styles.profileAvatar}
          >
            {getDisplayName().charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography className={styles.profileName}>{getDisplayName()}</Typography>
            <Typography className={styles.profileMobile} dir="ltr">
              {profile?.profile.mobile || 'شماره ثبت نشده'}
            </Typography>
          </Box>
        </Box>

        <List className={styles.menuList}>
          {menuItems.map((item) => {
            const selected = Boolean(item.link && (pathname === item.link || pathname.startsWith(`${item.link}/`)));
            return (
              <ListItemButton
                key={item.id}
                selected={selected}
                onClick={() => handleNavigate(item)}
                className={`${styles.menuItem} ${item.danger ? styles.dangerItem : ''}`}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ className: styles.menuItemText }}
                />
                <ListItemIcon className={styles.menuItemIcon}>{item.icon}</ListItemIcon>
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          sx={{ bgcolor: snackbar.severity === 'error' ? '#fff1f1' : '#e6f4ee', color: snackbar.severity === 'error' ? '#b42318' : '#075c3e' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
