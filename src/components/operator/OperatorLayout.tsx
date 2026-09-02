import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { removeToken } from '@/utils/storage';
import styles from './styles/Operator.module.css';

export type OperatorSection = 'dashboard' | 'orders' | 'users' | 'transactions' | 'settings';

interface OperatorProfile {
  first_name: string;
  last_name: string;
  profile_image: string | null;
  roles: Array<{ id: number; name: string }>;
}

interface OperatorLayoutProps {
  profile: OperatorProfile;
  activeSection: OperatorSection;
  onSectionChange: (section: OperatorSection) => void;
  children: ReactNode;
}

const navigation: Array<{ id: OperatorSection; label: string; icon: ReactNode }> = [
  { id: 'dashboard', label: 'نمای کلی', icon: <DashboardOutlinedIcon /> },
  { id: 'orders', label: 'مدیریت سفارش‌ها', icon: <LocalShippingOutlinedIcon /> },
  { id: 'users', label: 'کاربران و مشتریان', icon: <GroupOutlinedIcon /> },
  { id: 'transactions', label: 'تراکنش‌های مالی', icon: <AccountBalanceWalletOutlinedIcon /> },
  { id: 'settings', label: 'تنظیمات سیستم', icon: <SettingsOutlinedIcon /> },
];

export default function OperatorLayout({
  profile,
  activeSection,
  onSectionChange,
  children,
}: OperatorLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'اپراتور سیستم';
  const roleLabel = 'اپراتور عملیات';

  const handleNavigate = (section: OperatorSection) => {
    onSectionChange(section);
    setMobileOpen(false);
    router.push(`/operator/?section=${section}`);
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const sidebar = (
    <Box className={styles.sidebarContent} dir="rtl">
      <Box className={styles.sidebarBrand}>
        <Box className={styles.brandMark}>
          <Image src="/images/logo.png" alt="لوگوی تیپاکس پونک" width={42} height={42} />
        </Box>
        <Box>
          <Typography className={styles.brandName}>تیپاکس پونک</Typography>
          <Typography className={styles.brandCaption}>مرکز عملیات</Typography>
        </Box>
        <IconButton
          className={styles.mobileClose}
          onClick={() => setMobileOpen(false)}
          aria-label="بستن منوی پنل"
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Box className={styles.operatorIdentity}>
        <Avatar src={profile.profile_image || undefined} className={styles.operatorAvatar}>
          {displayName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography className={styles.operatorName}>{displayName}</Typography>
          <Typography className={styles.operatorRole}>{roleLabel}</Typography>
        </Box>
      </Box>

      <Typography className={styles.navigationLabel}>دسترسی سریع</Typography>
      <List className={styles.navigationList} disablePadding>
        {navigation.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeSection === item.id}
            onClick={() => handleNavigate(item.id)}
            className={styles.navigationItem}
          >
            <ListItemIcon className={styles.navigationIcon}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ className: styles.navigationText }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box className={styles.sidebarFooter}>
        <Divider className={styles.sidebarDivider} />
        <Button
          fullWidth
          startIcon={<LogoutRoundedIcon />}
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          خروج از پنل
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className={styles.operatorShell} dir="rtl">
      <aside className={styles.desktopSidebar}>{sidebar}</aside>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ className: styles.mobileDrawer }}
      >
        {sidebar}
      </Drawer>

      <Box component="main" className={styles.mainArea}>
        <Box component="header" className={styles.topbar}>
          <Box className={styles.topbarTitle}>
            <IconButton
              className={styles.mobileMenuButton}
              onClick={() => setMobileOpen(true)}
              aria-label="باز کردن منوی پنل"
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box>
              <Typography className={styles.topbarEyebrow}>پنل مدیریت و عملیات</Typography>
              <Typography className={styles.topbarHeading}>
                {navigation.find((item) => item.id === activeSection)?.label || 'نمای کلی'}
              </Typography>
            </Box>
          </Box>
          <Box className={styles.topbarMeta}>
            <Typography className={styles.liveDot}>●</Typography>
            <Typography className={styles.liveText}>سامانه فعال است</Typography>
            <Avatar src={profile.profile_image || undefined} className={styles.topbarAvatar}>
              {displayName.charAt(0)}
            </Avatar>
          </Box>
        </Box>
        <Box className={styles.pageContent}>{children}</Box>
      </Box>
    </Box>
  );
}
