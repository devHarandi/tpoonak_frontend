import { useRouter } from 'next/router';
import { Box, IconButton, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

type NavItem = {
  label: string;
  route: string;
  icon: typeof HomeOutlinedIcon;
  primary?: boolean;
};

const navItems: NavItem[] = [
  { label: 'خانه', route: '/home', icon: HomeOutlinedIcon },
  { label: 'سفارش‌ها', route: '/myorders', icon: ReceiptLongOutlinedIcon },
  { label: 'ثبت مرسوله', route: '/createorder', icon: AddBoxRoundedIcon, primary: true },
  { label: 'پروفایل', route: '/profile', icon: PersonOutlineIcon },
];

const CustomBottomNavigation = () => {
  const router = useRouter();
  const currentPath = router.asPath.split('?')[0];

  return (
    <Box
      component="nav"
      aria-label="ناوبری اصلی"
      sx={{
        position: 'fixed',
        bottom: 'max(12px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(calc(100% - 24px), 600px)',
        zIndex: 1200,
        direction: 'rtl',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center',
          gap: 0.5,
          minHeight: 70,
          px: 1,
          py: 0.75,
          border: '1px solid rgba(8,120,79,0.13)',
          borderRadius: '22px',
          background: 'rgba(255,255,255,0.94)',
          boxShadow: '0 16px 36px rgba(22, 50, 38, 0.16)',
          backdropFilter: 'blur(18px)',
        }}
      >
        {navItems.map(({ label, route, icon: Icon, primary }) => {
          const selected = currentPath === route || currentPath.startsWith(`${route}/`);
          return (
            <IconButton
              key={route}
              onClick={() => router.push(route)}
              aria-label={label}
              aria-current={selected ? 'page' : undefined}
              sx={{
                minWidth: 0,
                width: '100%',
                height: 58,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                color: selected ? '#075c3e' : '#87958d',
                borderRadius: '16px',
                '&:hover': { background: '#f3f8f5' },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: primary ? 42 : 30,
                  height: primary ? 42 : 30,
                  borderRadius: primary ? '14px' : '10px',
                  color: primary ? '#17231e' : 'currentColor',
                  background: primary ? '#f4c400' : selected ? '#e6f4ee' : 'transparent',
                  boxShadow: primary ? '0 6px 14px rgba(244,196,0,0.28)' : 'none',
                  transform: primary ? 'translateY(-12px)' : 'none',
                }}
              >
                <Icon sx={{ fontSize: primary ? 25 : 23 }} />
              </Box>
              <Typography
                sx={{
                  mt: primary ? -1 : 0,
                  color: 'inherit',
                  fontFamily: 'iranYekan, sans-serif',
                  fontSize: 10,
                  fontWeight: selected || primary ? 800 : 600,
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Typography>
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
};

export default CustomBottomNavigation;
